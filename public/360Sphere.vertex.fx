precision highp float;

#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..8]

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform float flatness;

// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

void main(void) {
    float z = 0.0;
    float y = position.y;
    float x = 2.0 - (uv.x * 4.0);
    vec4 flatPosition = vec4(x, y, z, 1.0);
    vec4 diff = flatPosition - vec4(position, 1.0);
    vec4 final = vec4(position, 1.0) + (diff * flatness);
    vec4 outPosition = worldViewProjection * final;//vec4(position, 1.0);
    gl_Position = outPosition;
    
    vUV = uv;
    vPosition = position;
    vNormal = normal;
}
