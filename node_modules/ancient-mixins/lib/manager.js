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
var _ = require("lodash");
var node_1 = require("./node");
function mixin(superClass) {
    return (function (_super) {
        __extends(Manager, _super);
        function Manager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.Node = node_1.Node;
            _this.nodes = {};
            return _this;
        }
        Manager.prototype.add = function (node) {
            if (node.isDestroyed) {
                throw new Error("Destroyed node " + node.id + " cant be added to " + this.id + ".");
            }
            this.nodes[node.id] = node;
            this.wrap(node);
            this.emit('added', { node: node, manager: this });
            return this;
        };
        Manager.prototype.wrap = function (node) {
            var _this = this;
            var listener = function (_a) {
                var eventName = _a.eventName, data = _a.data;
                if (eventName === 'destroyed')
                    _this.remove(node);
                else
                    _this.emit(eventName, _.extend({}, data, { manager: _this }));
            };
            node.on('emit', listener);
            this.on('destroyed', function () { return node.off('emit', listener); });
            return this;
        };
        Manager.prototype.remove = function (node) {
            if (this.nodes[node.id]) {
                delete this.nodes[node.id];
                this.emit('removed', { node: node, manager: this });
            }
            return this;
        };
        Manager.prototype.create = function (id) {
            var node = new this.Node(id);
            this.add(node);
            return node;
        };
        return Manager;
    }(superClass));
}
exports["default"] = mixin;
exports.mixin = mixin;
var MixedManager = mixin(node_1.Node);
exports.MixedManager = MixedManager;
var Manager = (function (_super) {
    __extends(Manager, _super);
    function Manager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Manager;
}(MixedManager));
exports.Manager = Manager;
//# sourceMappingURL=manager.js.map