import { VEHICLE_TYPE } from '../../../shared/enums/vehicleTypeFlags';
import { Vector3 } from '../../../shared/interfaces/vector';

export default interface IPortGarage {
    positionToInside: Vector3;
    positionInside: { position: Vector3; rotation: Vector3 };
    positionToOutside: Vector3;
    positionOutside: { position: Vector3; rotation: Vector3 };
    entrydoors?: Array<{ position: Vector3; rotation: Vector3 }>;
    type: VEHICLE_TYPE;
    index: string | number;
    name: string;
}
