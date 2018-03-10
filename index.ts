import gql from 'graphql-tag';
import graphql from 'graphql-anywhere';
import * as _ from 'lodash';
import * as OrientDB from 'orientjs';

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
  constructor(className, where) {
    super();

    this.className = className;
    this.where = where;
    this.rids = [];

    this['outer-update'] = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      this.emit('removed', { rid });
      _.remove(this.rids, r => r == rid);
      this.resubscribe();
    };

    this['inner-insert'] = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      this.emit('added', { rid });
      this.rids.push(rid);
      this.resubscribe();
    };

    this['inner-update'] = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      if (!_.includes(this.rids, rid)) {
        this.emit('added', { rid });
        this.rids.push(rid);
        this.resubscribe();
      } else {
        this.emit('changed', { rid });
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
    db.query(`select from ${this.className} where ${this.where}`).then((data) => {
      this.emit('selected', { subscription: this, data });
      this.rids = _.map(data, d => d['@rid'].toString());
      this.resubscribe();
      if (callback) callback(data);
    });
    return this;
  }

  resubscribe() {
    if (this.outer) {
      this.outer.removeListener('live-update', this['outer-update']);
    }

    if (this.inner) {
      this.inner.removeListener('live-insert', this['inner-insert']);
      this.inner.removeListener('live-update', this['inner-update']);
      this.inner.removeListener('live-delete', this['inner-delete']);
    }

    this.outer = db.liveQuery(`live select from ${this.className} where @rid in [${this.rids.join(',')}] and not (${this.where})`)
    .on('live-update', this['outer-update'])

    this.inner = db.liveQuery(`live select from ${this.className} where ${this.where}`)
    .on('live-insert', this['inner-insert'])
    .on('live-update', this['inner-update'])
    .on('live-delete', this['inner-delete'])

    return this;
  }
}

class AppPeer extends Peer {
	getApiCallbacks(apiQuery, callback) {
		callback((() => {
      const cursors = [];
      return {
        gotQuery: (channelId, { cursorId, query, queryId }) => {
          cursors.push({ cursorId, channelId });
          
          const Sub = new Subscription(query.className, query.where)
          .on('added', ({ rid }) => {
            db.query(`select from ${query.className} where @rid=${rid}`)
            .then((data) => {
              this.sendBundles(channelId, {
                type: 'splice',
                path: '',
                start: Sub.rids.length-1,
                deleteCount: 0,
                values: data,
                cursorId,
              });
            });
          })
          .on('changed', ({ rid }) => {
            db.query(`select from ${query.className} where @rid=${rid}`)
            .then((data) => {
              this.sendBundles(channelId, {
                type: 'set',
                path: [{ '@rid': rid }],
                value: data[0],
                cursorId,
              });
            });
          })
          .on('removed', ({ rid }) => {
            this.sendBundles(channelId, {
              type: 'remove',
              path: '',
              selector: { '@rid': rid },
              cursorId,
            });
          })
          .select((data) => {
            this.sendBundles(channelId, {
              type: 'set',
              path: '',
              value: data,
              cursorId,
            });
          });
        },
        cursorDestroyed: (channelId, cursorId) => {
          _.remove(cursors, (c: any) => c.cursorId == cursorId && c.channelId == channelId);
        },
        channelDestroyed: (channelId) => {
          _.remove(cursors, (c: any) => c.channelId == channelId);
        },
      }
    })());
  }
}

const peer = new AppPeer();

const channelId = peer.connect(peer);

const cursor = peer.exec(channelId, null, { className: 'Test', where: 'value > 7' });
cursor.on('changed', () => {
  console.log(cursor.data.map(d => d['@rid']));
})