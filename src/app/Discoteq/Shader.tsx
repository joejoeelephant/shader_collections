'use client'
import React, {useRef, useEffect} from 'react'
import * as THREE from 'three';

const vertexShader = `
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader
const fragmentShader = `
    uniform float iTime;
    uniform vec2 iResolution;

    float S(float a, float b, float t) {
        return smoothstep(a, b, t);
    }

    vec4 Line(vec2 uv, float speed, float height, vec3 col) {
        uv.y += S(1., 0., abs(uv.x)) * sin(iTime * speed + uv.x * height) * .2;
        return vec4(S(.06 * S(.2, .9, abs(uv.x)), 0., abs(uv.y) - .004) * col, 1.0) * S(1., .3, abs(uv.x));
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - .5 * iResolution.xy) / iResolution.y;
        vec4 O = vec4(0.);
        for (float i = 0.; i <= 5.; i += 1.) {
            float t = i / 5.;
            O += Line(uv, 1. + t, 4. + t, vec3(.2 + t * .7, .2 + t * .4, 0.3));
        }
        gl_FragColor = O;
    }
`;

export default function Shader() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(!containerRef.current) return;
        const container_width = containerRef.current.offsetWidth
        const container_height = containerRef.current.offsetHeight
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container_width / container_height, 0.1, 1000);
        camera.position.z = 1;
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container_width , container_height);
        containerRef.current.appendChild(renderer.domElement)

        // Create material with these shaders
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                iTime: { value: 0.0 },
                iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            }
        });

        // Create mesh with this material
        const geometry = new THREE.PlaneGeometry(12, 12);
        const mesh = new THREE.Mesh(geometry, material);

        // Add mesh to scene
        scene.add(mesh);

        const animate = () => {
            renderer.render(scene, camera);
            material.uniforms.iTime.value += 0.02;
            requestAnimationFrame(animate);
        };
        
        animate();

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose(); // Cleanup on component unmount
        };
    }, [])

    return (
        <div ref={containerRef} className='h-screen'></div>
    )
}
