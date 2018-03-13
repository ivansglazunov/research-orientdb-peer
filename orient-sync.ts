import * as _ from 'lodash';

import { Node } from 'ancient-mixins/lib/node';

class OrientSync extends Node {
  constructor(
    public db,
    public from: string,
    public where: string,
  ) {
    super();

    this.outerUpdate = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      this.removed(rid);
      this.resubscribe();
    }
  
    this.innerInsert = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      this.added(rid);
      this.resubscribe();
    }
  
    this.innerUpdate = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      if (!_.includes(this.rids, rid)) {
        this.added(rid);
        this.resubscribe();
      } else {
        this.changed(rid);
      }
    }
  
    this.innerDelete = (d) => {
      const rid = `#${d.cluster}:${d.position}`;
      this.removed(rid);
      this.resubscribe();
    }
  }

  rids: string[] = [];

  added(rid, callback?) {
    this.rids.push(rid);
    this.db.query(`select from ${this.from} where @rid=${rid}`)
    .then((record) => {
      this.emit('added', { rid, record: record[0], subscription: this });
      if (callback) callback(rid, record);
    });
  }

  changed(rid, callback?) {
    this.db.query(`select from ${this.from} where @rid=${rid}`)
    .then((record) => {
      this.emit('changed', { rid, record: record[0], subscription: this });
      if (callback) callback(rid, record);
    });
  }

  removed(rid, callback?) {
    this.db.query(`select from ${this.from} where @rid=${rid}`)
    .then((record) => {
      this.emit('removed', { rid, record: record[0], subscription: this });
      if (callback) callback(rid, record);
    });
    _.remove(this.rids, r => r == rid);
  }

  reselect(callback) {
    this.unsubscribe();
    this.select((records) => {
      this.emit('reselected', { records, subscription: this });
      const rids = _.map(records, d => d['@rid'].toString());
      const newRids = _.difference(rids, this.rids);
      const oldRids = _.difference(this.rids, rids);
      _.each(newRids, rid => this.added(rid));
      _.each(oldRids, rid => this.removed(rid));
      this.resubscribe();
      if (callback) callback(records);
    });

    return this;
  }

  select(callback) {
    this.db.query(`select from ${this.from} where ${this.where}`)
    .then((records) => {
      this.emit('selected', { records, subscription: this });
      if (callback) callback(records);
    });

    return this;
  }

  resubscribe() {
    this.unsubscribe();
    
    const outer = `live select from ${this.from} where @rid in [${this.rids.join(',')}] and not (${this.where})`;
    const inner = `live select from ${this.from} where ${this.where}`;
    this.emit('resubscribe', { outer, inner, subscription: this });

    this.outer = this.db.liveQuery(outer)
    .on('live-update', this.outerUpdate)

    this.inner = this.db.liveQuery(inner)
    .on('live-insert', this.innerInsert)
    .on('live-update', this.innerUpdate)
    .on('live-delete', this.innerDelete)

    return this;
  }

  unsubscribe() {
    this.emit('unsubscribe', { subscription: this });

    if (this.outer) {
      this.outer.removeListener('live-update', this.outerUpdate);
    }

    if (this.inner) {
      this.inner.removeListener('live-insert', this.innerInsert);
      this.inner.removeListener('live-update', this.innerUpdate);
      this.inner.removeListener('live-delete', this.innerDelete);
    }

    return this;
  }
}

export {
  OrientSync,
}