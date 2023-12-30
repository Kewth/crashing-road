import * as THREE from "three";
import { Car } from "./car";
import { PIDController } from "./utils";
import { Vec3 } from "cannon-es";

function castToXY(v3: THREE.Vector3) {
    return new THREE.Vector2(v3.x, v3.y)
}

function castToVector3(v3: Vec3) {
    return new THREE.Vector3(v3.x, v3.y, v3.z);
}

function getDirectionalOffset(vec: THREE.Vector2, target: THREE.Vector2) {
    vec = vec.normalize() // normalizing a zero vector returns a zero vector
    target = target.normalize()
    return vec.x * target.y - vec.y * target.x
}

function aggressiveAI(car: Car, target: Car) {
    const pos = castToXY(car.pos())
    let targetpos = castToXY(target.pos())
    const relDisp = targetpos.clone().sub(pos)
    const v = castToXY(castToVector3(car.velocity()))
    const targetv = castToXY(castToVector3(target.velocity()))
    const maxv = 15
    
    let vcon = new PIDController(0.1, 0.05, 0.01)
    let xcon = new PIDController(0.1, 0, 0.5)
    car.drive(0.4 * vcon.update(maxv - car.velocity().length(), 0.1));
    const posx = car.pos().x;
    car.steer(xcon.update(getDirectionalOffset(v, relDisp), 0.1))
}

export { aggressiveAI };
