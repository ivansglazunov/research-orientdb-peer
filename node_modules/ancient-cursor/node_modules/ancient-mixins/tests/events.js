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
var chai_1 = require("chai");
var sinon = require("sinon");
var events_1 = require("../lib/events");
function default_1() {
    describe('Events:', function () {
        it('on() / once() / off() / emit()', function () {
            var TestEvents = /** @class */ (function (_super) {
                __extends(TestEvents, _super);
                function TestEvents() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return TestEvents;
            }(events_1.Events));
            var events = new TestEvents();
            var callback = sinon.stub();
            callback.onCall(0).returns({ b: 'c' });
            callback.onCall(1).returns({ d: 'e' });
            callback.throws();
            var listener = function (data) { return chai_1.assert.deepEqual(data, callback()); };
            events.on('a', listener);
            events.once('a', function (_a) {
                var b = _a.b;
                events.once('a', function (_a) {
                    var b = _a.b;
                    events.off('a', listener);
                });
                events.emit('a', { d: 'e' });
            });
            events.emit('a', { b: 'c' });
        });
    });
}
exports["default"] = default_1;
//# sourceMappingURL=events.js.map