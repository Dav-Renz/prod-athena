import * as alt from 'alt-server';
import './cmds';
import { Athena } from '../../../../server/api/athena';
import {} from '../../shared/enums';
import { on } from 'events';
import { IWheelOption } from '../../../../shared/interfaces/wheelMenu';
import { InputMenu, InputOptionType, InputResult, SelectOption } from '../../../../shared/interfaces/inputMenus';
import { Vector3 } from '../../../../shared/interfaces/vector';
import { RETRO_BUS_METAS, RETRO_BUS_EVENTS } from '../../shared/enums';
import { VehicleData } from '../../../../shared/information/vehicles';
import { VEHICLE_CLASS } from '../../../../shared/enums/vehicleTypeFlags';

export class MetroRapid {
    /**
     * Init
     * @static
     * @memberof Job
     */
    static init() {
        const vehs = alt.Vehicle.all;

        for (const _veh of vehs) {
            if (_veh.model === alt.hash('bus2')) {
                updateBus2Extras(_veh);
            }
        }
    }
}

function updateBus2Extras(bus: alt.Vehicle) {
    let avehs: Array<alt.Vehicle> = bus.getMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES) as Array<alt.Vehicle>;

    if (avehs[0] == null && avehs[1] == null) {
        try {
            bus.setExtra(0, true);
            bus.setExtra(1, false);
            bus.setExtra(2, false);
            bus.setExtra(3, false);
        } catch (e) {
            alt.log(e);
        }
    } else {
        try {
            bus.setExtra(0, false);
            bus.setExtra(1, true);
            bus.setExtra(2, false);
            bus.setExtra(3, false);
        } catch (e) {
            alt.log(e);
        }
    }
}

function setUpBus(player: alt.Player, bus: alt.Vehicle) {
    if (!bus.hasMeta(RETRO_BUS_METAS.EXTRA_STATE)) {
        bus.setMeta(RETRO_BUS_METAS.EXTRA_STATE, 0);
    }

    if (!bus.hasMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES)) {
        let tempMeta: Array<alt.Vehicle> = [null, null];

        bus.setMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES, tempMeta);
    }
}

function attachBike(player: alt.Player, bus: alt.Vehicle, bike: alt.Vehicle) {
    /* if (!bus.hasMeta(RETRO_BUS_METAS.EXTRA_STATE)) {
        bus.setMeta(RETRO_BUS_METAS.EXTRA_STATE, 0);
    }

    if (!bus.hasMeta(RETRO_BUS_METAS.AMOUNT_ATTACHED)) {
        bus.setMeta(RETRO_BUS_METAS.AMOUNT_ATTACHED, 0);
    }

    if (!bus.hasMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES)) {
        let tempMeta: Array<alt.Vehicle> = [null, null];

        bus.setMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES, tempMeta);
    } */
    /* 
    let extraState = bus.getMeta(RETRO_BUS_METAS.EXTRA_STATE);

    if (extraState === 0) {
        try {
            bus.setExtra(0, false);
            bus.setExtra(1, true);
            bus.setExtra(2, false);
            bus.setExtra(3, false);
            bus.setMeta(RETRO_BUS_METAS.EXTRA_STATE, 1);
        } catch (e) {
            alt.log(e);
        }
    } */

    let avehs: Array<alt.Vehicle> = bus.getMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES) as Array<alt.Vehicle>;

    if (bike) {
        if (avehs[0] == null) {
            bike.attachTo(bus, 0, 0, { x: -0.15, y: 23.93, z: 0.2 }, { x: 0, y: 0, z: -1.5708 }, true, false);
            avehs[0] = bike;
            bus.setMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES, avehs);
            updateBus2Extras(bus);
        } else if (avehs[1] == null) {
            bike.attachTo(bus, 0, 0, { x: 0, y: 25.75, z: 0.2 }, { x: 0, y: 0, z: 1.5708 }, true, false);
            avehs[1] = bike;
            bus.setMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES, avehs);
            updateBus2Extras(bus);
        } else {
            Athena.player.emit.message(player, 'No space left');
            return;
        }
    }
}

function detachBike(player: alt.Player, bus: alt.Vehicle, bike: alt.Vehicle, pos: number) {
    /* if (!bus.hasMeta(RETRO_BUS_METAS.AMOUNT_ATTACHED)) {
        bus.setMeta(RETRO_BUS_METAS.AMOUNT_ATTACHED, 0);
        bus.setMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES, [null, null]);
    } */

    if (bike) {
        bike.pos = player.pos;
        Athena.vehicle.funcs.save(bike, { position: bike.pos });
        bike.detach();

        let avehs: Array<alt.Vehicle> = bus.getMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES) as Array<alt.Vehicle>;

        avehs[pos] = null;
        bus.setMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES, avehs);
        updateBus2Extras(bus);
    }

    /* alt.log(attachedAmount);
    if (attachedAmount == 0) {
        try {
            bus.setExtra(0, true);
            bus.setExtra(1, false);
            bus.setExtra(2, false);
            bus.setExtra(3, false);
            bus.setMeta(RETRO_BUS_METAS.EXTRA_STATE, 0);
        } catch (e) {
            alt.log(e);
        }
    } */
}

function squaredDistance(a: Vector3, b: Vector3): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
}

