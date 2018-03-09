"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var channel_1 = require("../lib/channel");
var create_local_transport_1 = require("../lib/create-local-transport");
function default_1() {
    it('createLocalTransport()', function (done) {
        var data = { text: 'test' };
        var channel1 = new channel_1.Channel();
        channel1.emitter.on('got', function (_a) {
            var channel = _a.channel, pkg = _a.pkg;
            chai_1.assert.deepEqual(pkg.data, data);
            done();
        });
        var channel2 = new channel_1.Channel();
        channel2.emitter.on('got', function (_a) {
            var channel = _a.channel, pkg = _a.pkg;
            channel.send(data);
        });
        create_local_transport_1["default"](channel1, channel2);
        channel1.send(data);
    });
}
exports["default"] = default_1;
//# sourceMappingURL=create-local-transport.js.map