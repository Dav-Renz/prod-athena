import { ServerMarkerController } from '../../../../server/streamers/marker';
import { ServerBlipController } from '../../../../server/systems/blip';
export class BlipList {
    /**
     * Create In-World Job Location(s)
     * @static
     * @memberof Job
     */
    static init() {
        ServerBlipController.append({
            sprite: 90,
            color: 2,
            pos: { x: 13000, y: -1400, z: 1501 },
            scale: 1,
            shortRange: false,
            text: 'Flight-deck',
        });
    }
}