function getClosestVehicle(originPos: Vector3): alt.Vehicle | null {
    const obj: { distance: null | number; vehicle: null | alt.Vehicle } = {
        distance: null,
        vehicle: null,
    };

    for (const vehicle of alt.Vehicle.all) {
        const distance = squaredDistance(originPos, vehicle.pos);
        if (obj.distance == null || obj.distance > distance) {
            obj.distance = distance;
            obj.vehicle = vehicle;
        }
    }

    return obj.vehicle;
}

function getCloseVehiclesOfClass(
    originPos: Vector3,
    maxDistance: number,
    vehicleClass: String,
): Array<{ distance: number; vehicle: alt.Vehicle }> | null {
    const obj: Array<{ distance: number; vehicle: alt.Vehicle }> = [];

    for (const vehicle of alt.Vehicle.all) {
        let veh: { distance: null | number; vehicle: null | alt.Vehicle } = {
            distance: null,
            vehicle: null,
        };

        const distance = squaredDistance(originPos, vehicle.pos);
        if (distance <= maxDistance) {
            veh.distance = distance;
            veh.vehicle = vehicle;

            const vehicleInfo = VehicleData.find((x) => x.name === vehicle.data.model);
            if (vehicleInfo && vehicleInfo.class === vehicleClass) {
                obj.push(veh);
            }
        }
    }

    return obj;
}

function isAlreadyAttached(bus: alt.Vehicle, bike: alt.Vehicle): boolean {
    let answer: boolean = false;
    let avehs: Array<alt.Vehicle> = bus.getMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES) as Array<alt.Vehicle>;

    for (const vehilce of avehs) {
        if (bike === vehilce) {
            answer = true;
        }
    }
    return answer;
}

function getNearestBus2(player: alt.Player): alt.Vehicle | null {
    const obj: { distance: null | number; vehicle: null | alt.Vehicle } = {
        distance: null,
        vehicle: null,
    };

    for (const vehicle of alt.Vehicle.all) {
        const distance = squaredDistance(player.pos, vehicle.pos);

        if (vehicle.modelName === 'bus2') {
            if (obj.distance == null || obj.distance > distance) {
                obj.distance = distance;
                obj.vehicle = vehicle;
            }
        }
    }

    return obj.vehicle;
}

function addBike(player: alt.Player, vehicle: alt.Vehicle) {
    //setUpBus(player, vehicle);

    let closeVehs = getCloseVehiclesOfClass(player.pos, 5, VEHICLE_CLASS.CYCLE);

    const menu: Array<IWheelOption> = [];

    for (const obj of closeVehs) {
        if (!isAlreadyAttached(vehicle, obj.vehicle)) {
            menu.push({
                name: obj.vehicle.modelName,
                icon: 'icon-directions_bike',
                color: 'grey',
                data: [vehicle, obj.vehicle],
                doNotClose: false,
                emitServer: RETRO_BUS_EVENTS.ATTACH_BIKE,
            });
        }
    }

    let workaroundTimeout = alt.setTimeout(() => {
        Athena.player.emit.wheelMenu(player, 'Add Bikes', menu);

        alt.clearTimeout(workaroundTimeout);
    }, 1000);

    //Athena.player.emit.wheelMenu(player, 'Add Bikes', menu);
}

function removeBike(player: alt.Player, vehicle: alt.Vehicle) {
    //setUpBus(player, vehicle);

    let avehs: Array<alt.Vehicle> = vehicle.getMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES) as Array<alt.Vehicle>;

    const menu: Array<IWheelOption> = [];

    if (avehs[0] == null) {
        menu.push({
            name: 'Empty spot',
            icon: 'icon-directions_bike',
            color: 'grey',
            doNotClose: true,
        });
    } else {
        menu.push({
            name: avehs[0].modelName,
            icon: 'icon-directions_bike',
            color: 'grey',
            data: [vehicle, avehs[0], 0],
            doNotClose: false,
            emitServer: RETRO_BUS_EVENTS.DETACH_BIKE,
        });
    }

    if (avehs[1] == null) {
        menu.push({
            name: 'Empty spot',
            icon: 'icon-directions_bike',
            color: 'grey',
            doNotClose: true,
        });
    } else {
        menu.push({
            name: avehs[1].modelName,
            icon: 'icon-directions_bike',
            color: 'grey',
            data: [vehicle, avehs[1], 1],
            doNotClose: false,
            emitServer: RETRO_BUS_EVENTS.DETACH_BIKE,
        });
    }

    let workaroundTimeout = alt.setTimeout(() => {
        Athena.player.emit.wheelMenu(player, 'Remove Bikes', menu);

        alt.clearTimeout(workaroundTimeout);
    }, 1000);

    //Athena.player.emit.wheelMenu(player, 'Remove Bikes', menu);
}

alt.onClient(RETRO_BUS_EVENTS.ADD_BIKE_MENU, addBike);
alt.onClient(RETRO_BUS_EVENTS.ATTACH_BIKE, attachBike);

alt.onClient(RETRO_BUS_EVENTS.REMOVE_BIKE_MENU, removeBike);
alt.onClient(RETRO_BUS_EVENTS.DETACH_BIKE, detachBike);

export const busFuncs = {
    isAlreadyAttached,
    getNearestBus2,
    getCloseVehiclesOfClass,
    squaredDistance,
    attachBike,
    detachBike,
    setUpBus,
};
