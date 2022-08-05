import { VEHICLE_TYPE } from '../../../../shared/enums/vehicleTypeFlags';
import { GarageFunctions } from '../src/view';

const garage = {
    positionInside: {
        position: { x: 231.79, y: -1004.44, z: -100 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    positionOutside: {
        position: { x: 210.70538330078125, y: -938.3577270507812, z: 23.540021896362305 },
        rotation: { x: 0, y: 0, z: -2.187699317932129 },
    },
    positionToInside: { x: 214.8854522705078, y: -933.1239013671875, z: 23.1415958404541 },
    positionToOutside: { x: 224.55, y: -1004.44, z: -100 },
    type: VEHICLE_TYPE.VEHICLE,
    index: 'metro-garage',
    name: 'Metro Verwaltung',
};

GarageFunctions.add(garage);
