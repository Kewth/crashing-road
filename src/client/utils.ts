class PIDController {
    private integral = 0;
    private previousError = 0;

    constructor(private kp: number, private ki: number, private kd: number) {}

    update(error: number, dt: number): number {
        const p = this.kp * error;
        this.integral += error * dt;
        const i = this.ki * this.integral;
        const d = this.kd * (error - this.previousError) / dt;
        this.previousError = error;
        return p + i + d;
    }
}

export {PIDController}