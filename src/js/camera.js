'use strict';
var glmatrix = require("gl-matrix");
var Util = require('./hakurei').util;

// constant
var thetaLimits = [0.0*Math.PI, 1.8*Math.PI];
var distanceLimits = [2.0, 15.0];
var zoomWeight = 0.1;

var Camera = function() {
	this.vMatrix = glmatrix.mat4.create();
	glmatrix.mat4.identity(this.vMatrix);

	//this.theta = [1.7*Math.PI, 0.0, 0.5*Math.PI]; // Rotation about X and Z axes
	this.theta = [0.0*Math.PI, 0, 0.0*Math.PI];
	this.center = [0, 0, 0];
	this.up = [0, 1, 0];
	this.eye = [0, 0, 0];


	this.currentDistance = (distanceLimits[0]+distanceLimits[1])/2;
	this.desiredDistance = this.currentDistance;

	this.updateMatrix();
};
Camera.prototype.moveCenter = function(pos, offset) {
	this.center = pos.slice(0);
	if (offset) {
		for (var i=0; i<3; i++)
			this.center[i] += offset[i];
	}
};

Camera.prototype.changeAngle = function(dTheta) {
	this.theta[0] -= dTheta[0];
	this.theta[1] -= dTheta[1];
	this.theta[2] -= dTheta[2];
	this.theta[0] = Util.clamp(this.theta[0], thetaLimits[0], thetaLimits[1]);
};

Camera.prototype.changeDistance = function(amount) {
	this.desiredDistance += amount;
	this.desiredDistance = Util.clamp(this.desiredDistance, distanceLimits[0], distanceLimits[1]);
};

Camera.prototype.sphericalToCartesian = function(origin,r,angles) {
	return [
		origin[0] + r * Math.sin(angles[0]) * Math.cos(angles[2]),
		origin[1] + r * Math.sin(angles[0]) * Math.sin(angles[2]),
		origin[2] + r * Math.cos(angles[0])
	];
};

Camera.prototype.updateMatrix = function() {
	for (var i=0; i<3; i++) {
		if (this.theta[i] < 0)
			this.theta[i] += 2*Math.PI;
		else if (this.theta[i] > 2*Math.PI)
			this.theta[i] -= 2*Math.PI;
	}
	this.currentDistance *= 1-zoomWeight;
	this.currentDistance += zoomWeight*this.desiredDistance;

	this.eye = this.sphericalToCartesian(this.center, this.currentDistance, this.theta);
	glmatrix.mat4.lookAt(this.vMatrix, this.eye, this.center, this.up);
};

module.exports = Camera;
