import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { BusJob } from './src/job';
import { BlipList } from './src/blips';

const PLUGIN_NAME = 'Busservice';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    BusJob.init();
    BlipList.init();
});
