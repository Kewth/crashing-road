import { Car } from "./car";
import { DriftCreator } from "./drift";

export class Player {
    car: Car
    live: boolean
    driftCrt: DriftCreator

    constructor(car: Car) {
        this.car = car;
        this.live = true;
        this.driftCrt = new DriftCreator(car);
        this.car.chassisBody.addEventListener("collide", (e: any) => {
            if (this.live && e.body.configName === "police") {
                // game over
                this.live = false;
                this.car.drive(0);
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
                case "w": car.drive(1); break;
                case "s": car.drive(-1); break;
                case "a": car.steer(1); break;
                case "d": car.steer(-1); break;
                case "l": // just for fun
                    if (car.pos.z < 2) car.velocity.z = 10;
                    break;
                case " ": car.brake(1); break;
            }
        });
        // Reset force on keyup
        document.addEventListener("keyup", (event) => {
            if (!this.live) return;
            switch (event.key) {
                case "w": car.drive(0); break;
                case "s": car.drive(0); break;
                case "a": car.steer(0); break;
                case "d": car.steer(0); break;
                case " ": car.brake(0); break;
            }
        });
    }

    update() {
        this.car.update();
        this.driftCrt.update();
    }

    get obj3d () { return this.car.obj3d; }
}