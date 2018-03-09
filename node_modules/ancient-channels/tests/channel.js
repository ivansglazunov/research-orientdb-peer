"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var sinon = require("sinon");
var channel_1 = require("../lib/channel");
function default_1() {
    describe('Channel:', function () {
        it("connect / send / got / pack / unpack / disconnect", function () {
            var c1 = new channel_1.Channel();
            var c2 = new channel_1.Channel();
            c1.on('send', function (_a) {
                var channel = _a.channel, pkg = _a.pkg, msg = _a.msg;
                return c2.got(msg);
            });
            c2.on('send', function (_a) {
                var channel = _a.channel, pkg = _a.pkg, msg = _a.msg;
                return c1.got(msg);
            });
            chai_1.assert.isFalse(c1.isConnected);
            chai_1.assert.isFalse(c2.isConnected);
            c1.connect();
            chai_1.assert.isTrue(c1.isConnected);
            chai_1.assert.isTrue(c2.isConnected);
            var c1Got = sinon.stub();
            c1.on('pack', function (_a) {
                var channel = _a.channel, pkg = _a.pkg, msg = _a.msg;
                return pkg.data += pkg.data;
            });
            c2.on('got', function (_a) {
                var channel = _a.channel, pkg = _a.pkg, msg = _a.msg;
                c1Got();
                chai_1.assert.equal(pkg.data, 246);
            });
            c1.send(123);
            chai_1.assert.isTrue(c1Got.called);
            c2.disconnect();
            chai_1.assert.isFalse(c1.isConnected);
            chai_1.assert.isFalse(c2.isConnected);
        });
    });
}
exports["default"] = default_1;
//# sourceMappingURL=channel.js.map