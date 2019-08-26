precision highp float;

// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

// Uniforms
uniform vec3 target;

// Refs
uniform vec3 cameraPosition;
uniform sampler2D textureSampler;

void main(void) {
    // Light
    vec3 color = texture2D(textureSampler, vUV).rgb;
    
    vec3 toTarget = normalize(target);
    float dot = dot(toTarget, normalize(vNormal));
    float alpha = (dot + 1.) / 2.0;
    alpha = alpha > 0.5 ? 1.0 : 0.0;
    
    vec3 toCamera = vPosition - cameraPosition;
    //float cameraNormalDot = dot(normalize(toCamera), vNormal); 

    if(!gl_FrontFacing) {
        color = vec3(0.5, 0.5, 0.5);
        
        /*
        if(cameraNormalDot >= 0.0) {
            discard;
        }*/
    }
        
    gl_FragColor = vec4(color, alpha);
}