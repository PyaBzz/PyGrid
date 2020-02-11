graph = function () {

	this.nodes = [];

	for (var row = 0; row <= pyGrid.verticalCellCount; row++) {
		this.nodes[row] = [];
		for (var col = 0; col <= pyGrid.horizontalCellCount; col++) {
			var p = new node(col, row, 0);

			if (row == 0)
				p.pin();                   // Pin the top edge of the graph
			else {  // Link upNeighbour
				p.upNeighbour = this.nodes[row - 1][col];
				p.attach(p.upNeighbour);
				p.upNeighbour.downNeighbour = p;
			}

			if (col == 0)
				p.pin();                   // Pin the left edge of the graph
			else {  // Link leftNeighbour
				p.leftNeighbour = this.nodes[row][col - 1];
				p.attach(p.leftNeighbour);
				p.leftNeighbour.rightNeighbour = p;
			}

			if (row != 0 && col != 0) {  // Link leftNeighbour
				p.upLeftNeighbour = this.nodes[row - 1][col - 1];
				if (pyGrid.drawDiagonalLinks)
					p.attach(p.upLeftNeighbour);
				p.upLeftNeighbour.downRightNeighbour = p;
			}

			if (row != 0 && col != pyGrid.horizontalCellCount) {  // Link leftNeighbour
				p.upRightNeighbour = this.nodes[row - 1][col + 1];
				if (pyGrid.drawDiagonalLinks)
					p.attach(p.upRightNeighbour);
				p.upRightNeighbour.downLeftNeighbour = p;
			}

			if (col == pyGrid.horizontalCellCount)
				p.pin();   // Pin the right edge of the graph

			if (row == pyGrid.verticalCellCount)
				p.pin();  // Pin the bottom edge of the graph

			this.nodes[row].push(p);
		}
	}
};

graph.prototype.calculateForces = function () {
	this.doToAllNodes(function (n) {
		n.links.forEach(function (link) {
			link.applyForces();
		});
	});
};

graph.prototype.updateNodeBounds = function () {
	this.doToAllNodes(function (p) {
		Array.prototype.forEach.call(pyGrid.dragBoxes, function (b) {
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

graph.prototype.updateNodePositions = function () {
	this.doToAllNodes(function (p) {
		p.updatePosition();
	});
};

graph.prototype.drawNodes = function () {
	this.doToAllNodes(function (p) { p.draw() });
};

graph.prototype.drawLinks = function () {
	pyGrid.canvasCtx.strokeStyle = pyGrid.linkColour;
	pyGrid.canvasCtx.beginPath();
	this.doToAllNodes(function (p) { p.drawLinks() });
	pyGrid.canvasCtx.stroke();
};

graph.prototype.doToAllNodes = function (func) {
	for (var row = 0; row < this.nodes.length; row++) {
		for (var col = 0; col < this.nodes[0].length; col++) {
			func(this.nodes[row][col]);
		};
	}
};

graph.prototype.getNodesWhere = function (func) {
	var compliantNodes = [];
	for (var row = 0; row < this.nodes.length; row++) {
		for (var col = 0; col < this.nodes[0].length; col++) {
			n = this.nodes[row][col];
			if (func(n) != false)
				compliantNodes.push(n);
		}
	}
	return compliantNodes;
};

graph.prototype.getClosestNodeToCoordinates = function (hor, ver) {
	// var runnerNode = this.nodes[0][0];
	var runnerNode = this.estimateNodeByCoordinates(hor, ver);
	var bestNeighbour = runnerNode;
	var runnerNodeDistance = Infinity;
	var bestNeighbourDistance = Number.MAX_VALUE;
	while (bestNeighbourDistance < runnerNodeDistance) {
		runnerNode = bestNeighbour;
		runnerNodeDistance = runnerNode.getDistanceToCoordinates(hor, ver);
		runnerNode.neighbours.forEach(function (neighbour) {
			if (neighbour != null) {
				var neighbourDistance = neighbour.getDistanceToCoordinates(hor, ver);
				if (neighbourDistance < bestNeighbourDistance) {
					bestNeighbour = neighbour;
					bestNeighbourDistance = neighbourDistance;
				}
			}
		});
	}
	return runnerNode;
};

graph.prototype.estimateNodeByCoordinates = function (hor, ver) {
	var row = Math.round(ver / pyGrid.restingLinkLength);
	var col = Math.round(hor / pyGrid.restingLinkLength);
	return this.nodes[row][col];
};
