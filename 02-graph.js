graph = function (bazgrid) {
	this.grid = bazgrid;
	this.nodes = [];

	for (let row = 0; row <= this.grid.verticalCellCount; row++) {
		this.nodes[row] = [];
		for (let col = 0; col <= this.grid.horizontalCellCount; col++) {
			let p = new node(col, row, 0, this.grid);

			if (row == 0)
				p.frame();                   // The top edge of the graph is frame
			else {  // Link upNeighbour
				p.upNeighbour = this.nodes[row - 1][col];
				p.attach(p.upNeighbour);
				p.upNeighbour.downNeighbour = p;
			}

			if (col == 0)
				p.frame();                   // The left edge of the graph is frame
			else {  // Link leftNeighbour
				p.leftNeighbour = this.nodes[row][col - 1];
				p.attach(p.leftNeighbour);
				p.leftNeighbour.rightNeighbour = p;
			}

			if (row != 0 && col != 0) {  // Link leftNeighbour
				p.upLeftNeighbour = this.nodes[row - 1][col - 1];
				if (this.grid.drawDiagonalLinks)
					p.attach(p.upLeftNeighbour);
				p.upLeftNeighbour.downRightNeighbour = p;
			}

			if (row != 0 && col != this.grid.horizontalCellCount) {  // Link leftNeighbour
				p.upRightNeighbour = this.nodes[row - 1][col + 1];
				if (this.grid.drawDiagonalLinks)
					p.attach(p.upRightNeighbour);
				p.upRightNeighbour.downLeftNeighbour = p;
			}

			if (col == this.grid.horizontalCellCount)
				p.frame();   // The right edge of the graph is frame

			if (row == this.grid.verticalCellCount)
				p.frame();  // The bottom edge of the graph is frame

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

graph.prototype.updateNodePositions = function () {
	this.doToAllNodes(function (p) {
		p.updatePosition();
	});
};

graph.prototype.drawNodes = function () {
	this.doToAllNodes(function (p) { p.draw() });
};

graph.prototype.drawLinks = function () {
	this.grid.canvasCtx.strokeStyle = this.grid.linkColour;
	this.grid.canvasCtx.beginPath();
	this.doToAllNodes(function (p) { p.drawLinks() });
	this.grid.canvasCtx.stroke();
};

graph.prototype.doToAllNodes = function (func) {
	for (let row = 0; row < this.nodes.length; row++) {
		for (let col = 0; col < this.nodes[0].length; col++) {
			func(this.nodes[row][col]);
		};
	}
};

graph.prototype.getClosestNodeToCoordinates = function (hor, ver, markPath = false) {
	// let runnerNode = this.nodes[0][0];
	let runnerNode = this.estimateNodeByCoordinates(hor, ver);
	let bestNeighbour = runnerNode;
	let runnerNodeDistance = Infinity;
	let bestNeighbourDistance = Number.MAX_VALUE;
	while (bestNeighbourDistance < runnerNodeDistance) {
		if (markPath)
			runnerNode.mark();
		runnerNode = bestNeighbour;
		runnerNodeDistance = runnerNode.getDistanceToCoordinates(hor, ver);
		runnerNode.neighbours.forEach(function (neighbour) {
			if (neighbour != null) {
				let neighbourDistance = neighbour.getDistanceToCoordinates(hor, ver);
				if (neighbourDistance < bestNeighbourDistance) {
					bestNeighbour = neighbour;
					bestNeighbourDistance = neighbourDistance;
				}
			}
		});
	}
	return runnerNode;
};

graph.prototype.getNodesWhere = function (predicate, rootNode = null, markPath = false) {
	let resultArray = [];
	if (rootNode == null) {
		for (let row = 0; row < this.nodes.length; row++) {
			for (let col = 0; col < this.nodes[0].length; col++) {
				n = this.nodes[row][col];
				if (predicate(n) != false)
					resultArray.push(n);
			}
		}
	} else {
		resultArray.push(rootNode);
		rootNode.visited = true;
		if (markPath)
			rootNode.mark();
		rootNode.neighbours.forEach(function (n) {
			if (n.visited === false && predicate(n) != false) {
				this.getNodesWhereRecurse(predicate, n, resultArray, markPath);
			}
		}, this);

		resultArray.forEach(function (n) {
			n.visited = false;
		});
	}
	return resultArray;
};

graph.prototype.getNodesWhereRecurse = function (predicate, node, resultArray, markPath = false) {
	resultArray.push(node);
	node.visited = true;
	if (markPath)
		node.mark();
	node.neighbours.forEach(function (n) {
		if (n.visited === false && predicate(n) != false) {
			this.getNodesWhereRecurse(predicate, n, resultArray, markPath);
		}
	}, this);
};

graph.prototype.estimateNodeByCoordinates = function (hor, ver) {
	let col = Math.round(hor / this.grid.restingLinkLength);
	col = Math.min(col, this.maxColIndex);
	col = Math.max(col, 0);
	let row = Math.round(ver / this.grid.restingLinkLength);
	row = Math.min(row, this.maxRowIndex);
	row = Math.max(row, 0);
	return this.nodes[row][col]; //Todo: Is the order right?
};

Object.defineProperties(graph.prototype, {
	maxRowIndex: { get: function () { return this.nodes.length - 1 } },
	maxColIndex: { get: function () { return this.nodes[0].length - 1 } },
});
