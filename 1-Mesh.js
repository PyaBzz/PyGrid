mesh = function () {

	this.nodes = [];

	for (var row = 0; row <= pyGrid.verticalCellCount; row++) {
		for (var col = 0; col <= pyGrid.horizontalCellCount; col++) {
			var p = new node(col * pyGrid.restingLinkLength, row * pyGrid.restingLinkLength, 0);

			if (row == 0) p.pin();                   // Pin the top edge of the mesh
			if (row == pyGrid.verticalCellCount) p.pin();  // Pin the bottom edge of the mesh

			if (col == 0) p.pin();                   // Pin the left edge of the mesh
			if (col == pyGrid.horizontalCellCount) p.pin();   // Pin the right edge of the mesh

			if (col != 0) p.attach(this.nodes[this.nodes.length - 1]);  // Horizontal link to previous node on the left
			if (row != 0) p.attach(this.nodes[(row - 1) * (pyGrid.horizontalCellCount + 1) + col]);  // Number of nodes in each row is 1 more than the number of cells

			this.nodes.push(p);
		}
	}
};

mesh.prototype.calculateForces = function () {
	this.nodes.forEach(function (node) {
		node.links.forEach(function (link) { link.applyForces() });
	});
};

mesh.prototype.updateNodeBounds = function () {
	this.nodes.forEach(function (p) {
		Array.prototype.forEach.call(dragBoxes, function (b) {
			if (p.isInBox(b.offsetLeft, b.offsetLeft + b.offsetWidth, b.offsetTop, b.offsetTop + b.offsetHeight)) {
				p.heldByBox = 1;
				p.containingBox = b;
			} else {
				p.heldByBox = 0;
				p.containingBox = null;
			}
		});
	});
};

mesh.prototype.updateNodePositions = function () {
	this.nodes.forEach(function (p) {
		if (p.isFree) p.updatePosition();
	});
};

mesh.prototype.drawNodes = function () {
	this.nodes.forEach(function (p) { p.draw() });
};

mesh.prototype.drawLinks = function () {
	pyGrid.canvasCtx.strokeStyle = pyGrid.linkColour;
	pyGrid.canvasCtx.beginPath();
	this.nodes.forEach(function (p) { p.drawLinks() });
	pyGrid.canvasCtx.stroke();
};
