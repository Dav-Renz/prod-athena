import * as alt from 'alt-client';
import * as native from 'natives';
import { VehicleWheelMenu } from '../../../client/menus/vehicle';
import { PushVehicle } from '../../../client/systems/push';
import { IWheelOptionExt } from '../../../shared/interfaces/wheelMenu';
import { RETRO_BUS_EVENTS } from '../shared/enums';

function addedOption(target: alt.Vehicle, options: Array<IWheelOptionExt>) {
    if (target.model !== alt.hash('bus2')) {
        return options;
    }

    const isDestroyed = native.getVehicleEngineHealth(target.scriptID) <= 0;
    const isLocked = native.getVehicleDoorLockStatus(target.scriptID) === 2;

    if (!PushVehicle.isPushing() && !isLocked && !isDestroyed) {
        // Add Bus2 specific options here...
        options.push({
            name: 'Add Bike',
            doNotClose: false,
            emitServer: RETRO_BUS_EVENTS.ADD_BIKE_MENU,
            data: [target],
        });

        options.push({
            name: 'Remove Bike',
            doNotClose: false,
            emitServer: RETRO_BUS_EVENTS.REMOVE_BIKE_MENU,
            data: [target],
        });
    }

    return options;
}

VehicleWheelMenu.addInjection(addedOption);
