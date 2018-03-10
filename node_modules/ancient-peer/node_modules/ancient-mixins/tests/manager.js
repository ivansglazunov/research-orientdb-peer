"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var node_1 = require("../lib/node");
var manager_1 = require("../lib/manager");
function default_1() {
    describe('Manager:', function () {
        it('add() / added / destroy() / removed', function (done) {
            var manager = new manager_1.Manager();
            manager.on('removed', function (_a) {
                var node = _a.node, m = _a.manager;
                chai_1.assert.equal(m, manager);
                chai_1.assert.isEmpty(manager.nodes);
                done();
            });
            manager.on('added', function (_a) {
                var node = _a.node, m = _a.manager;
                chai_1.assert.equal(m, manager);
                chai_1.assert.isNotEmpty(manager.nodes);
                node.destroy();
            });
            manager.add(new node_1.Node());
        });
    });
}
exports["default"] = default_1;
//# sourceMappingURL=manager.js.map