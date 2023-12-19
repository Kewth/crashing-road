import * as THREE from "three";

export class TrailCamera {
    camera: THREE.PerspectiveCamera
    focusMesh: THREE.Mesh
    relativeDistance: number
    move: number

    constructor(focusMesh: THREE.Mesh) {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        )
        this.camera.rotateX(Math.PI * 0.3);
        this.focusMesh = focusMesh
        this.relativeDistance = 0
        this.move = 0
    }

    update() {
        this.relativeDistance += this.move
        this.camera.position.set(
            this.focusMesh.position.x,
            this.focusMesh.position.y - 10 - 20 * this.relativeDistance,
            this.focusMesh.position.z + 10 + 10 * this.relativeDistance,
        );
    }
}