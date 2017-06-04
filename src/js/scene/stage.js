'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var CONSTANT = require('../hakurei').constant;
var ShaderProgram = require('../shader_program');
var VS = require('../shader/main.vs');
var FS = require('../shader/main.fs');
var Myon = require('../myon');
var FPS = require('../fps');
var Camera = require('../camera');
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
			"textureCoord",
		],
		// uniform 変数一覧(頂点毎に同じデータ)
		[
			"mvpMatrix",
			"uSampler",
		]
	);

	//this.triangle = new Triangle(this.core.gl);
	this.fps = new FPS(this.core.gl);
	this.myon = new Myon(this.core.gl, this.core.image_loader.getImage("myon"));

	/*
	var light_color       = [1.0, 0.5, 0.0];
	var light_position    = [0,0,1];
	var light_attenuation = [0.3, 0.1, 0.05];
	this.light = new PointLight(light_color, light_position, light_attenuation);
	*/
	this.camera = new Camera();

	// perspective matrix
	var pMatrix = glmat.mat4.create();
	glmat.mat4.identity(pMatrix);
	glmat.mat4.perspective(pMatrix, 45.0, this.core.width/this.core.height, 0.1, 100.0);
	this.pMatrix = pMatrix;

	this.mvpMatrix = glmat.mat4.create();
};





SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	var rotateSpeed = 0.01;
	// カメラ移動
	if (this.core.isLeftClickDown()) {
		var angleChange = [
			-this.core.mouseMoveY() * rotateSpeed,
			0,
			this.core.mouseMoveX() * rotateSpeed
		];
		this.camera.changeAngle(angleChange);
	}

	// ズーム
	if (this.core.mouseScroll()) {
		this.camera.changeDistance(this.core.mouseScroll());
	}

	// カメラ更新
	this.camera.moveCenter([0.0, 0.0, 0.0]);
	this.camera.updateMatrix();

	// view matrix
	var vMatrix = this.camera.vMatrix;
	var vpMatrix = glmat.mat4.create();
	glmat.mat4.identity(vpMatrix);

	glmat.mat4.multiply(vpMatrix, this.pMatrix, vMatrix);

	// model matrix
	glmat.mat4.identity(this.mvpMatrix);

	//var rad = (this.frame_count % 360) * Math.PI / 180;
	var mMatrix = glmat.mat4.create();
	glmat.mat4.identity(mMatrix);
	//glmat.mat4.rotate(mMatrix, mMatrix, rad, [0, 1, 0]);

	glmat.mat4.multiply(this.mvpMatrix, vpMatrix, mMatrix);

	// 三角形更新
	this.myon.update();
	this.fps.update();
};


SceneTitle.prototype.draw = function(){
	var gl = this.core.gl;
	// Canvasの大きさとビューポートの大きさを合わせる
	this.core.gl.viewport(0, 0, this.core.width, this.core.height);

	this.core.gl.enable(this.core.gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);


	this.renderMyon();
	this.renderFPS();

	// WebGL_API 29. 描画
	this.core.gl.flush();
};


SceneTitle.prototype.renderMyon = function(){
	// WebGL_API 21. uniform 変数にデータを登録する
	// 4fv -> vec4, 3fv -> vec3, 1f -> float
	this.core.gl.uniformMatrix4fv(this.shader_program.uniform_locations.mvpMatrix, false, this.mvpMatrix);

	// attribute 変数にデータを登録する
	this.attribSetup(this.shader_program.attribute_locations.position, this.myon.positionObject,  3);
	this.attribSetup(this.shader_program.attribute_locations.color, this.myon.colorObject,  4);
	this.attribSetup(this.shader_program.attribute_locations.textureCoord, this.myon.textureObject,  2);

	// WebGL_API 25. 有効にするテクスチャユニットを指定(今回は0)
	this.core.gl.activeTexture(this.core.gl.TEXTURE0);
	// WebGL_API 26. テクスチャをバインドする
	this.core.gl.bindTexture(this.core.gl.TEXTURE_2D, this.myon.texture);
	// WebGL_API 27. テクスチャデータをシェーダに送る(ユニット 0)
	this.core.gl.uniform1i(this.shader_program.uniform_locations.uSampler, 0);

	// WebGL_API 28. 送信
	this.core.gl.bindBuffer(this.core.gl.ELEMENT_ARRAY_BUFFER, this.myon.indexObject);
	this.core.gl.drawElements(this.core.gl.TRIANGLES, this.myon.numVertices(), this.core.gl.UNSIGNED_SHORT, 0);
};

SceneTitle.prototype.renderFPS = function(){
	// WebGL_API 21. uniform 変数にデータを登録する
	// 4fv -> vec4, 3fv -> vec3, 1f -> float
	this.core.gl.uniformMatrix4fv(this.shader_program.uniform_locations.mvpMatrix, false, this.mvpMatrix);

	// attribute 変数にデータを登録する
	this.attribSetup(this.shader_program.attribute_locations.position, this.fps.positionObject,  3);
	this.attribSetup(this.shader_program.attribute_locations.color, this.fps.colorObject,  4);
	this.attribSetup(this.shader_program.attribute_locations.textureCoord, this.fps.textureObject,  2);

	// WebGL_API 25. 有効にするテクスチャユニットを指定(今回は0)
	this.core.gl.activeTexture(this.core.gl.TEXTURE0);
	// WebGL_API 26. テクスチャをバインドする
	this.core.gl.bindTexture(this.core.gl.TEXTURE_2D, this.fps.texture);
	// WebGL_API 27. テクスチャデータをシェーダに送る(ユニット 0)
	this.core.gl.uniform1i(this.shader_program.uniform_locations.uSampler, 0);

	// WebGL_API 28. 送信
	this.core.gl.bindBuffer(this.core.gl.ELEMENT_ARRAY_BUFFER, this.fps.indexObject);
	this.core.gl.drawElements(this.core.gl.TRIANGLES, this.fps.numVertices(), this.core.gl.UNSIGNED_SHORT, 0);
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
