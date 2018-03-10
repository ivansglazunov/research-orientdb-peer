"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var node_1 = require("../lib/node");
function default_1() {
    describe('Node:', function () {
        it('new / destroy() / id', function () {
            var node = new node_1.Node();
            chai_1.assert.isOk(node.id);
            chai_1.assert.isFalse(node.isDestroyed);
            node.on('destroyed', function (_a) {
                var node = _a.node;
                chai_1.assert.isTrue(node.isDestroyed);
            });
            node.destroy();
            chai_1.assert.isTrue(node.isDestroyed);
        });
    });
}
exports["default"] = default_1;
//# sourceMappingURL=node.js.map