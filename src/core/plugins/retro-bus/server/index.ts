import * as alt from 'alt-server';
import { Athena } from '../../../server/api/athena';
import { PluginSystem } from '../../../server/systems/plugins';
import { ATHENA_EVENTS_VEHICLE } from '../../../shared/enums/athenaEvents';
import { RETRO_BUS_METAS } from '../shared/enums';
import { MetroRapid } from './src/bus';

const PLUGIN_NAME = 'retro-bus';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    Athena.events.vehicle.on(ATHENA_EVENTS_VEHICLE.SPAWNED, (someVehicle) => {
        if (someVehicle.model === alt.hash('bus2')) {
            if (!someVehicle.hasMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES)) {
                let tempMeta: Array<alt.Vehicle> = [null, null];

                someVehicle.setMeta(RETRO_BUS_METAS.ATTACHED_VEHICLES, tempMeta);

                try {
                    someVehicle.setExtra(0, true);
                    someVehicle.setExtra(1, false);
                    someVehicle.setExtra(2, false);
                    someVehicle.setExtra(3, false);
                } catch (e) {
                    alt.log(e);
                }
            }
        }
    });
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    MetroRapid.init();
});
