import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { BlipList } from './src/blips';
import './src/cmds';

const PLUGIN_NAME = 'Custom-Blips';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
    BlipList.init();
});
