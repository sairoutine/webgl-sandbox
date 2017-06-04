'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var CONSTANT = require('../hakurei').constant;
var ShaderProgram = require('../shader_program');
var VS = require('../shader/main.vs');
var FS = require('../shader/main.fs');

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

	//this.object = new Triangle(this.core.gl);

	/*
	var light_color       = [1.0, 0.5, 0.0];
	var light_position    = [0,0,1];
	var light_attenuation = [0.3, 0.1, 0.05];
	this.light = new PointLight(light_color, light_position, light_attenuation);
	this.camera = new Camera();
	*/
};





SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);
};


SceneTitle.prototype.draw = function(){
};

module.exports = SceneTitle;
