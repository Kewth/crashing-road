import * as THREE from "three";
import * as CANNON from "cannon-es";
import Stats from 'three/examples/jsm/libs/stats.module'
// import CannonDebugger from "cannon-es-debugger";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { Boundary } from "./boundary";
import { JumpGenerator } from "./jump";
import { Car } from "./car";
import { DummyAI } from "./dummyAI";
import { AggressiveAI } from "./aggressiveAI";
import { initKeyBinding } from "./keyBinding";
import { TrailCamera } from "./trailCamera";
import { CustomLight } from "./customLight";
import { PhysicalObject } from "./physicalObject";
import { DashBoard } from "./dashBoard";
import { BottomInfo } from "./bottomInfo";
import { NarrowWall } from "./narrowWall";
import { randFloat } from "three/src/math/MathUtils";
import { Setting } from "./setting";
import { CANNONMaterial } from "./cannonMaterial";
import { LaneFenceGenerator } from "./laneFence";
import { TruckGenerator } from "./truck";
import { DistanceRemainder } from "./distanceRemainder";
import { Player } from "./player";

const scene = new THREE.Scene();
const world = new CANNON.World();
// const cannonDebugger = CannonDebugger(scene, world)
world.gravity.set(0, 0, -9.8);
world.step(0.1);
world.defaultContactMaterial.friction = 0;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);


const player = new Player(new Car(0, 0, 2, 'ferrari', scene, world));

const jumpGenerator = new JumpGenerator(player.obj3d, scene, world);

const laneFenceGenerator = new LaneFenceGenerator(player.obj3d, scene, world);

const aggressiveAI = new AggressiveAI(new Car(0, -20, 2, 'police', scene, world), player.car);

// let dummyAIs: DummyAI[] = [];
// for (let i = 1; i <= 20; i++) {
//     // Code to be executed in each iteration
//     dummyAIs.push(new DummyAI(0, 10 + 20 * i, 2, scene, world, jumpGenerator.obs_list));
// }

const truckGenerator = new TruckGenerator(player.obj3d, scene, world);

const distanceRemainder = new DistanceRemainder(player.obj3d, scene);

const boundary = new Boundary(player.obj3d, scene, world)

const light = new CustomLight(player.obj3d, scene);

const camera = new TrailCamera(player.obj3d)

const wheel_ground = new CANNON.ContactMaterial(
    CANNONMaterial.wheel,
    CANNONMaterial.ground,
    {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000,
    },
);
const chassis_ground = new CANNON.ContactMaterial(
    CANNONMaterial.chassis,
    CANNONMaterial.ground,
    {
        friction: 0.3,
        restitution: 0.3,
    },
);
// world.addContactMaterial(wheel_ground)
world.addContactMaterial(chassis_ground)


window.addEventListener("resize", () => {
    camera.camera.aspect = window.innerWidth / window.innerHeight;
    camera.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}, false);

initKeyBinding(player.car, camera);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('js/libs/draco/gltf/')
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
// let boxHelper: THREE.BoxHelper | undefined = undefined

gltfLoader.load(
    'models/ferrari.glb',
    gltf => {
        const model = gltf.scene.children[0];
        model.traverse(node => {
            if (node instanceof THREE.Mesh) {
                // node.receiveShadow = true;
                node.castShadow = true;
            }
        });
        model.rotateX(Math.PI / 2);
        Car.addModel('ferrari', model);
        // scene.add(carModel)
        // boxHelper = new THREE.BoxHelper( carModel, 0xffff00 );
        // scene.add(boxHelper)
    },
    undefined,
    err => { console.error(err) }
);

gltfLoader.load(
    'models/truck.glb',
    gltf => {
        const model = gltf.scene.children[0];
        model.scale.set(0.01, 0.01, 0.01);
        model.traverse(node => {
            if (node instanceof THREE.Mesh) {
                // node.receiveShadow = true;
                node.castShadow = true;
            }
        });
        model.quaternion.set(0, 0, 0, 1);
        const box = new THREE.Box3().setFromObject(model);
        model.position.x -= (box.max.x + box.min.x) / 2;
        Car.addModel('truck', model);
    },
    undefined,
    err => { console.error(err) }
);

