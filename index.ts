import gql from 'graphql-tag';
import graphql from 'graphql-anywhere';
import * as _ from 'lodash';
import { Query, find } from 'mingo';

import { Cursor } from 'ancient-cursor/lib/cursor';
import { Peer } from 'ancient-peer/lib/peer';
import channel from 'ancient-channels/lib/channel';

const users = new Cursor().exec(null, []);
const posts = new Cursor().exec(null, []);

users.apply({
  type: 'set',
  path: '0',
  value: { id: 1, name: 'a', age: 17 },
});

users.apply({
  type: 'set',
  path: '1',
  value: { id: 2, name: 'b', age: 21 },
});

posts.apply({
  type: 'set',
  path: '0',
  value: { id: 1, author: 1, content: 'aaa' },
});

const resolver = (fieldName, root) => {
  if (root._type == 'cursors') {
    if (fieldName == 'users') {
      return _.map(find(users.data, {}).sort({ id: 1 }).all(), d => _.extend({ _type: 'user' }, d));
    }
    if (fieldName == 'posts') {
      return _.map(find(posts.data, {}).sort({ id: 1 }).all(), d => _.extend({ _type: 'post' }, d));
    }
  } else if (root._type == 'user') {
    if (fieldName == 'posts') {
      return _.map(find(posts.data, { author: root.id }).sort({ id: 1 }).all(), d => _.extend({ _type: 'post' }, d));
    }
    return root[fieldName];
  } else if (root._type == 'post') {
    if (fieldName == 'author') {
      return _.map(find(users.data, { id: root.author }).sort({ id: 1 }).all(), d => _.extend({ _type: 'user' }, d));
    }
    return root[fieldName];
  }
};

class AppPeer extends Peer {
	getApiCallbacks(apiQuery, callback) {
		callback((() => {
      const cursors = [];
      return {
        gotQuery: (channelId, { cursorId, query, queryId }) => {
          cursors.push({ cursorId, channelId });
          const value = graphql(
            resolver,
            gql`${query}`, {
              _type: 'cursors',
              users,
              posts,
            },
          );
          this.sendBundles(channelId, {
            type: 'set',
            path: '',
            value,
            cursorId,
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

const cursor = peer.exec(channelId, null, `{
  users {
    name
    posts {
      content
      author {
        name
      }
    }
  }
}`);

console.log(JSON.stringify(cursor.data));