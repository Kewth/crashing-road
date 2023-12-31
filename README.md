## How to run?

`npm run dev`

## How to deploy?

`npm run build` + `npm run deploy`

## How to play?

- Vehicle Control
  - w/a/s/d: movement
  - space: brake
- Camera Control
  - up/down: zoom in/out

## change log

>
changelog in 12/31:
  updated 12/31 23:11
    use ground texture
  updated 12/31 22:47
    add patrol police car
  updated 12/31 22:08
    framework update: player class
    add game over detection
  updated 12/31 X
    update bottom informtaion bar
    add a distance remainder embedded in the road
  updated 12/31 20:19
    use a 3d model to render aggressive cars
  updated 12/31 20:04
    framework update: car config
    add dummyLaneAI, which try to keep a car in the middle of the closest lane in a simple way
    generate trucks, and use a truck 3d model to render them
  updated 12/31 17:25
    framework update: CANNON material
    generate fences between lanes
    make fences cast shdows
  updated 12/31 15:29
    framework update: write obstacle generator as a updatable class
    optimize: obstacles are created at initial, their positions are changed during updating
    obstacles are generated in the center of the lane
  updated 12/31 14:41
    road texture adapts the number of lanes (in Setting)
  updated 12/31 14:37
    framework update: never use scene/world directly in Car or other custom class
    aggressive AI car can keep a maximum distance (in Setting) from player
  updated 12/31 06:14
    drive force is divided by speed to avoid infinitely fast car
    npc cars respawn if lagging behind too much
>