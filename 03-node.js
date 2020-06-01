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

	this.x = col * bazGrid.restingLinkLength;
	this.y = row * bazGrid.restingLinkLength;
	this.z = zUnits * bazGrid.restingLinkLength;
	this.force = { x: 0, y: 0, z: 0 };
	this.speed = { x: 0, y: 0, z: 0 };
	this.isFrame = false;
	this.pinned = false;
	this.marked = false;
	this.heldByMouse = false;
	this.heldByBox = false;
	this.links = [];
	this.containingBox = null;
	this.visited = false;
};

node.prototype.updatePosition = function () {
	if (!this.isFree)
		return;

	let acceleration = {
		x: -this.force.x / bazGrid.nodeMass,
		y: -this.force.y / bazGrid.nodeMass,
		z: -this.force.z / bazGrid.nodeMass - bazGrid.gravity,  // Gravity acts in -z direction
	};

	if (this.heldByBox) {
		if (bazGrid.enableXAxis) this.x += (acceleration.x / 2 + bazGrid.damping * this.speed.x) * bazGrid.boxedNodeBrakingFactor;
		if (bazGrid.enableYAxis) this.y += (acceleration.y / 2 + bazGrid.damping * this.speed.y) * bazGrid.boxedNodeBrakingFactor;
		if (bazGrid.enableZAxis) this.z += (acceleration.z / 2 + bazGrid.damping * this.speed.z) * bazGrid.boxedNodeBrakingFactor;
	} else {
		if (bazGrid.enableXAxis) this.x += (acceleration.x / 2 + bazGrid.damping * this.speed.x);
		if (bazGrid.enableYAxis) this.y += (acceleration.y / 2 + bazGrid.damping * this.speed.y);
		if (bazGrid.enableZAxis) this.z += (acceleration.z / 2 + bazGrid.damping * this.speed.z);
	}
	bazGrid.minZ = Math.min(bazGrid.minZ, this.z);

	this.applyAcceleration(acceleration);

	this.clearForce();
};

node.prototype.getDistanceToCoordinates = function (hor, ver) {
	return Math.sqrt(Math.pow(this.x - hor, 2) + Math.pow(this.y - ver, 2))
}

node.prototype.draw = function () {
	if (this.isFrame)
		return;
	else if (bazGrid.pinRadius && this.pinned) {
		bazGrid.canvasCtx.beginPath();
		bazGrid.canvasCtx.fillStyle = bazGrid.pinColour;
		bazGrid.canvasCtx.arc(this.x, this.y, bazGrid.pinRadius, 0, 2 * Math.PI)
		bazGrid.canvasCtx.fill();
	} else if (bazGrid.markedNodeRadius && this.marked) {
		bazGrid.canvasCtx.beginPath();
		bazGrid.canvasCtx.fillStyle = bazGrid.markedNodeColour;
		bazGrid.canvasCtx.arc(this.x, this.y, bazGrid.markedNodeRadius, 0, 2 * Math.PI)
		bazGrid.canvasCtx.fill();
	}
	else if (bazGrid.nodeRadius) {
		bazGrid.canvasCtx.beginPath();
		bazGrid.canvasCtx.fillStyle = bazGrid.nodeColour;
		bazGrid.enableZAxis
			? bazGrid.canvasCtx.arc(this.x, this.y, Math.abs(this.z), 0, 2 * Math.PI)
			: bazGrid.canvasCtx.arc(this.x, this.y, bazGrid.nodeRadius, 0, 2 * Math.PI);
		bazGrid.canvasCtx.fill();
	}
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
	if (this.isFree === false)
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

node.prototype.frame = function () {
	this.isFrame = true;
};

node.prototype.mark = function () {
	this.marked = true;
};

node.prototype.clearForce = function () {
	this.force = { x: 0, y: 0, z: 0 };
};

node.prototype.applyForce = function (vector) {
	this.force.x += vector.x; this.force.y += vector.y; this.force.z += vector.z;
};

node.prototype.applyAcceleration = function (vector) {
	this.speed.x += vector.x; this.speed.y += vector.y; this.speed.z += vector.z; // Because time step is normalised to 1 sec
};

Object.defineProperties(node.prototype, {
	neighbours: {
		get: function () {
			let allNeighbours = [this.upNeighbour, this.upRightNeighbour, this.rightNeighbour, this.downRightNeighbour, this.downNeighbour, this.downLeftNeighbour, this.leftNeighbour, this.upLeftNeighbour];
			return allNeighbours.filter(function (n) { return n !== null });
		}
	},
	isFree: { get: function () { return this.pinned === false && this.heldByMouse === false && this.isFrame === false; } },
	clientX: { get: function () { return this.x + bazGrid.referenceFrame.left; } },  // Coordinates within the canvas!
	clientY: { get: function () { return this.y + bazGrid.referenceFrame.top; } },  // Coordinates within the canvas!
});
