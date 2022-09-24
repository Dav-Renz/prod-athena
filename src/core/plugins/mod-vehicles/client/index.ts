import { VehicleData } from '../../../shared/information/vehicles';
import { metroRapid, airportVehicles, sandkingUtility, xcelsior } from '../shared/information/vehicles';

for (const _vehData of metroRapid) {
    VehicleData.push(_vehData);
}

for (const _vehData of airportVehicles) {
    VehicleData.push(_vehData);
}

for (const _vehData of sandkingUtility) {
    VehicleData.push(_vehData);
}

for (const _vehData of xcelsior) {
    VehicleData.push(_vehData);
}
