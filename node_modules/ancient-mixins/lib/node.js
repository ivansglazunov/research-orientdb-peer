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
var uuid_1 = require("uuid");
var events_1 = require("./events");
function mixin(superClass) {
    return (function (_super) {
        __extends(Node, _super);
        function Node() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.call(this) || this;
            _this.isDestroyed = false;
            _this.id = args[0] || _this.generateId();
            return _this;
        }
        Node.prototype.generateId = function () {
            return uuid_1.v4();
        };
        Node.prototype.destroy = function () {
            if (!this.isDestroyed) {
                this.isDestroyed = true;
                this.emit('destroyed', { node: this });
            }
        };
        return Node;
    }(superClass));
}
exports["default"] = mixin;
exports.mixin = mixin;
var MixedNode = mixin(events_1.Events);
exports.MixedNode = MixedNode;
var Node = (function (_super) {
    __extends(Node, _super);
    function Node() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Node;
}(MixedNode));
exports.Node = Node;
//# sourceMappingURL=node.js.map