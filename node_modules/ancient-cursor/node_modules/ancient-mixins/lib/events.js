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
var EventEmitter = require("events");
function mixin(superClass) {
    return /** @class */ (function (_super) {
        __extends(Events, _super);
        function Events() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.emitter = new EventEmitter();
            return _this;
        }
        Events.prototype.emit = function (eventName, data) {
            this.emitter.emit(eventName, data);
            this.emitter.emit('emit', { eventName: eventName, data: data });
            return this;
        };
        Events.prototype.on = function (eventName, listener) {
            this.emitter.on(eventName, listener);
            return this;
        };
        Events.prototype.once = function (eventName, listener) {
            this.emitter.once(eventName, listener);
            return this;
        };
        Events.prototype.off = function (eventName, listener) {
            this.emitter.removeListener(eventName, listener);
            return this;
        };
        return Events;
    }(superClass));
}
exports["default"] = mixin;
exports.mixin = mixin;
var MixedEvents = mixin(/** @class */ (function () {
    function class_1() {
    }
    return class_1;
}()));
exports.MixedEvents = MixedEvents;
var Events = /** @class */ (function (_super) {
    __extends(Events, _super);
    function Events() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Events;
}(MixedEvents));
exports.Events = Events;
//# sourceMappingURL=events.js.map