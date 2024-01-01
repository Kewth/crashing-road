import * as THREE from "three";
import { Car } from "./car";
import * as exp from "constants";
import * as CANNON from "cannon-es"
import { PhysicalObject } from "./physicalObject";
import { threadId } from "worker_threads";

const driftMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
const driftGeometry = new THREE.PlaneGeometry(0.1 , 0.1);

export class DriftCreator {
    car: Car
    dirft_list: THREE.Mesh[]
    dirft_index: number
    dirft_limit: number

    constructor(car: Car) {
        this.car = car;
        this.dirft_list = [];
        this.dirft_index = 0;
        this.dirft_limit = 1000;
        for (let i = 0; i < this.dirft_limit; i ++)
            this.dirft_list.push(new THREE.Mesh(driftGeometry, driftMaterial));
    }

    update() {
        if (is_drifting(this.car)) {
            let carHeading = this.car.direction()
            carHeading = carHeading.multiplyScalar(1)
            let carHeadingNormal = new THREE.Vector3(-carHeading.y, carHeading.x, 0)
            carHeadingNormal = carHeadingNormal.multiplyScalar(0.4)

            const drift_mark1 = this.dirft_list[this.dirft_index];
            drift_mark1.position.set(this.car.pos.x + carHeading.x - carHeadingNormal.x, this.car.pos.y + carHeading.y - carHeadingNormal.y, 0.01);
            const drift_mark2 = this.dirft_list[(this.dirft_index + 1) % this.dirft_limit];
            drift_mark2.position.set(this.car.pos.x + carHeading.x + carHeadingNormal.x, this.car.pos.y + carHeading.y + carHeadingNormal.y, 0.01);
            const drift_mark3 = this.dirft_list[(this.dirft_index + 2) % this.dirft_limit];
            drift_mark3.position.set(this.car.pos.x - carHeading.x - carHeadingNormal.x, this.car.pos.y - carHeading.y - carHeadingNormal.y, 0.01);
            const drift_mark4 = this.dirft_list[(this.dirft_index + 3) % this.dirft_limit];
            drift_mark4.position.set(this.car.pos.x - carHeading.x + carHeadingNormal.x, this.car.pos.y - carHeading.y + carHeadingNormal.y, 0.01);
            this.dirft_index = (this.dirft_index + 4) % this.dirft_limit;

            [drift_mark1, drift_mark2, drift_mark3, drift_mark4].forEach(drift_mark => {
                drift_mark.receiveShadow = true;
                drift_mark.parent || this.car.scene().add(drift_mark);
            })
        }
    }
}

function is_drifting(car: Car) {
    // const car_heading = car.obj3d.getWorldDirection(new THREE.Vector3()).normalize();
    // console.log(car.pos.z)
    if(car.pos.z > 0.65) { // the car is not touching the ground
        return false;
    }
    const car_heading = car.direction()
    // console.log(car_heading)
    const velocity_direction = new THREE.Vector3(car.velocity.x, car.velocity.y, 0).normalize();
    // console.log(velocity_direction)
    const dot_product = car_heading.dot(velocity_direction);
    if(Math.abs(dot_product) < 0.997) {
        return true;
    }
    return false;
}