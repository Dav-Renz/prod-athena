import * as alt from 'alt-server';
import { Athena } from '../../../../server/api/athena';
import ChatController from '../../../../server/systems/chat';
import { PERMISSIONS } from '../../../../shared/flags/permissionFlags';
import { InputMenu, InputOptionType, InputResult, SelectOption } from '../../../../shared/interfaces/inputMenus';
import { Vector3 } from '../../../../shared/interfaces/vector';
import { isFlagEnabled } from '../../../../shared/utility/flags';
import { BusstopInfo } from '../../shared/interfaces';

const PLUGIN_NAME = 'Busservice';

ChatController.addCommand('createBusstopInfo', '/createBusstopInfo - Creates all needed infos for a new busstop', PERMISSIONS.ADMIN, createBusstopInfo);
alt.log(`~lg~${PLUGIN_NAME} commands were loaded`);

async function createBusstopInfo(player: alt.Player) {

    const menu: InputMenu = {
        title: 'Create Busstop',
        options: [
            {
                id: 'name',
                desc: 'Name of new busstop',
                placeholder: 'busstop',
                type: InputOptionType.TEXT,
                error: 'Must specify property name.',
            },
            {
                id: 'displayname',
                desc: 'Name of new busstop that is going to be displayed',
                placeholder: 'Busstop',
                type: InputOptionType.TEXT,
                error: 'Must specify property name.',
            },
            {
                id: 'sign',
                desc: 'Does this busstop have a sign?',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property.',
                choices: [
                    { text: 'Yes', value: 'true' },
                    { text: 'No', value: 'false' },
                ],
            },
            {
                id: 'shelter',
                desc: 'Does this busstop have a busstop-shelter?',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property.',
                choices: [
                    { text: 'Yes', value: 'true' },
                    { text: 'No', value: 'false' },
                ],
            },

        ],
        serverEvent: 'cmd:Create:Busstop',
    };

    Athena.player.emit.inputMenu(player, menu);
}

alt.onClient('cmd:Create:Busstop', async (player: alt.Player, results: InputResult[]) => {
    if (!results) {
        return;
    }

    if (!player.accountData) {
        return;
    }

    if (!isFlagEnabled(player.accountData.permissionLevel, PERMISSIONS.ADMIN)) {
        return;
    }

    //Do not change order, must be the same as in createBusstopInfo method.
    const [
        name,
        displayname,
        signString,
        shelterString,
    ] = results;

    if (!name) {
        Athena.player.emit.message(player, `Please make sure all fields are valid.`);
        return;
    }

    if (!name.value) {
        Athena.player.emit.message(player, `Please make sure all fields are valid.`);
        return;
    }

    let sign = false;
    if (!signString || !signString.value || signString.value === 'false') {
        sign = false;
    } else if (signString.value === 'true') {
        sign = true;
    }

    let shelter = false;
    if (!shelterString || !shelterString.value || shelterString.value === 'false') {
        shelter = false;
    } else if (shelterString.value === 'true') {
        shelter = true;
    }

    let busstopPos: Vector3;
    busstopPos = { x: player.pos.x, y: player.pos.y, z: player.pos.z - 1.25 };

    if (!busstopPos) {
        Athena.player.emit.message(player, `Not a valid Vector3 JSON`);
        return;
    }

    //New busstop data
    const busstopData: BusstopInfo = {
        name: name.value,
        displayname: displayname.value,
        sign: sign,
        shelter: shelter,
        x: busstopPos.x,
        y: busstopPos.y,
        z: busstopPos.z,
    };

    try {
        alt.log(`\n{\n    name: '${busstopData.name}',\n    displayname: '${busstopData.displayname}',\n    sign: ${busstopData.sign},\n    shelter: ${busstopData.shelter},\n    x: ${busstopData.x},\n    y: ${busstopData.y},\n    z: ${busstopData.z},\n},`);
    } catch (err) { }

    Athena.player.emit.message(player, `Created busstop infos in log.`);
});