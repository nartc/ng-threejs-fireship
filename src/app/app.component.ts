import { Component } from '@angular/core';
import { NgtCanvas } from 'angular-three';
import { PortfolioComponent } from './portfolio';
import { Scene } from './scene';

@Component({
    selector: 'app-root',
    standalone: true,
    template: `
        <div class="canvas-container">
            <ngt-canvas [sceneGraph]="scene" [linear]="true" [camera]="{ position: [-3, 0, 30] }" />
        </div>
        <app-portfolio />
    `,
    styles: [
        `
            .canvas-container {
                position: fixed;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
            }
        `,
    ],
    imports: [PortfolioComponent, NgtCanvas],
})
export class AppComponent {
    readonly scene = Scene;
}
