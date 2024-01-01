import * as THREE from "three";
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { Setting } from "./setting";

const material = new THREE.MeshPhongMaterial({ color: 0xdddddd });
const loader = new FontLoader();
let font: Font | undefined = undefined;
loader.load(
    'fonts/font.json',
    f => font = f,
    undefined,
    err => console.error(err)
);

export class DistanceRemainder {
    private focusObj: THREE.Object3D
    private scene: THREE.Scene
    private nowDis: number

    constructor(focusObj: THREE.Object3D, scene: THREE.Scene) {
        this.focusObj = focusObj;
        this.scene = scene;
        this.nowDis = 0;
    }

    update() {
        if (font === undefined) return;
        const dis = this.focusObj.position.y;
        while (dis + Setting.generateDistance > this.nowDis) {
            const geometry = new TextGeometry( `${this.nowDis.toFixed(0)} m`, {
                font: font,
                size: 80,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 8,
                bevelSegments: 5
            } );
            geometry.scale(0.02, 0.05, 0.02);
            geometry.computeBoundingBox();
            const width = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(-width * 0.5, this.nowDis, 0);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.nowDis += 100;
        }
    }
}