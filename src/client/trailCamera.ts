import * as THREE from "three";

export class TrailCamera {
    camera: THREE.PerspectiveCamera
    focusObj: THREE.Object3D
    relativeDistance: number
    move: number

    constructor(focusObj: THREE.Object3D) {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        )
        this.camera.rotateX(Math.PI * 0.27);
        this.focusObj = focusObj
        this.relativeDistance = 0
        this.move = 0
    }

    update() {
        this.relativeDistance += this.move
        this.camera.position.set(
            this.focusObj.position.x,
            this.focusObj.position.y - 10 - 20 * this.relativeDistance,
            this.focusObj.position.z + 10 + 10 * this.relativeDistance,
        );
    }
}