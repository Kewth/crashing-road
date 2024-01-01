import * as THREE from "three";
import { Car } from "./car";
import { DriftCreator } from "./drift";

function getX (event: TouchEvent) {
    return (event.touches[0].pageX / window.innerWidth) * 2 - 1;
}
function getY (event: TouchEvent) {
    return (event.touches[0].pageY / window.innerHeight) * 2 - 1;
}

export class Player {
    car: Car
    live: boolean
    driftCrt: DriftCreator
    drivingDirection: number

    constructor(car: Car) {
        this.car = car;
        this.live = true;
        this.driftCrt = new DriftCreator(car);
        this.drivingDirection = 0;
        this.car.chassisBody.addEventListener("collide", (e: any) => {
            if (this.live && e.body.configName === "police") {
                // game over
                this.live = false;
                this.drivingDirection = 0;
                this.car.steer(0);
                this.car.brake(0);
                const container1 = document.getElementById('gameover-container-1') as HTMLDivElement
                container1.textContent = `GAME OVER`
                const container2 = document.getElementById('gameover-container-2') as HTMLDivElement
                container2.textContent = `You traveled ${this.car.pos.y.toFixed(0)} m`
            }
        })
        // Add force on keydown
        document.addEventListener("keydown", (event) => {
            if (!this.live) return;
            switch (event.key) {
                case "W": case "w": this.drivingDirection = +1; break;
                case "S": case "s": this.drivingDirection = -1; break;
                case "A": case "a": car.steer(1); break;
                case "D": case "d": car.steer(-1); break;
                case "l": // just for fun
                    if (car.isFullyOnGround()) car.velocity.z = 10;
                    break;
                case " ": car.brake(1); break;
            }
        });
        // Reset force on keyup
        document.addEventListener("keyup", (event) => {
            if (!this.live) return;
            switch (event.key) {
                case "W": case "w": this.drivingDirection = 0; break;
                case "S": case "s": this.drivingDirection = 0; break;
                case "A": case "a": car.steer(0); break;
                case "D": case "d": car.steer(0); break;
                case " ": car.brake(0); break;
            }
        });
        // on mobile
        document.addEventListener("touchstart", (event) => {
            car.brake(0);
            const x = getX(event);
            const y = getY(event);
            this.drivingDirection = -y;
            const car_heading = car.direction()
            const velocity_direction = new THREE.Vector3(car.velocity.x, car.velocity.y, 0).normalize();
            const dot_product = car_heading.dot(velocity_direction);
            if(-y < 0) {
                if(dot_product > 0) {
                    this.drivingDirection = 0;
                    car.brake(y);
                }
            }
            car.steer(-x);
        })
        document.addEventListener("touchmove", (event) => {
            car.brake(0);
            const x = getX(event);
            const y = getY(event);
            this.drivingDirection = -y;
            const car_heading = car.direction()
            const velocity_direction = new THREE.Vector3(car.velocity.x, car.velocity.y, 0).normalize();
            const dot_product = car_heading.dot(velocity_direction);
            if(-y < 0) {
                if(dot_product > 0) {
                    this.drivingDirection = 0;
                    car.brake(y);
                }
            }
            car.steer(-x);
        })
        document.addEventListener("touchend", (event) => {
            car.brake(0);
            this.drivingDirection = 0;
            car.steer(0);
        })
        // drive control
        this.car.world().addEventListener("preStep", () => {
            const r = this.drivingDirection * (1 - this.car.velocity.length() / 50);
            this.car.drive(r);
        })
    }

    update() {
        this.car.update();
        this.driftCrt.update();
    }

    get obj3d () { return this.car.obj3d; }
}