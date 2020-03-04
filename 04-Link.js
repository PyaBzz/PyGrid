link = function (p1, p2) {
	this.p1 = p1;
	this.p2 = p2;
};

link.prototype.applyForces = function () {

	if (this.hastStretchedToTear)
		this.p1.removeLink(this);  // 2D

	if (this.p1.isFree === false && this.p2.isFree === false)
		return;

	var force = {};
	force.x = Math.sign(this.diff.x) * Math.pow(Math.abs(this.diff.x), pyGrid.elasticNonlinearity) * pyGrid.elasticStiffness;
	force.y = Math.sign(this.diff.y) * Math.pow(Math.abs(this.diff.y), pyGrid.elasticNonlinearity) * pyGrid.elasticStiffness;
	force.z = Math.sign(this.diff.z) * Math.pow(Math.abs(this.diff.z), pyGrid.elasticNonlinearity) * pyGrid.elasticStiffness;

	if (this.p2.isFree)
		this.p2.applyForce(-force.x, -force.y, -force.z);

	if (this.p1.isFree)
		this.p1.applyForce(force.x, force.y, force.z);
};

link.prototype.draw = function () {
	pyGrid.canvasCtx.moveTo(this.p1.x, this.p1.y);  // 0.5 pixels to properly apply odd numbers to line thickness
	pyGrid.canvasCtx.lineTo(this.p2.x, this.p2.y);  // 0.5 pixels to properly apply odd numbers to line thickness
};

Object.defineProperties(link.prototype, {
	diff: { get: function () { return { x: this.p1.x - this.p2.x, y: this.p1.y - this.p2.y, z: this.p1.z - this.p2.z } } },
	hastStretchedToTear: { get: function () { return pyGrid.linkTearingLength && this.length2D > pyGrid.linkTearingLength } },
	length2D: { get: function () { return Math.sqrt(Math.pow(this.diff.x, 2) + Math.pow(this.diff.y, 2)) } },
	length3D: { get: function () { return Math.sqrt(Math.pow(this.diff.x, 2) + Math.pow(this.diff.y, 2) + Math.pow(this.diff.z, 2)) } },
});
