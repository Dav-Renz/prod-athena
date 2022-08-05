import * as alt from 'alt-server';

import { GarageSpaceShape } from '../../../../server/extensions/extColshape';
import { sha256 } from '../../../../server/utility/encryption';
import { PORT_GARAGE_INTERACTIONS } from '../../shared/events';
import { LOCALE_GARAGE_FUNCS } from '../../shared/locales';
import { isVehicleType } from '../../../../shared/enums/vehicleTypeFlags';
import { VehicleData } from '../../../../shared/information/vehicles';
import { IVehicle } from '../../../../shared/interfaces/iVehicle';
import { Vector3 } from '../../../../shared/interfaces/vector';
import { LOCALE_KEYS } from '../../../../shared/locale/languages/keys';
import { LocaleController } from '../../../../shared/locale/locale';
import { distance2d } from '../../../../shared/utility/vector';
import { Athena } from '../../../../server/api/athena';
import IPortGarage from '../../shared/iPortGarage';

const PARKING_SPACE_DIST_LIMIT = 5;
const GarageUsers = {};
const LastParkedCarSpawn: { [key: string]: alt.Vehicle } = {};
const VehicleCache: { [id: string]: Array<IVehicle> } = {};

let activeGarages: Array<IPortGarage> = [];
let parkingSpots: { [key: string]: Array<GarageSpaceShape> } = {};

interface PositionAndRotation {
    position: Vector3;
    rotation: Vector3;
}

export class GarageFunctions {
    static init() {
        // does nothing
    }

    /**
     * Add a garage to the garage system
     * @static
     * @param {IGarage} garage
     * @param {boolean} isInit Leave as false if adding
     * @memberof GarageFunctions
     */
    static async add(garage: IPortGarage) {
        alt.log(`~g~Registered Garage - ${garage.index}`);

        const properTypeName = garage.type.charAt(0).toUpperCase() + garage.type.slice(1);

        Athena.controllers.interaction.add({
            position: garage.positionToInside,
            description: `${LOCALE_GARAGE_FUNCS.BLIP_GARAGE} ${properTypeName}`,
            data: [garage.index, true], // Shop Index, toIn
            callback: GarageFunctions.open,
            isVehicleOnly: true,
        });

        Athena.controllers.interaction.add({
            position: garage.positionToOutside,
            description: `${LOCALE_GARAGE_FUNCS.BLIP_GARAGE} ${properTypeName}`,
            data: [garage.index, false], // Shop Index, toIn
            callback: GarageFunctions.open,
            isVehicleOnly: true,
        });

        Athena.controllers.marker.append({
            uid: `marker-garage-${garage.index}`,
            pos: new alt.Vector3(garage.positionToInside.x, garage.positionToInside.y, garage.positionToInside.z - 1),
            color: new alt.RGBA(50, 150, 0, 100),
            type: 1,
            maxDistance: 10,
            scale: { x: 2, y: 2, z: 3 },
        });

        Athena.controllers.marker.append({
            uid: `marker-garage-${garage.index}`,
            pos: new alt.Vector3(
                garage.positionToOutside.x,
                garage.positionToOutside.y,
                garage.positionToOutside.z - 1,
            ),
            color: new alt.RGBA(50, 150, 0, 100),
            type: 1,
            maxDistance: 10,
            scale: { x: 2, y: 2, z: 3 },
        });

        activeGarages.push(garage);
    }

    /**
     * 1. Obtain the current garage the player is accessing.
     *
     *
     * @static
     * @param {alt.Player} player
     * @param {(number | string)} garageIndex
     * @return {*}
     * @memberof GarageFunctions
     */
    static async open(player: alt.Player, garageIndex: number | string, toIn: boolean) {
        // 1
        const index = activeGarages.findIndex((garage) => garage.index === garageIndex);
        if (index <= -1) {
            return;
        }

        const garage = activeGarages[index];
        const garageType = activeGarages[index].type;

        // 9
        alt.emitClient(player, PORT_GARAGE_INTERACTIONS.OPEN, index, garage.name, toIn);
    }

    /**
     * Determines if a position is close enough to a spot within 5 distance.
     * @param {Vector3} position - The position of the player.
     * @param {Array} parkingSpots - Array<PositionAndRotation>
     * @returns The distance between the player and the closest parking spot.
     */
    static isCloseToSpot(position: Vector3, parkingSpots: Array<PositionAndRotation>): boolean {
        for (let i = 0; i < parkingSpots.length; i++) {
            const dist = distance2d(position, parkingSpots[i].position);
            if (dist >= 5) {
                continue;
            }

            return true;
        }

        return false;
    }

    /**
     * Finds an open spot for the garage.
     * @param {uniontype} garageIndex - number | string
     */
    static findOpenSpot(garageIndex: number | string): PositionAndRotation {
        const spots = parkingSpots[garageIndex];
        if (!spots) {
            return null;
        }

        const spot = spots.find((x) => x.getSpaceStatus());
        return spot ? spot.getPositionAndRotation() : null;
    }

    /**
     * Spawns a vehicle based on the vehicle ID.
     * @param {alt.Player} player - The player that is spawning the vehicle.
     * @param {number} id - The vehicle id.
     */
    static changePlace(player: alt.Player, toIn: boolean, index: number) {
        const garage = activeGarages[index];
        const garageType = activeGarages[index].type;
        let vehicle = player.vehicle;

        type PassengerList = Array<{ player: alt.Player; seat: number }>;

        if (player.vehicle) {
            const passengerList = vehicle.getMeta<PassengerList>('passengerList');

            if (toIn) {
                vehicle.pos = new alt.Vector3(
                    garage.positionInside.position.x,
                    garage.positionInside.position.y,
                    garage.positionInside.position.z,
                );
                vehicle.rot = new alt.Vector3(
                    garage.positionInside.rotation.x,
                    garage.positionInside.rotation.y,
                    garage.positionInside.rotation.z,
                );

                for (let i = 0; i < passengerList.length; i++) {
                    passengerList[i].player.setIntoVehicle(vehicle, passengerList[i].seat);
                }
            } else {
                {
                    vehicle.pos = new alt.Vector3(
                        garage.positionOutside.position.x,
                        garage.positionOutside.position.y,
                        garage.positionOutside.position.z,
                    );
                    vehicle.rot = new alt.Vector3(
                        garage.positionOutside.rotation.x,
                        garage.positionOutside.rotation.y,
                        garage.positionOutside.rotation.z,
                    );

                    for (let i = 0; i < passengerList.length; i++) {
                        passengerList[i].player.setIntoVehicle(vehicle, passengerList[i].seat);
                    }
                }
            }
        }
    }
}

alt.onClient(PORT_GARAGE_INTERACTIONS.ENTER_EXIT, GarageFunctions.changePlace);

alt.on('entityEnterColshape', (colshape: alt.Colshape | GarageSpaceShape, entity: alt.Entity) => {
    if (!(entity instanceof alt.Vehicle)) {
        return;
    }

    if (!(colshape instanceof GarageSpaceShape)) {
        return;
    }

    colshape.setSpaceStatus(false);
});

alt.on('entityLeaveColshape', (colshape: alt.Colshape | GarageSpaceShape, entity: alt.Entity) => {
    if (!(entity instanceof alt.Vehicle)) {
        return;
    }

    if (!(colshape instanceof GarageSpaceShape)) {
        return;
    }

    colshape.setSpaceStatus(true);
});
