import { LaneFenceGenerator } from "./laneFence";
import { Setting } from "./setting";

export class ObsTester {
    laneFenceGen: LaneFenceGenerator;
    constructor(laneFenceGen: LaneFenceGenerator) {
        this.laneFenceGen = laneFenceGen;
    }
    hasFenceOnTheLeft(lane: number, y: number) {
        return this.laneFenceGen.hasFenceOnTheLeft(lane, y);
    }
    hasFenceOnTheRight(lane: number, y: number) {
        return this.laneFenceGen.hasFenceOnTheRight(lane, y);
    }
}