precision mediump float;

uniform sampler2D uSampler;
varying vec4      vColor;
varying vec2      vTextureCoord;

void main(void){
    vec4 smpColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor  = vColor * smpColor;
}
