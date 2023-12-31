import * as CANNON from "cannon-es";

export const CANNONMaterial = {
    wall: new CANNON.Material("wall"),
    chassis: new CANNON.Material("chassis"),
    wheel: new CANNON.Material("wheel"),
    ground: new CANNON.Material("ground"),
}