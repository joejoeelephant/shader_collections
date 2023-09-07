'use client'
import React, {useEffect, useRef} from 'react'
import * as PIXI from 'pixi.js';
import masahiroImg from '../../../public/masahiro.jpg'
import {BulgePinchFilter} from '@pixi/filter-bulge-pinch';
import gsap from 'gsap';

export default function PixiApp() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(!containerRef.current) return;
        const app = new PIXI.Application({
            width: 600,
            height: 800,
            backgroundColor: 0x1099bb,
        });
        containerRef.current.appendChild(app.view as HTMLCanvasElement);
        const stage = app.stage;

        const texture = PIXI.Texture.from(masahiroImg.src)

        const bgSprite = new PIXI.Sprite(texture)
        bgSprite.width = app.view.width;
        bgSprite.height = app.view.height;

        const bulgeFilter = new BulgePinchFilter();
        bulgeFilter.radius = 700
        bulgeFilter.strength = 0.2
        bulgeFilter.center = [0.5,0.2]

        const container = new PIXI.Container();

        container.addChild(bgSprite);
        container.filters = [bulgeFilter]

        stage.addChild(container)

        // Make the stage interactive
        app.stage.interactive = true;

        // Add the mousemove event listener
        app.stage.on('mousemove', (event) => {
            const { x, y } = event.global
            bulgeFilter.center = [x / bgSprite.width, y / bgSprite.height];
            gsap.to(bulgeFilter, {
                radius: 700,
                overwrite: true,
                duration: 2
            });
        });

        app.stage.on('mouseleave', (event) => {
            gsap.to(bulgeFilter, {
                radius: 300,
                overwrite: true
            });
        });
        return () => {
            app.destroy(true, {
              children: true,
              texture: true,
              baseTexture: true,
            });
        };
    }, [])
    return (
        <div ref={containerRef}></div>
    )
}
