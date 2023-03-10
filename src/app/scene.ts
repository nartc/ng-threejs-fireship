import { DOCUMENT, NgFor, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import {
    extend,
    injectBeforeRender,
    injectNgtDestroy,
    injectNgtLoader,
    injectNgtRef,
    NgtArgs,
    NgtPush,
    NgtStore,
} from 'angular-three';
import { fromEvent, map, startWith, takeUntil } from 'rxjs';
import * as THREE from 'three';

extend(THREE);

@Component({
    standalone: true,
    template: `
        <ng-container *ngIf="textures$ | ngtPush as textures">
            <ngt-value [rawValue]="textures.space" attach="background" />

            <!--torus-->
            <ngt-mesh #torus>
                <ngt-torus-geometry *args="[10, 3, 16, 100]" />
                <ngt-mesh-standard-material color="#ff6347" />
            </ngt-mesh>

            <!--lights-->
            <ngt-point-light color="#ffffff" [position]="[5, 5, 5]" />
            <ngt-ambient-light color="#ffffff" />

            <!--stars-->
            <ngt-sphere-geometry *args="[0.25, 24, 24]" [ref]="star" />
            <ngt-mesh-standard-material #mat />
            <ngt-mesh *ngFor="let p of positions" [position]="p" [geometry]="star.nativeElement" [material]="mat" />

            <!--avatar -->
            <ngt-mesh #avatar [position]="[2, 0, -5]">
                <ngt-box-geometry *args="[3, 3, 3]"></ngt-box-geometry>
                <ngt-mesh-basic-material [map]="textures.avatar" />
            </ngt-mesh>

            <!--moon-->
            <ngt-mesh #moon [position]="[-10, 0, 23]">
                <ngt-sphere-geometry *args="[3, 32, 32]"></ngt-sphere-geometry>
                <ngt-mesh-standard-material [map]="textures.moon" [normalMap]="textures.normal" />
            </ngt-mesh>
        </ng-container>
    `,
    imports: [NgtArgs, NgtPush, NgIf, NgFor],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Scene implements OnInit {
    readonly positions: [number, number, number][] = Array.from({ length: 200 }, () => [
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(100),
    ]);

    private readonly camera = inject(NgtStore).get('camera');
    private readonly document = inject(DOCUMENT);
    private readonly ngtDestroy = injectNgtDestroy();

    readonly textures$ = injectNgtLoader(() => THREE.TextureLoader, {
        avatar: 'assets/chau.png',
        moon: 'assets/moon.jpeg',
        normal: 'assets/normal.jpeg',
        space: 'assets/space.jpeg',
    });

    readonly star = injectNgtRef<THREE.SphereGeometry>();

    @ViewChild('torus') torus?: ElementRef<THREE.Mesh>;
    @ViewChild('avatar') avatar?: ElementRef<THREE.Mesh>;
    @ViewChild('moon') moon?: ElementRef<THREE.Mesh>;

    constructor() {
        injectBeforeRender(() => {
            if (this.torus) {
                this.torus.nativeElement.rotation.x += 0.01;
                this.torus.nativeElement.rotation.y += 0.005;
                this.torus.nativeElement.rotation.z += 0.01;
            }

            if (this.moon) {
                this.moon.nativeElement.rotation.x += 0.005;
            }
        });
    }

    ngOnInit() {
        fromEvent(this.document, 'scroll')
            .pipe(
                map(() => this.document.body.getBoundingClientRect().top),
                startWith(0),
                takeUntil(this.ngtDestroy.destroy$)
            )
            .subscribe((top) => {
                if (this.moon) {
                    this.moon.nativeElement.rotation.x += 0.05;
                    this.moon.nativeElement.rotation.y += 0.075;
                    this.moon.nativeElement.rotation.z += 0.05;
                }

                if (this.avatar) {
                    this.avatar.nativeElement.rotation.y += 0.01;
                    this.avatar.nativeElement.rotation.z += 0.01;
                }

                this.camera.position.z = top * -0.01;
                this.camera.position.x = top * -0.0002;
                this.camera.rotation.y = top * -0.0002;
            });
    }
}
