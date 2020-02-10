mouse = function (impactRadius, cuttingRadius, slipFactor) {
    this.impactRadius = impactRadius;
    this.cuttingRadius = cuttingRadius;
    this.slipFactor = slipFactor;
    this.x = 0;
    this.y = 0;
    this.dragVect = { x: 0, y: 0 };
    this.clickX = 0;
    this.clickY = 0;
    this.key = 0;
    this.closestNode = null;
    this.closestNodeDistance = Number.MAX_VALUE;
    this.cutNodes = [];
    this.touchedNodes = [];
    this.heldNodes = [];
    this.dragBox = null;
};

mouse.prototype.check = function (node) {
    var distance = this.cursorDistanceTo(node);
    if (distance < this.closestNodeDistance) {
        this.closestNode = node;
        this.closestNodeDistance = distance;
    }
    if (node.pinned) return;
    if (this.hasDragBox) {
        if (this.dragBox.coversNode(node)) {
            this.touchedNodes.push(node);
        }
    } else {
        if (distance <= this.cuttingRadius)
            this.cutNodes.push(node);

        if (distance <= this.impactRadius)
            this.touchedNodes.push(node);
    }
};

mouse.prototype.cursorDistanceTo = function (node) {
    return Math.sqrt(Math.pow(node.clientX - this.x, 2) + Math.pow(node.clientY - this.y, 2));
};

mouse.prototype.clickDistanceTo = function (node) {
    return Math.sqrt(Math.pow(node.clientX - this.clickX, 2) + Math.pow(node.clientY - this.clickY, 2));
};

mouse.prototype.dragThem = function () {
    if (this.key !== 1)
        return;

    if (this.isSlippy) {
        this.touchedNodes.forEach(function (n) {
            n.move({ x: pyGrid.mouse.dragVect.x * pyGrid.mouse.slipFactor, y: pyGrid.mouse.dragVect.y * pyGrid.mouse.slipFactor })
        });
    } else {

        this.heldNodes.forEach(function (n) {
            n.move({ x: pyGrid.mouse.dragVect.x, y: pyGrid.mouse.dragVect.y });
        });
    }
};

mouse.prototype.cut = function () {
    this.cutNodes.forEach(function (n) {
        n.removeLinks();
    });
};

mouse.prototype.mouseDown = function (mouseDownEvent) {
    this.key = mouseDownEvent.which;
    this.clickX = mouseDownEvent.x;
    this.clickY = mouseDownEvent.y;
    if (mouseDownEvent.target == pyGrid.canvas) {
        switch (this.key) {
            case 1:
                if (this.isSlippy) {

                } else {
                    this.closestNode.heldByMouse = true;
                    this.heldNodes.push(this.closestNode);
                };
                break;
            case 2:
                if (this.isHoldingNodes)
                    this.heldNodes.forEach(function (n) { n.pin() });
                else
                    this.closestNode.pin();
                break;
            case 3:
                if (pyGrid.rightClickAction === 0)
                    this.cut();
                else
                    this.closestNode.mark();
                break;
            default:
                break;
        }
    }
    else if (mouseDownEvent.target.className == 'dragbox') {
        var dragBoxIndex = mouseDownEvent.target.getAttribute("dragbox-index");
        this.dragBox = pyGrid.dragBoxes[dragBoxIndex];
        this.dragBox.updateBoundaries();
    }
};

Object.defineProperties(mouse.prototype, {
    isUp: { get: function () { return this.key === 0 } },
    isSlippy: { get: function () { return this.slipFactor !== 1 } },
    hasDragBox: { get: function () { return this.dragBox !== null } },
    isHoldingNodes: { get: function () { return this.heldNodes.length !== 0 } },
});

mouse.prototype.bindMouseHandlers = function () {
    pyGrid.canvas.oncontextmenu = function (contextEvent) { contextEvent.preventDefault(); };
    pyGrid.dragBoxes.forEach(function (d) {
        d.element.oncontextmenu = function (contextEvent) { contextEvent.preventDefault(); };
    });

    pyGrid.onmousedown = function (mouseDownEvent) {
        mouseDownEvent.preventDefault();
        pyGrid.mouse.mouseDown(mouseDownEvent);
    };

    pyGrid.onmousemove = function (moveEvent) {
        moveEvent.preventDefault();
        pyGrid.mouse.x = moveEvent.pageX;
        pyGrid.mouse.y = moveEvent.pageY;
        pyGrid.mouse.dragVect.x = moveEvent.movementX;
        pyGrid.mouse.dragVect.y = moveEvent.movementY;
        if (pyGrid.mouse.hasDragBox)
            pyGrid.mouse.dragBox.move(pyGrid.mouse.dragVect.x, pyGrid.mouse.dragVect.y);

        pyGrid.mouse.dragThem();
    };

    pyGrid.onmouseup = function (releaseEvent) {
        releaseEvent.preventDefault();
        pyGrid.mouse.heldNodes.forEach(function (p) { p.heldByMouse = false });
        pyGrid.mouse.key = 0;
        pyGrid.mouse.heldNodes = [];
        pyGrid.mouse.touchedNodes = [];
        pyGrid.mouse.dragBox = null;
    };
}
