import * as THREE from "three";
import { Car } from "./car";
import * as exp from "constants";
import * as CANNON from "cannon-es"
import { PhysicalObject } from "./physicalObject";
import { threadId } from "worker_threads";

const driftMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
const driftGeometry = new THREE.PlaneGeometry(0.1 , 0.1);

function update_drift(car: Car) {
    if(is_drifting(car)) {
        let carHeading = car.direction()
        carHeading = carHeading.multiplyScalar(1)
        let carHeadingNormal = new THREE.Vector3(-carHeading.y, carHeading.x, 0)
        carHeadingNormal = carHeadingNormal.multiplyScalar(0.4)

        const drift_mark1 = new THREE.Mesh(driftGeometry, driftMaterial);
        drift_mark1.receiveShadow = true;
        drift_mark1.position.set(car.pos.x+carHeading.x-carHeadingNormal.x, car.pos.y+carHeading.y-carHeadingNormal.y, 0.01);
        car.scene().add(drift_mark1)

        const drift_mark2 = new THREE.Mesh(driftGeometry, driftMaterial);
        drift_mark2.receiveShadow = true;
        drift_mark2.position.set(car.pos.x+carHeading.x+carHeadingNormal.x, car.pos.y+carHeading.y+carHeadingNormal.y, 0.01);
        car.scene().add(drift_mark2)

        const drift_mark3 = new THREE.Mesh(driftGeometry, driftMaterial);
        drift_mark3.receiveShadow = true;
        drift_mark3.position.set(car.pos.x-carHeading.x-carHeadingNormal.x, car.pos.y-carHeading.y-carHeadingNormal.y, 0.01);
        car.scene().add(drift_mark3)

        const drift_mark4 = new THREE.Mesh(driftGeometry, driftMaterial);
        drift_mark4.receiveShadow = true;
        drift_mark4.position.set(car.pos.x-carHeading.x+carHeadingNormal.x, car.pos.y-carHeading.y+carHeadingNormal.y, 0.01);
        car.scene().add(drift_mark3)
    }
}

export{update_drift}

function is_drifting(car: Car) {
    // const car_heading = car.obj3d.getWorldDirection(new THREE.Vector3()).normalize();
    // console.log(car.pos.z)
    if(car.pos.z > 0.65) { // the car is not touching the ground
        return false;
    }
    const car_heading = car.direction()
    // console.log(car_heading)
    const velocity_direction = new THREE.Vector3(car.velocity.x, car.velocity.y, 0).normalize();
    console.log(velocity_direction)
    const dot_product = car_heading.dot(velocity_direction);
    if(Math.abs(dot_product) < 0.997) {
        return true;
    }
    return false;
}