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
        const drift_mark1 = new PhysicalObject(
            new THREE.Mesh(driftGeometry, driftMaterial),
            new CANNON.Body(),
        );
        drift_mark1.body.quaternion.setFromEuler(0, 0, 0);
        drift_mark1.obj.receiveShadow = true;
        drift_mark1.body.position.set(car.pos.x+carHeading.x-carHeadingNormal.x, car.pos.y+carHeading.y-carHeadingNormal.y, 0.01);
        drift_mark1.addin(car.scene(), car.world())
        drift_mark1.update()

        const drift_mark2 = new PhysicalObject(
            new THREE.Mesh(driftGeometry, driftMaterial),
            new CANNON.Body(),
        );
        drift_mark2.body.quaternion.setFromEuler(0, 0, 0);
        drift_mark2.obj.receiveShadow = true;
        drift_mark2.body.position.set(car.pos.x+carHeading.x+carHeadingNormal.x, car.pos.y+carHeading.y+carHeadingNormal.y, 0.01);
        drift_mark2.addin(car.scene(), car.world())
        drift_mark2.update()

        const drift_mark3 = new PhysicalObject(
            new THREE.Mesh(driftGeometry, driftMaterial),
            new CANNON.Body(),
        );
        drift_mark3.body.quaternion.setFromEuler(0, 0, 0);
        drift_mark3.obj.receiveShadow = true;
        drift_mark3.body.position.set(car.pos.x-carHeading.x-carHeadingNormal.x, car.pos.y-carHeading.y-carHeadingNormal.y, 0.01);
        drift_mark2.addin(car.scene(), car.world())
        drift_mark3.update()

        const drift_mark4 = new PhysicalObject(
            new THREE.Mesh(driftGeometry, driftMaterial),
            new CANNON.Body(),
        );
        drift_mark4.body.quaternion.setFromEuler(0, 0, 0);
        drift_mark4.obj.receiveShadow = true;
        drift_mark4.body.position.set(car.pos.x-carHeading.x+carHeadingNormal.x, car.pos.y-carHeading.y+carHeadingNormal.y, 0.01);
        drift_mark2.addin(car.scene(), car.world())
        drift_mark4.update()
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