gltfLoader.load(
    'models/police.glb',
    gltf => {
        const model = gltf.scene.children[0];
        model.traverse(node => {
            if (node instanceof THREE.Mesh) {
                // node.receiveShadow = true;
                node.castShadow = true;
            }
        });
        model.position.set(0, 0, 0);
        model.quaternion.set(0, 0, 0, 1);
        model.rotateX(Math.PI);
        model.rotateZ(Math.PI / 2);
        // const box = new THREE.Box3().setFromObject(model);
        // scene.add(model);
        // console.log(model);
        // console.log(box);
        Car.addModel('police', model);
    },
    undefined,
    err => { console.error(err) }
);


let fenceModel: THREE.Object3D | undefined = undefined
gltfLoader.load(
    'models/fence.glb',
    gltf => {
        fenceModel = gltf.scene.children[0];
        fenceModel.rotateX(Math.PI / 2);
        fenceModel.rotateY(Math.PI);
        fenceModel.traverse(node => {
            if (node instanceof THREE.Mesh) {
                node.receiveShadow = true;
                node.castShadow = true;
            }
        });
        // scene.add(fenceModel);
        boundary.useFenceModel(fenceModel);
        laneFenceGenerator.useModel(fenceModel);
        console.log(fenceModel);
    },
    undefined,
    err => { console.error(err) }
)

const textureLoader = new THREE.TextureLoader();

textureLoader.load(
    'images/road.jpg',
    tex => {
        boundary.useRoadTexture(tex);
    },
    undefined,
    err => { console.error(err) }
)

// let roadModel: THREE.Object3D | undefined = undefined
// gltfLoader.load(
//     'models/road.glb',
//     gltf => {
//         roadModel = gltf.scene.children[0];
//         roadModel.rotateX(Math.PI / 2);
//         scene.add(roadModel);
//         boundary.useRoadModel(roadModel);
//     },
//     undefined,
//     err => { console.error(err) }
// )

const bottomInfo = new BottomInfo(player.obj3d, aggressiveAI.car.obj3d);
const dashboard = new DashBoard(() => 3.6 * player.car.velocity.length()); // pass in speed in km/h

const clock = new THREE.Clock();
let delta;

type UpdateObject = { update(): void }
const updObjs: UpdateObject[] = [
    player,
    jumpGenerator,
    laneFenceGenerator,
    truckGenerator,
    aggressiveAI,
    boundary,
    light,
    camera,
    bottomInfo,
    dashboard,
    // cannonDebugger,
    distanceRemainder,
]

// let npcCars: (DummyAI|AggressiveAI)[] = [
//     ...dummyAIs,
// ]

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate);
    delta = Math.min(clock.getDelta(), 0.1);
    world.step(delta);
    updObjs.forEach(obj => obj.update());
    // for(let i = 0; i < npcCars.length; i++) {
    //     const npcCar = npcCars[i];
    //     if(npcCar.car.pos.y < playerCar.pos.y-100 && npcCar instanceof DummyAI) {
    //         // alert("failing npc")
    //         npcCar.car.destroy()
    //         npcCars.splice(i, 1)
    //         npcCars.push(new DummyAI(randFloat(-Setting.groundWidth/4, Setting.groundWidth/4), playerCar.pos.y + 500 + randFloat(-200, 200), 2, scene, world, jumpGenerator.obs_list))
    //     }
    // }
    // while(npcCars.length<15) {
    //     npcCars.push(new DummyAI(randFloat(-Setting.groundWidth/4, Setting.groundWidth/4), playerCar.pos.y + 500 + playerCar.velocity.y * 10 + randFloat(-200, 200), 2, scene, world, jumpGenerator.obs_list))
    // }
    // npcCars.forEach(obj => obj.update());
    // scene.add( new THREE.DirectionalLightHelper(light.light) )
    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera.camera);
}

// const narrowWall = new NarrowWall(100, scene, world)

animate();
