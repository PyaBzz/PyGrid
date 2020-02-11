node = function (col, row, zUnits) {
	this.col = col;
	this.row = row;
	this.zUnits = zUnits;

	this.upNeighbour = null;
	this.upRightNeighbour = null;
	this.rightNeighbour = null;
	this.downRightNeighbour = null;
	this.downNeighbour = null;
	this.downLeftNeighbour = null;
	this.leftNeighbour = null;
	this.upLeftNeighbour = null;

	this.x = col * pyGrid.restingLinkLength;
	this.y = row * pyGrid.restingLinkLength;
	this.z = zUnits * pyGrid.restingLinkLength;
	this.force = { x: 0, y: 0, z: 0 };
	this.speed = { x: 0, y: 0, z: 0 };
	this.acceleration = { x: 0, y: 0, z: 0 };
	this.pinned = false;
	this.marked = false;
	this.heldByMouse = false;
	this.heldByBox = false;
	this.links = [];
	this.containingBox = null;
};

node.prototype.updatePosition = function () {
	if (!this.isFree) return;

	this.acceleration.x = -this.force.x / pyGrid.nodeMass;
	this.acceleration.y = -this.force.y / pyGrid.nodeMass;
	this.acceleration.z = -this.force.z / pyGrid.nodeMass - pyGrid.gravity;  // Gravity acts in -z direction

	if (pyGrid.enableXAxis) this.x += (this.acceleration.x / 2 + pyGrid.damping * this.speed.x) * (1 - this.heldByBox * 0.4);
	if (pyGrid.enableYAxis) this.y += (this.acceleration.y / 2 + pyGrid.damping * this.speed.y) * (1 - this.heldByBox * 0.4);
	if (pyGrid.enableZAxis) this.z += (this.acceleration.z / 2 + pyGrid.damping * this.speed.z) * (1 - this.heldByBox * 0.4);
	pyGrid.minZ = Math.min(pyGrid.minZ, this.z);

	this.speed.x += this.acceleration.x;
	this.speed.y += this.acceleration.y;
	this.speed.z += this.acceleration.z;

	this.clearForce();
};

node.prototype.getNodesInRadius = function (radius = 0) {
	var res = [this];
	if (radius !== 0)
		this.neighbours.forEach(function (n) { res.push(n) }, this);
	return res;
}

node.prototype.getDistanceToCoordinates = function (hor, ver) {
	return Math.sqrt(Math.pow(this.x - hor, 2) + Math.pow(this.y - ver, 2))
}

node.prototype.draw = function () {
	pyGrid.canvasCtx.beginPath();
	if (this.pinned) {
		pyGrid.canvasCtx.fillStyle = pyGrid.pinColour;
		pyGrid.canvasCtx.arc(this.x, this.y, pyGrid.nodeRadius, 0, 2 * Math.PI)
	} else if (this.marked) {
		pyGrid.canvasCtx.fillStyle = pyGrid.markedNodeColour;
		pyGrid.canvasCtx.arc(this.x, this.y, pyGrid.nodeRadius, 0, 2 * Math.PI)
	}
	else {
		pyGrid.canvasCtx.fillStyle = pyGrid.nodeColour;
		pyGrid.enableZAxis
			? pyGrid.canvasCtx.arc(this.x, this.y, Math.abs(this.z), 0, 2 * Math.PI)
			: pyGrid.canvasCtx.arc(this.x, this.y, pyGrid.nodeRadius, 0, 2 * Math.PI);
	}
	pyGrid.canvasCtx.fill();
};

node.prototype.drawLinks = function () {
	if (!this.links.length) return;
	this.links.forEach(function (link) { link.draw() });
};

node.prototype.attach = function (node) {
	this.links.push(
		new link(this, node)
	);
};

node.prototype.move = function (vector) {
	if (this.pinned)
		return;

	this.x += vector.x;
	this.y += vector.y;
};

node.prototype.removeLink = function (link) {
	this.links.splice(this.links.indexOf(link), 1);
};

node.prototype.removeLinks = function () {
	this.links = [];
};

node.prototype.pin = function () {
	this.pinned = true;
};

node.prototype.mark = function () {
	this.marked = true;
};

node.prototype.clearForce = function () {
	this.force = { x: 0, y: 0, z: 0 };
};

node.prototype.applyForce = function (x, y, z) {
	this.force.x += x; this.force.y += y; this.force.z += z;
};

Object.defineProperties(node.prototype, {
	neighbours: { get: function () { return [this.upNeighbour, this.upRightNeighbour, this.rightNeighbour, this.downRightNeighbour, this.downNeighbour, this.downLeftNeighbour, this.leftNeighbour, this.upLeftNeighbour] } },
	isFree: { get: function () { return !this.pinned && !this.heldByMouse; } },
	clientX: { get: function () { return this.x + pyGrid.referenceFrame.left; } },  // Coordinates within the canvas!
	clientY: { get: function () { return this.y + pyGrid.referenceFrame.top; } },  // Coordinates within the canvas!
});
