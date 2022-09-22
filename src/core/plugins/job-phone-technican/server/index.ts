import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { PhoneTechJob } from './src/job';

const PLUGIN_NAME = 'Phone Technician';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    PhoneTechJob.init();
});
