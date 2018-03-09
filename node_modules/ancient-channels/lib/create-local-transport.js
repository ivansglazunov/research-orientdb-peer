"use strict";
exports.__esModule = true;
function createLocalTransport(channel1, channel2) {
    channel1.on('send', function (_a) {
        var msg = _a.msg;
        return channel2.got(msg);
    });
    channel2.on('send', function (_a) {
        var msg = _a.msg;
        return channel1.got(msg);
    });
    channel1.connect();
}
exports["default"] = createLocalTransport;
//# sourceMappingURL=create-local-transport.js.map