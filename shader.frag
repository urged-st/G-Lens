#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  vec3 col = vec3(uv.x, uv.y, 0.2 + 0.2 * sin(u_time));

  gl_FragColor = vec4(col, 1.0);
}