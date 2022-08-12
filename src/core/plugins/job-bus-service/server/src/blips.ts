import { ServerBlipController } from "../../../../server/systems/blip";
import { Busstops } from "./busstop-list";

export class BlipList {
    /**
     * Create In-World Job Location(s)
     * @static
     * @memberof Job
     */
    static init() {

        for (let i = 0; i < Busstops.length; i++) {
            ServerBlipController.append({
                sprite: 542,
                color: 2,
                pos: Busstops[i].Position,
                scale: 0.6,
                shortRange: true,
                text: Busstops[i].Name,
            });

        }

    }
}