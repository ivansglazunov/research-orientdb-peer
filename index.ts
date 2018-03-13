import * as util from 'util';
import * as _ from 'lodash';
import * as OrientDB from 'orientjs';

import { asket, IQueryResolver, IQuerySchema } from 'ancient-asket/lib/asket';
import { Peer } from 'ancient-peer/lib/peer';
import { bundleParsers, prepare, IBundleValue, get } from 'ancient-cursor/lib/bundle';
import { Cursor } from 'ancient-cursor/lib/cursor';

import { AsketicOrientSync } from './asketic-orient-sync';

const server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: 'root',
  useToken: true,
});

const db = server.use({
  name: 'GratefulDeadConcerts',
  username: 'root',
  password: 'root',
});

bundleParsers.push = (container, bundle: IBundleValue) => {
  const { oldValue, bundlePath } = prepare(container, bundle);
  const value = get(container.data, bundlePath);
  
  if (!_.isArray(value)) {
    throw new Error(`Data by path "${bundle.path}" is not an array but ${typeof(value)}.`);
  }
  
  value.push(...bundle.value);
  
  const newValue = value;
  
  return { oldValue, newValue, bundlePath, bundle, data: container.data };
};

const cursor = new Cursor();
cursor.on('changed', () => console.log(util.inspect(cursor.data, false, null)));

const sync = new AsketicOrientSync(db);
sync
.on('added', ({ path, rid, data }) => {
  // console.log({ type: 'push', path: path.slice(1), value: [data] });
  cursor.apply({ type: 'push', path: path.slice(1), value: [data] });
})
.on('changed', ({ path, rid, data }) => {
  // console.log({ type: 'set', path: [ ...path.slice(1), { '@rid': rid } ], value: data });
  cursor.apply({ type: 'set', path: [ ...path.slice(1), { '@rid': rid } ], value: data });
})
.on('removed', ({ path, rid, data }) => {
  // console.log({ type: 'remove', path: path.slice(1), selector: { '@rid': rid } });
  cursor.apply({ type: 'remove', path: path.slice(1), selector: { '@rid': rid } });
})
.ask({ schema: { fields: {
  x: {
    name: 'select',
    options: { from: 'Test', where: 'value > 3' },
    fields: {
      value: {},
      y: {
        name: 'select',
        options: { from: 'Test', where: 'value < 3' },
        fields: { value: {} },
      }
    },
  },
} } })
.then(({ data }) => {
  // console.log({ type: 'set', path: '', value: data });
  cursor.apply({ type: 'set', path: '', value: data });
  // console.log(util.inspect(data, false, null));
});

// asket({
//   resolver,
//   query: {
//     schema: {
//       name: 'select',
//       fields: { value: {} },
//     },
//   },
//   data: [ { value: 8, '@rid': '#50:1', a: 123 }, { value: 7, '@rid': '#55:0', c: 234 } ],
//   env: { path: [] },
// }).then(({ data }) => console.log('data', data));