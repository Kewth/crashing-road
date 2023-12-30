import * as THREE from "three";

const ShadowRange = 16

export class CustomLight {
    light: THREE.DirectionalLight
    focusObj: THREE.Object3D
    
    constructor(focusObj: THREE.Object3D, scene: THREE.Scene) {
        this.light = new THREE.DirectionalLight();
        this.light.castShadow = true;
        this.light.shadow.camera.left = -5 * ShadowRange;
        this.light.shadow.camera.right = 5 * ShadowRange;
        this.light.shadow.camera.top = 5 * ShadowRange;
        this.light.shadow.camera.bottom = -5 * ShadowRange;
        this.light.shadow.camera.far = 100 * ShadowRange
        this.light.shadow.mapSize.height = 512 * ShadowRange;
        this.light.shadow.mapSize.width = 512 * ShadowRange;
        scene.add(this.light)
        scene.add(this.light.target)
        this.focusObj = focusObj
    }
    
    update() {
        this.light.position.set(
            this.focusObj.position.x + 20 * ShadowRange,
            this.focusObj.position.y + 40 * ShadowRange,
            this.focusObj.position.z + 20 * ShadowRange,
        );
        this.light.target.position.copy(this.focusObj.position);
    }
}