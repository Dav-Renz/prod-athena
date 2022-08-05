import { VEHICLE_TYPE } from '../../../../shared/enums/vehicleTypeFlags';
import { GarageFunctions } from '../src/view';

const entrance1 = {
    positionInside: {
        position: { x: -300.48870849609375, y: -574.2182006835938, z: 27.582979202270508 },
        rotation: { x: 0, y: 0, z: 2.2436306476593018 },
    },
    positionOutside: {
        position: { x: -276.4252014160156, y: -565.8280029296875, z: 29.79645538330078 },
        rotation: { x: 0, y: 0, z: -1.6327221393585205 },
    },
    positionToInside: { x: -276.60369873046875, y: -563.7752075195312, z: 29.83741569519043 },
    positionToOutside: { x: -295.634765625, y: -578.6090087890625, z: 26.43280601501465 },
    type: VEHICLE_TYPE.VEHICLE,
    index: 'lsta-garage-ent1',
    name: 'LSTA-HQ',
};

const entrance2 = {
    positionInside: {
        position: { x: -348.24908447265625, y: -623.4629516601562, z: 26.26559066772461 },
        rotation: { x: 0, y: 0, z: -0.8539521098136902 },
    },
    positionOutside: {
        position: { x: -367.08148193359375, y: -643.1355590820312, z: 31.36298179626465 },
        rotation: { x: 0, y: 0, z: -3.0703656673431396 },
    },
    positionToInside: { x: -363.7146911621094, y: -641.8184814453125, z: 30.53265380859375 },
    positionToOutside: { x: -352.993896484375, y: -618.9620971679688, z: 26.267332077026367 },
    type: VEHICLE_TYPE.VEHICLE,
    index: 'lsta-garage-ent2',
    name: 'Metro Verwaltung',
};

GarageFunctions.add(entrance1);
GarageFunctions.add(entrance2);
