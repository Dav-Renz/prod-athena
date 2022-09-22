import * as alt from 'alt-client';
import * as native from 'natives';

import { RETRO_BUS_EVENTS } from '../../shared/enums';

function setLockTo(bike: alt.Vehicle, lockvalue: number) {
    //native.setVehicleDoosLo
}

alt.onServer(RETRO_BUS_EVENTS.BIKE_LOCK, setLockTo);
