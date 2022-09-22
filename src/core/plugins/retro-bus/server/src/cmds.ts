import * as alt from 'alt-server';
import { Athena } from '../../../../server/api/athena';
import ChatController from '../../../../server/systems/chat';
import { PERMISSIONS } from '../../../../shared/flags/permissionFlags';
import { busFuncs } from '../src/bus';
import { RETRO_BUS_METAS, RETRO_BUS_EVENTS } from '../../shared/enums';

import { VEHICLE_CLASS } from '../../../../shared/enums/vehicleTypeFlags';

const PLUGIN_NAME = 'retro-bus';

ChatController.addCommand(
    'attachBike',
    '/attachBike - Attaches the nearest bike',
    PERMISSIONS.ADMIN,
    attachBikeCommand,
);
ChatController.addCommand(
    'detachBike',
    '/detachBike <in/out> - Detaches the specified slot',
    PERMISSIONS.ADMIN,
    detachBikeCommand,
);

ChatController.addCommand(
    'testAttach',
    '/testAttach <x> <y> <z> - Attach the test veh at offsets',
    PERMISSIONS.ADMIN,
    testBikeAttach,
);

ChatController.addCommand('testDetach', '/testDetach - Detaches the test veh', PERMISSIONS.ADMIN, testBikeDetach);

alt.log(`~lg~${PLUGIN_NAME} commands were loaded`);

async function attachBikeCommand(player: alt.Player) {
    let bus = busFuncs.getNearestBus2(player);

    //busFuncs.setUpBus(player, bus);

    if (!bus.model) {
        Athena.player.emit.message(player, 'Not next to correct Vehicle');
        return;
    }

    let bike: alt.Vehicle;

    let closeVehs = busFuncs.getCloseVehiclesOfClass(player.pos, 8, VEHICLE_CLASS.CYCLE);

    const veh: { distance: null | number; vehicle: null | alt.Vehicle } = {
        distance: null,
        vehicle: null,
    };

    for (const obj of closeVehs) {
        if (!busFuncs.isAlreadyAttached(bus, obj.vehicle)) {
            const distance = obj.distance;

            if (veh.distance == null || veh.distance > distance) {
                veh.distance = obj.distance;
                veh.vehicle = obj.vehicle;
            }
        }

        try {
            bike = veh.vehicle;
        } catch (e) {
            alt.log(e);
        }
    }

    busFuncs.attachBike(player, bus, bike);
}

async function detachBikeCommand(player: alt.Player, position: string) {
    let bus = busFuncs.getNearestBus2(player);

    //busFuncs.setUpBus(player, bus);

    if (!bus.model) {
        Athena.player.emit.message(player, 'Not next to correct Vehicle');
        return;
    }

    let avehs: Array<alt.Vehicle> = bus.getMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES) as Array<alt.Vehicle>; // 0 = in; 1 = out

    let bike: alt.Vehicle;
    let pos: number = null;

    if (position && position == 'in') {
        if (avehs[0] != null) {
            bike = avehs[0];
            pos = 0;
        }
    } else if (position && position == 'out') {
        if (avehs[1] != null) {
            bike = avehs[1];
            pos = 1;
        }
    }

    busFuncs.detachBike(player, bus, bike, pos);
}

async function testBikeAttach(player: alt.Player, x: number, y: number, z: number) {
    let bus = busFuncs.getNearestBus2(player);

    if (!bus.model) {
        Athena.player.emit.message(player, 'Not next to correct Vehicle');
        return;
    }

    try {
        bus.setExtra(0, false);
        bus.setExtra(1, true);
        bus.setExtra(2, false);
        bus.setExtra(3, false);
    } catch (e) {
        alt.log(e);
    }

    let bike: alt.Vehicle;

    let closeVehs = busFuncs.getCloseVehiclesOfClass(player.pos, 8, VEHICLE_CLASS.CYCLE);

    const veh: { distance: null | number; vehicle: null | alt.Vehicle } = {
        distance: null,
        vehicle: null,
    };

    for (const obj of closeVehs) {
        if (!busFuncs.isAlreadyAttached(bus, obj.vehicle)) {
            const distance = obj.distance;

            if (veh.distance == null || veh.distance > distance) {
                veh.distance = obj.distance;
                veh.vehicle = obj.vehicle;
            }
        }

        try {
            bike = veh.vehicle;
        } catch (e) {
            alt.log(e);
        }
    }

    bike.attachTo(bus, 0, 0, { x: x, y: y, z: z }, { x: 0, y: 0, z: -1.5708 }, true, false);
    bus.setMeta('testAttachment', bike);
}

async function testBikeDetach(player: alt.Player) {
    let bus = busFuncs.getNearestBus2(player);

    if (!bus.model) {
        Athena.player.emit.message(player, 'Not next to correct Vehicle');
        return;
    }

    let bike: alt.Vehicle = bus.getMeta('testAttachment') as alt.Vehicle;

    bike.detach();

    bus.deleteMeta('testAttachment');

    try {
        bus.setExtra(0, true);
        bus.setExtra(1, false);
        bus.setExtra(2, false);
        bus.setExtra(3, false);
    } catch (e) {
        alt.log(e);
    }
}
