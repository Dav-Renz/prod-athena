import * as alt from 'alt-server';
import { VehicleData } from '../../../shared/information/vehicles';
import { metroRapid, airportVehicles, sandkingUtility } from '../shared/information/vehicles';
import { PluginSystem } from '../../../server/systems/plugins';

const PLUGIN_NAME = 'mod-vehicles';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
});

for (const _vehData of metroRapid) {
    VehicleData.push(_vehData);
}

for (const _vehData of airportVehicles) {
    VehicleData.push(_vehData);
}

for (const _vehData of sandkingUtility) {
    VehicleData.push(_vehData);
}
