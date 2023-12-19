import * as THREE from "three";

export class CustomLight {
    light: THREE.DirectionalLight
    focusMesh: THREE.Mesh
    
    constructor(scene: THREE.Scene, focusMesh: THREE.Mesh) {
        this.light = new THREE.DirectionalLight();
        this.light.castShadow = true;
        scene.add(this.light)
        scene.add(this.light.target)
        this.focusMesh = focusMesh
    }
    
    update() {
        this.light.position.set(
            this.focusMesh.position.x + 2,
            this.focusMesh.position.y + 4,
            this.focusMesh.position.z + 2,
        );
        this.light.target.position.set(
            this.focusMesh.position.x - 2,
            this.focusMesh.position.y - 4,
            this.focusMesh.position.z - 2,
        );
    }
}