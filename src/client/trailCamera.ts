import * as THREE from "three";

export class TrailCamera {
    camera: THREE.PerspectiveCamera
    focusObj: THREE.Object3D
    relativeDistance: number
    move: number
    private firstPerson: boolean

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
        this.firstPerson = false;
    }

    toggleFirstPerson() {
        this.firstPerson = !this.firstPerson;
        if (!this.firstPerson) {
            this.camera.quaternion.set(0, 0, 0, 1);
            this.camera.rotateX(Math.PI * 0.27);
            this.relativeDistance = 0;
            this.move = 0;
        }
    }

    update() {
        if (this.firstPerson) {
            this.camera.position.set(
                this.focusObj.position.x,
                this.focusObj.position.y + 2.5,
                this.focusObj.position.z + 1,
            );
            this.camera.quaternion.copy(this.focusObj.quaternion);
            this.camera.rotateX(Math.PI * 0.5);
        }
        else {
            this.relativeDistance += this.move
            this.camera.position.set(
                this.focusObj.position.x,
                this.focusObj.position.y - 10 - 20 * this.relativeDistance,
                this.focusObj.position.z + 10 + 10 * this.relativeDistance,
            );
        }
    }
}