import * as alt from 'alt-server';
import { Athena } from '../../../../server/api/athena';
import ChatController from '../../../../server/systems/chat';
import { MARKER_TYPE } from '../../../../shared/enums/markerTypes';
import { PERMISSIONS } from '../../../../shared/flags/permissionFlags';
import { InputMenu, InputOptionType, InputResult, SelectOption } from '../../../../shared/interfaces/inputMenus';
import { Vector3 } from '../../../../shared/interfaces/vector';
import { isFlagEnabled } from '../../../../shared/utility/flags';
import { BlipList } from '../../shared/interfaces';
import { flightpath1 } from './flightPaths';
import { radioTowers, radioMasts, radioDishes, radioAirMast, mobileMasts } from './radioTowers';

const PLUGIN_NAME = 'Custom-Blips';

ChatController.addCommand(
    'flightpath',
    '/flightpath [] - Toggles the selected flightpath',
    PERMISSIONS.ADMIN,
    toggleFlightpath,
);

ChatController.addCommand(
    'toggleBlips',
    '/toggleBlips []- Toggles the specified Blip List',
    PERMISSIONS.ADMIN,
    toggleBlipsCommand,
);
alt.log(`~lg~${PLUGIN_NAME} commands were loaded`);

async function toggleFlightpath(player: alt.Player, path: number) {
    if (!path) {
        Athena.player.emit.message(player, 'No path was given.');
        return;
    }

    let flightpath: BlipList;

    if (path === 0) {
        deactivateFlightPath(player);
    } else {
        switch (path) {
            case 1:
                flightpath = flightpath1;
                break;
            default:
                flightpath = flightpath1;
                break;
        }

        if (player.getMeta('flightpathActive') == flightpath.name) {
            deactivateFlightPath(player);
        } else if (player.getMeta('flightpathActive') && player.getMeta('flightpathActive') != flightpath.name) {
            deactivateFlightPath(player);
            activateFlightPath(player, flightpath);
        } else {
            activateFlightPath(player, flightpath);
        }
    }
}

function activateFlightPath(player: alt.Player, flightpath: BlipList) {
    for (let i = 0; i < flightpath.points.length; i++) {
        Athena.controllers.marker.addToPlayer(player, {
            pos: new alt.Vector3(
                flightpath.points[i].position.x,
                flightpath.points[i].position.y,
                flightpath.points[i].position.z,
            ),
            color: new alt.RGBA(255, 255, 0, 150),
            type: MARKER_TYPE.VERTICLE_CIRCLE,
            scale: new alt.Vector3(10, 10, 10),
            uid: `${flightpath.points[i].index}-marker`,
            maxDistance: 580,
        });
        Athena.controllers.blip.addToPlayer(player, {
            sprite: 513,
            color: 38,
            pos: new alt.Vector3(
                flightpath.points[i].position.x,
                flightpath.points[i].position.y,
                flightpath.points[i].position.z,
            ),
            scale: 1,
            shortRange: false,
            text: flightpath.points[i].index,
            uid: `${flightpath.points[i].index}-blip`,
        });
    }

    player.setMeta('flightpathActive', flightpath.name);
}

function deactivateFlightPath(player: alt.Player) {
    let meta = player.getMeta('flightpathActive');
    let flightpath: BlipList;

    /*
     * Add flightpaths here with the name of the flightpath as case
     *
     */

    switch (meta) {
        case 'flightpath1':
            flightpath = flightpath1;
            break;
        default:
            break;
    }

    for (let i = 0; i < flightpath.points.length; i++) {
        Athena.controllers.marker.removeFromPlayer(player, `${flightpath.points[i].index}-marker`);
        Athena.controllers.blip.removeFromPlayer(player, `${flightpath.points[i].index}-blip`);
    }
    player.deleteMeta('flightpathActive');
}

async function toggleBlipsCommand(player: alt.Player, blipList: string) {
    if (!blipList) {
        Athena.player.emit.message(player, 'No list was given.');
        return;
    }

    let list: BlipList;

    switch (blipList) {
        case 'RadioTower':
            list = radioTowers;
            break;
        case 'RadioMast':
            list = radioMasts;
            break;
        case 'RadioDish':
            list = radioDishes;
            break;
        case 'AirMast':
            list = radioAirMast;
            break;
        case 'MobileMast':
            list = mobileMasts;
            break;
        default:
            Athena.player.emit.message(player, 'No valid list was given.');
            return;
            break;
    }

    toggleBlips(player, list);
}

function toggleBlips(player: alt.Player, blipList: BlipList) {
    if (!player.getMeta(blipList.name)) {
        for (let i = 0; i < blipList.points.length; i++) {
            let sprite: number;
            let spriteColor: number;
            let scale: number;
            let shortRange: boolean;
            let name: string;
            let uid: string;

            if (blipList.points[i].sprite) {
                sprite = blipList.points[i].sprite;
            } else {
                sprite = blipList.sprite ? blipList.sprite : 148;
            }

            if (blipList.points[i].spriteColor) {
                spriteColor = blipList.points[i].spriteColor;
            } else {
                spriteColor = blipList.spriteColor ? blipList.spriteColor : 1;
            }

            if (blipList.points[i].scale) {
                scale = blipList.points[i].scale;
            } else {
                scale = blipList.scale ? blipList.scale : 1.0;
            }
            if (blipList.points[i].scale) {
                shortRange = blipList.points[i].shortRange;
            } else {
                shortRange = blipList.shortRange ? blipList.shortRange : false;
            }
            if (blipList.points[i].Name) {
                name = blipList.points[i].Name;
            } else {
                name = blipList.name ? blipList.name : '';
            }
            uid = `${blipList.name}-Point:${i + 1}-blip`;

            Athena.controllers.blip.addToPlayer(player, {
                sprite: sprite,
                color: spriteColor,
                pos: blipList.points[i].position,
                scale: scale,
                shortRange: shortRange,
                text: name,
                uid: uid,
            });
        }

        player.setMeta(blipList.name, true);
    } else {
        let meta = player.getMeta(blipList.name);

        for (let i = 0; i < blipList.points.length; i++) {
            Athena.controllers.blip.removeFromPlayer(player, `${blipList.name}-Point:${i + 1}-blip`);
        }
        player.deleteMeta(blipList.name);
    }
}
