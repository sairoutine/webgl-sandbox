'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var CONSTANT = require('../hakurei').constant;
var ShaderProgram = require('../shader_program');
var VS = require('../shader/main.vs');
var FS = require('../shader/main.fs');
var Triangle = require('../triangle');
var glmat = require("gl-matrix");

var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	this.shader_program = new ShaderProgram(
		this.core.gl,
		// 頂点シェーダ／フラグメントシェーダ
		VS, FS,
		// attribute 変数一覧(頂点毎に異なるデータ)
		[
			"position",
			"color",
		],
		// uniform 変数一覧(頂点毎に同じデータ)
		[
			"mvpMatrix",
		]
	);

	this.triangle = new Triangle(this.core.gl);

	/*
	var light_color       = [1.0, 0.5, 0.0];
	var light_position    = [0,0,1];
	var light_attenuation = [0.3, 0.1, 0.05];
	this.light = new PointLight(light_color, light_position, light_attenuation);
	this.camera = new Camera();
	*/

	var vMatrix = glmat.mat4.create();
	glmat.mat4.identity(vMatrix);
	glmat.mat4.lookAt(vMatrix, [0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0]); // eye, center, up

	var pMatrix = glmat.mat4.create();
	glmat.mat4.identity(pMatrix);
	glmat.mat4.perspective(pMatrix, 45.0, this.core.width/this.core.height, 0.1, 100.0);

	var vpMatrix = glmat.mat4.create();
	glmat.mat4.identity(vpMatrix);
	glmat.mat4.multiply(vpMatrix, pMatrix, vMatrix);
	this.vpMatrix = vpMatrix;


	this.mvpMatrix = glmat.mat4.create();
};





SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	glmat.mat4.identity(this.mvpMatrix);

	var rad = (this.frame_count % 360) * Math.PI / 180;
	var mMatrix = glmat.mat4.create();
	glmat.mat4.identity(mMatrix);
	glmat.mat4.rotate(mMatrix, mMatrix, rad, [0, 1, 0]);

	glmat.mat4.multiply(this.mvpMatrix, this.vpMatrix, mMatrix);

	this.triangle.update();
};


SceneTitle.prototype.draw = function(){
	// Canvasの大きさとビューポートの大きさを合わせる
	this.core.gl.viewport(0, 0, this.core.width, this.core.height);

	this.renderTriangle();

	// WebGL_API 29. 描画
	this.core.gl.flush();
};


SceneTitle.prototype.renderTriangle = function(){
	// WebGL_API 21. uniform 変数にデータを登録する
	// 4fv -> vec4, 3fv -> vec3, 1f -> float
	this.core.gl.uniformMatrix4fv(this.shader_program.uniform_locations.mvpMatrix, false, this.mvpMatrix);

	// attribute 変数にデータを登録する
	this.attribSetup(this.shader_program.attribute_locations.position, this.triangle.positionObject,  3);
	this.attribSetup(this.shader_program.attribute_locations.color, this.triangle.colorObject,  4);

	/*
	// TODO: player.bindTexture() に移動
	// WebGL_API 25. 有効にするテクスチャユニットを指定(今回は0)
	this.core.gl.activeTexture(this.core.gl.TEXTURE0);
	// WebGL_API 26. テクスチャをバインドする
	this.core.gl.bindTexture(this.core.gl.TEXTURE_2D, this.player.texture);
	// WebGL_API 27. テクスチャデータをシェーダに送る(ユニット 0)
	this.core.gl.uniform1i(this.sprites_shader_program.uniform_locations.uSampler, 0);
	*/

	// WebGL_API 28. 送信
	this.core.gl.bindBuffer(this.core.gl.ELEMENT_ARRAY_BUFFER, this.triangle.indexObject);
	this.core.gl.drawElements(this.core.gl.TRIANGLES, this.triangle.numVertices(), this.core.gl.UNSIGNED_SHORT, 0);
};

SceneTitle.prototype.attribSetup = function(attribute_location, buffer_object, size, type) {
	if (!type) {
		type = this.core.gl.FLOAT;
	}

	// WebGL_API 22. attribute 属性を有効にする
	this.core.gl.enableVertexAttribArray(attribute_location);

	// WebGL_API 23. 頂点バッファをバインドする
	this.core.gl.bindBuffer(this.core.gl.ARRAY_BUFFER, buffer_object);
	// WebGL_API 24. attribute 属性を登録する(1頂点の要素数、型を登録)
	this.core.gl.vertexAttribPointer(attribute_location, size, type, false, 0, 0);

};
module.exports = SceneTitle;
