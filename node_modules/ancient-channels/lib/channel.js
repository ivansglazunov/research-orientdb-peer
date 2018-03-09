"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var node_1 = require("ancient-mixins/lib/node");
var PackageType;
(function (PackageType) {
    PackageType[PackageType["Disconnect"] = 1] = "Disconnect";
    PackageType[PackageType["Connect"] = 2] = "Connect";
    PackageType[PackageType["Package"] = 3] = "Package";
})(PackageType || (PackageType = {}));
exports.PackageType = PackageType;
function mixin(superClass) {
    return /** @class */ (function (_super) {
        __extends(Channel, _super);
        function Channel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isConnected = false;
            return _this;
        }
        Channel.prototype.connect = function (data) {
            var _a = this.pack({
                data: data,
                channel: { type: PackageType.Connect }
            }), pkg = _a.pkg, msg = _a.msg;
            this.emit('connect', { pkg: pkg, msg: msg, channel: this });
            this.emit('send', { pkg: pkg, msg: msg, channel: this });
        };
        Channel.prototype.connected = function (pkg, msg) {
            this.isConnected = true;
            this.emit('connected', { pkg: pkg, msg: msg, channel: this });
        };
        Channel.prototype.disconnect = function (data) {
            var _a = this.pack({
                data: data,
                channel: { type: PackageType.Disconnect }
            }), pkg = _a.pkg, msg = _a.msg;
            this.emit('disconnect', { pkg: pkg, msg: msg, channel: this });
            this.emit('send', { pkg: pkg, msg: msg, channel: this });
        };
        Channel.prototype.disconnected = function (pkg, msg) {
            this.isConnected = false;
            this.emit('disconnected', { pkg: pkg, msg: msg, channel: this });
        };
        Channel.prototype.gotPkg = function (pkg, msg) {
            if (pkg.channel.type === PackageType.Disconnect) {
                var isConnected = this.isConnected;
                this.disconnected(pkg, msg);
                if (isConnected)
                    this.disconnect();
            }
            else if (pkg.channel.type === PackageType.Connect) {
                var isConnected = this.isConnected;
                this.connected(pkg, msg);
                if (!isConnected)
                    this.connect();
            }
            else if (pkg.channel.type === PackageType.Package) {
                this.emit('got', { pkg: pkg, msg: msg, channel: this });
            }
        };
        Channel.prototype.got = function (msg) {
            var pkg = this.unpack(msg).pkg;
            this.gotPkg(pkg, msg);
        };
        Channel.prototype.send = function (data) {
            var _a = this.pack({
                data: data,
                channel: { type: PackageType.Package }
            }), pkg = _a.pkg, msg = _a.msg;
            this.sendMsg(pkg, msg);
        };
        Channel.prototype.sendMsg = function (pkg, msg) {
            this.emit('send', { pkg: pkg, msg: msg, channel: this });
        };
        Channel.prototype.pack = function (pkg) {
            this.emit('pack', { pkg: pkg, channel: this });
            var msg = this.serialize(pkg);
            return { pkg: pkg, msg: msg };
        };
        Channel.prototype.unpack = function (msg) {
            var pkg = this.deserialize(msg);
            this.emit('unpack', { pkg: pkg, channel: this });
            return { pkg: pkg, msg: msg };
        };
        Channel.prototype.serialize = function (pkg) {
            var msg = JSON.stringify(pkg);
            return msg;
        };
        Channel.prototype.deserialize = function (msg) {
            var pkg = JSON.parse(msg);
            return pkg;
        };
        return Channel;
    }(superClass));
}
exports["default"] = mixin;
exports.mixin = mixin;
var MixedChannel = mixin(node_1.Node);
exports.MixedChannel = MixedChannel;
var Channel = /** @class */ (function (_super) {
    __extends(Channel, _super);
    function Channel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Channel;
}(MixedChannel));
exports.Channel = Channel;
//# sourceMappingURL=channel.js.map