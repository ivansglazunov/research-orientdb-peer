import * as _ from 'lodash';

import { Node } from 'ancient-mixins/lib/node';
import { asket, IQueryResolver } from 'ancient-asket/lib/asket';
import { OrientSync } from './orient-sync';

class AsketicOrientSync extends Node {
  constructor(
    public db,
  ) {
    super();
  }

  resolver() {
    const resolver: IQueryResolver = (flow) => new Promise((resolve) => {
      if (flow.name === 'select') {
        const from = _.get(flow, 'schema.options.from');
        const where = _.get(flow, 'schema.options.where');
        if (
          _.isObject(flow.data) || !(from && where)
        ) {
          _.set(flow, 'schema.fields.@rid', {});
    
          const rid = _.toString(_.get(flow, 'data.@rid'));
    
          const env = rid ? { ...flow.env, rid, path: [ ...flow.env.path, { '@rid': rid } ] } : flow.env;
    
          resolve({ ...flow, env });
        } else {
          const parentSync = _.get(flow, 'env.sync');
          const sync = new OrientSync(this.db, from, where);
    
          const path = [ ...flow.env.path, flow.key ];
    
          sync.on('destroyed', () => {
            this.emit('unsync', { flow, path, sync });
            sync.unsubscribe()
          });
          if (parentSync) {
            parentSync.on('destroyed', () => sync.destroy());
            parentSync.on('removed', ({ rid }) => rid == flow.env.rid && sync.destroy());
            parentSync.on('changed', ({ rid }) => rid == flow.env.rid && sync.destroy());
          }
    
          sync.select((records) => {
            sync.rids = _.map(records, d => d['@rid'].toString());
            this.emit('selected', { flow, path, sync });
            sync.resubscribe();
    
            sync.on('added', ({ rid, record }) => {
              asket({
                resolver,
                query: { schema: flow.schema },
                data: record,
                env: { ...flow.env, rid, path: [ ...path, rid ], }
              }).then(({ data }) => {
                this.emit('added', { flow, rid, path, sync, data });
              });
            });
            sync.on('changed', ({ rid, record }) => {
              asket({
                resolver,
                query: { schema: flow.schema },
                data: record,
                env: { ...flow.env, rid, path: [ ...path, rid ], }
              }).then(({ data }) => {
                this.emit('changed', { flow, rid, path, sync, data });
              });
            });
            sync.on('removed', ({ rid, record }) => {
              this.emit('removed', { flow, rid, path, sync });
            });

            resolve({ ...flow, env: { ...flow.env, sync, path }, data: records });
          });
        }
      } else if (flow.name === '@rid') {
        _.unset(flow, 'schema.fields');
        resolve({ ...flow, data: _.toString(flow.data) });
      } else {
        resolve({ ...flow, env: { ...flow.env, path: [ ...flow.env.path, flow.key ] }});
        resolve(flow);
      }
    });

    return resolver;
  }

  ask(query) {
    return asket({
      resolver: this.resolver(),
      query,
      env: { path: [], },
    });
  }
}

export {
  AsketicOrientSync,
}