"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var channels_manager_1 = require("../lib/channels-manager");
function default_1() {
    describe('ChannelsManager:', function () {
        it('connected() / disconnected()', function () {
            var manager = new channels_manager_1.ChannelsManager();
            manager.on('connected', function (_a) {
                var channel = _a.channel;
                chai_1.assert.equal(manager.nodes[channel.id], channel);
                chai_1.assert.isTrue(channel.isConnected);
            });
            manager.on('disconnected', function (_a) {
                var channel = _a.channel;
                chai_1.assert.equal(manager.nodes[channel.id], channel);
            });
            var channel = manager.create();
            channel.on('send', function (_a) {
                var channel = _a.channel, msg = _a.msg;
                return channel.got(msg);
            });
            channel.connect();
            chai_1.assert.isTrue(channel.isConnected);
            channel.disconnect();
            chai_1.assert.isFalse(channel.isConnected);
        });
    });
}
exports["default"] = default_1;
//# sourceMappingURL=channels-manager.js.map