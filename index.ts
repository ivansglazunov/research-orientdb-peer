import * as _ from 'lodash';
import * as OrientDB from 'orientjs';

import { Asket, IQueryStep } from 'ancient-asket/lib/asket';
import { Node } from 'ancient-mixins/lib/node';
import { Peer } from 'ancient-peer/lib/peer';

var server = OrientDB({
  host:       'localhost',
  port:       2424,
  username:   'root',
  password:   'root',
  useToken: true,
});

var db = server.use({
  name:     'GratefulDeadConcerts',
  username: 'root',
  password: 'root',
});

class Subscription extends Node {
  constructor(from, where) {
    super();

    this.from = from;
    this.where = where;
    this.rids = [];

    this['outer-update'] = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      db.query(`select from ${this.from} where @rid=${rid}`).then((data) => {
        this.emit('removed', { rid, data });
      });
      _.remove(this.rids, r => r == rid);
      this.resubscribe();
    };

    this['inner-insert'] = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      db.query(`select from ${this.from} where @rid=${rid}`).then((data) => {
        this.emit('added', { rid, data });
      });
      this.rids.push(rid);
      this.resubscribe();
    };

    this['inner-update'] = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      if (!_.includes(this.rids, rid)) {
        db.query(`select from ${this.from} where @rid=${rid}`).then((data) => {
          this.emit('added', { rid, data });
        });
        this.rids.push(rid);
        this.resubscribe();
      } else {
        db.query(`select from ${this.from} where @rid=${rid}`).then((data) => {
          this.emit('changed', { rid, data });
        });
      }
    };

    this['inner-delete'] = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      this.emit('removed', { rid });
      _.remove(this.rids, r => r == rid);
    };

    return this;
  }

  select(callback?) {
    db.query(`select from ${this.from} where ${this.where}`).then((data) => {
      this.emit('selected', { subscription: this, data });
      this.rids = _.map(data, d => d['@rid'].toString());
      this.resubscribe();
      if (callback) callback(data);
    });
    return this;
  }

  resubscribe() {
    this.unsubscribe();

    this.outer = db.liveQuery(`live select from ${this.from} where @rid in [${this.rids.join(',')}] and not (${this.where})`)
    .on('live-update', this['outer-update'])

    this.inner = db.liveQuery(`live select from ${this.from} where ${this.where}`)
    .on('live-insert', this['inner-insert'])
    .on('live-update', this['inner-update'])
    .on('live-delete', this['inner-delete'])

    return this;
  }

  unsubscribe() {
    if (this.outer) {
      this.outer.removeListener('live-update', this['outer-update']);
    }

    if (this.inner) {
      this.inner.removeListener('live-insert', this['inner-insert']);
      this.inner.removeListener('live-update', this['inner-update']);
      this.inner.removeListener('live-delete', this['inner-delete']);
    }
  }
}

function sync(
  channelId, cursorId, query, path,
  schema,
  callback,
) {
  const Sub = new Subscription(query.from, query.where)
  .on('added', ({ rid }) => {
    db.query(`select from ${query.from} where @rid=${rid}`)
    .then(data => crop(schema, 'record', data)).then(({ data }) => {
      peer.sendBundles(channelId, {
        type: 'splice', path: path, cursorId,
        start: Sub.rids.length-1, deleteCount: 0, values: data,
      });
    });
  })
  .on('changed', ({ rid }) => {
    db.query(`select from ${query.from} where @rid=${rid}`)
    .then(data => crop(schema, 'record', data)).then(({ data }) => {
      peer.sendBundles(channelId, {
        type: 'set', path: [...path, { '@rid': rid }], cursorId,
        value: data[0],
      });
    });
  })
  .on('removed', ({ rid }) => {
    peer.sendBundles(channelId, {
      type: 'remove', path: path, cursorId,
      selector: { '@rid': rid },
    });
  })
  .select((data) => {
    crop(schema, 'records', data).then(({ data }) => {
      peer.sendBundles(channelId, {
        type: 'set', path: path, cursorId,
        value: data,
      });
      callback(data);
    });
  });
  return Sub;
}

const Resolver = (getData) => (schema, data, env, steps: IQueryStep[]) => {
  return new Promise(((resolve) => {
    if (env === 'root') {
      if (!steps.length) {
        resolve({ env: 'root', data: {} });
      } else if (schema.name === 'query') {
        getData(schema, data, env, steps).then(data => resolve({ env: 'records', data }));
      } else {
        resolve({ dontExec: true, data: undefined });
      }
    } else if (env === 'records') {
      resolve({ env: 'record', data });
    } else {
      resolve({ dontExec: true, data });
    }
  }));
}

function crop(schema, env, data) {
  return new Asket(
    { schema }, 
    Resolver(() => new Promise(r => r([]))),
    env,
    data,
  ).exec();
}

const api = (() => {
  const cursors = [];
  return {
    gotQuery: (channelId, { cursorId, query, queryId }) => {
      const cursor = { cursorId, channelId, synced: [] };
      cursors.push(cursor);

      new Asket(
        query, 
        Resolver((schema, data, env, steps: IQueryStep[]) => {
          return new Promise((resolve) => {
            cursor.synced.push(sync(
              channelId, cursorId,
              schema.options, [_.map(steps, s => s.key).join('.')], schema,
              (data) => {
                resolve(data);
              },
            ));
          });
        }),
        'root',
        {},
      ).exec();
    },
    cursorDestroyed: (channelId, cursorId) => {
      _.remove(cursors, (c: any) => {
        const result = c.cursorId == cursorId && c.channelId == channelId;
        if (result) _.each(c.synced, s => s.unsubscribe());
        return result;
      });
    },
    channelDestroyed: (channelId) => {
      _.remove(cursors, (c: any) => {
        const result = c.channelId == channelId;
        if (result) _.each(c.synced, s => s.unsubscribe());
        return result;
      });
    },
  }
})();

class AppPeer extends Peer {
	getApiCallbacks(apiQuery, callback) {
		callback(api);
  }
}

const peer = new AppPeer();

const channelId = peer.connect(peer);

const cursor = peer.exec(channelId, null, { schema: { fields: {
  x: { name: 'query', options: { from: 'Test', where: 'value > 7' }, fields: { '@rid': true, value: true } },
}}});
cursor.on('changed', () => {
  console.log(cursor.data);
})