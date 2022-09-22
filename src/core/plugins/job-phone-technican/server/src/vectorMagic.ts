import { DirectionVector } from '../../../../client/utility/directionToVector';
import { Vector3 } from '../../../../shared/interfaces/vector';

export function offsettedPos(pos: Vector3, rot: Vector3, offset: Vector3): Vector3 {
    let newPos = new DirectionVector(
        new DirectionVector(new DirectionVector(pos, rot).right(offset.x), rot).forward(offset.y),
        rot,
    ).up(offset.z);
    return newPos;
}
