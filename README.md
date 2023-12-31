## How to run?

`npm run dev`

## How to play?

- Vehicle Control
  - w/a/s/d: movement
  - space: brake
- Camera Control
  - up/down: zoom in/out

changelog:
  updated 12/31 14:41
    road texture adapts the number of lanes (in Setting)
  updated 12/31 14:37
    framework update, never use scene/world directly in Car or other custom class
    aggressive AI car can keep a maximum distance (in Setting) from player
  updated 12/31 06:14
    drive force is divided by speed to avoid infinitely fast car
    npc cars respawn if lagging behind too much