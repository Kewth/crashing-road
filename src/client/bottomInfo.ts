import * as THREE from "three";
import { Car } from "./car"
import { Setting } from "./setting";

export class BottomInfo {
    distanceContainer: HTMLDivElement
    aggressiveDistanceContainer: HTMLDivElement
    player3d: THREE.Object3D
    aggressive3d: THREE.Object3D

    constructor(player3d: THREE.Object3D, aggressive3d: THREE.Object3D) {
        this.distanceContainer = document.getElementById('distance-container') as HTMLDivElement
        this.aggressiveDistanceContainer = document.getElementById('aggressive-distance-container') as HTMLDivElement
        this.player3d = player3d
        this.aggressive3d = aggressive3d
    }
    
    update() {
        this.distanceContainer.textContent = `${this.player3d.position.y.toFixed(0)} m`
        const dis = Math.abs(this.player3d.position.y - this.aggressive3d.position.y)
        this.aggressiveDistanceContainer.textContent =
            dis <= Setting.aggressiveDistance ? `${dis.toFixed(0)} m` : `>${Setting.aggressiveDistance} m`
    }
}