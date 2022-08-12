import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { commandIinit } from './src/commandInit';

const PLUGIN_NAME = 'Custom-Commands';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    commandIinit.init();
});
