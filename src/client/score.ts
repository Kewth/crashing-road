import { Car } from "./car"

export class ScoreMantainer {
    plyCar: Car
    score: number
    list3d: THREE.Object3D[]
    listScore: number[]
    scoreContainer: HTMLDivElement

    constructor(plyCar: Car) {
        this.plyCar = plyCar;
        this.score = 0;
        this.list3d = [];
        this.listScore = [];
        this.scoreContainer = document.getElementById('score-container') as HTMLDivElement;
        setInterval(() => {
            this.list3d.forEach(obj => {
                if (obj.position.y < plyCar.pos.y - 1) {
                    const index = this.list3d.indexOf(obj);
                    this.score += this.listScore[index];
                    this.list3d.splice(index, 1);
                    this.listScore.splice(index, 1);
                }
            })
            this.scoreContainer.textContent = `Score: ${this.score.toFixed(0)}`;
        }, 200)
    }

    addFocus(obj: THREE.Object3D, s: number) {
        this.list3d.push(obj);
        this.listScore.push(s);
    }
}