'use strict';

var Triangle = function(gl) {
	this.gl = gl;

	// 頂点属性を格納する配列
	this.position = [
		-1.0,  2.0,  1.0,
		 1.0,  2.0,  1.0,
		-1.0,  0.0,  1.0,
		 1.0,  0.0,  1.0
	];
	this.color = [
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0
	];
	// 頂点のインデックスを格納する配列
	this.index = [
		0, 1, 2,
		3, 2, 1
	];
	this.textureCoord = [
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0
	];



	// WebGL_API 16. 頂点バッファを作成
	this.positionObject   = gl.createBuffer();
	this.colorObject      = gl.createBuffer();
	this.indexObject      = gl.createBuffer();
	this.textureObject    = gl.createBuffer();

	var image = this.createImage();
	this.texture = this.createTexture(gl, image);
};

Triangle.prototype.update = function(fps) {
	var image = this.createImage(fps);

	this.texture = this.createTexture(this.gl, image);


	// WebGL_API 17. 頂点バッファをバインド
	// WebGL_API 18. 頂点バッファにデータをセットする
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionObject);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.position), this.gl.STATIC_DRAW);

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorObject);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.color), this.gl.STATIC_DRAW);

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureObject);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoord), this.gl.STATIC_DRAW);

	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexObject);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index), this.gl.STATIC_DRAW);

	// 頂点バッファのバインドをクリア
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
};
Triangle.prototype.numVertices = function() {
	return this.index.length;
};

Triangle.prototype.createImage = function(fps) {
	if(!fps) fps = 60;

	var canvas = document.createElement("canvas");
	canvas.width = canvas.height = 64;
	var ctx = canvas.getContext("2d");

	var text = 'FPS: ' + fps;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.font = "20px 'Migu'";
	ctx.fillText(text, 0, 20);

	return canvas;
};

Triangle.prototype.createTexture = function(gl, image) {
	// WebGL_API 11. テクスチャを作成
	var texture = gl.createTexture();

	// WebGL_API 12. 頂点バッファをバインドする
	gl.bindTexture(gl.TEXTURE_2D, texture);
	// WebGL_API 13. テクスチャへイメージを適用
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	// WebGL_API 14. ミップマップを生成
	gl.generateMipmap(gl.TEXTURE_2D);

	// WebGL_API 15. テクスチャパラメータの設定
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //テクスチャが縮小される際の補間方法
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //テクスチャが拡大される際の補間方法
	gl.bindTexture(gl.TEXTURE_2D, null);

	return texture;
};

module.exports = Triangle;
