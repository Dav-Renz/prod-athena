import * as alt from 'alt-server';
import { Athena } from '../../../../server/api/athena';
import ChatController from '../../../../server/systems/chat';
import { MARKER_TYPE } from '../../../../shared/enums/markerTypes';
import { PERMISSIONS } from '../../../../shared/flags/permissionFlags';
import { DirectionVector } from '../../../../client/utility/directionToVector';

const PLUGIN_NAME = 'Custom-Commands';

ChatController.addCommand('testMarker', '/testMarker - TEsts various things', PERMISSIONS.ADMIN, testMarker);

ChatController.addCommand('rotation', '/rotation - returns rotation', PERMISSIONS.ADMIN, rotation);

ChatController.addCommand(
    'nativeRotation',
    '/nativeRotation - returns native rotation',
    PERMISSIONS.ADMIN,
    nativeRotation,
);

alt.log(`~lg~${PLUGIN_NAME} commands were loaded`);

async function testMarker(
    player: alt.Player,
    rotX: number,
    rotY: number,
    rotZ: number,
    offX: number,
    offY: number,
    offZ: number,
) {
    let rotation = {
        x: rotX,
        y: rotY,
        z: rotZ,
    };

    let newPos = new DirectionVector(
        new DirectionVector(new DirectionVector(player.pos, rotation).right(offX), rotation).forward(offY),
        rotation,
    ).up(offZ);

    Athena.controllers.marker.append({
        pos: newPos,
        color: new alt.RGBA(255, 255, 255, 150),
        type: MARKER_TYPE.CYLINDER,
        scale: new alt.Vector3(1, 1, 1),
        uid: 'test-marker',
    });

    Athena.controllers.interaction.add({
        uid: 'test-interaction',
        position: newPos,
        description: 'Objective-Interaction',
        data: [], //
        callback: (player: alt.Player) => {
            Athena.controllers.interaction.remove('Objective-Interaction');
            Athena.controllers.marker.remove('test-marker');
        },
        isPlayerOnly: true,
    });
}

async function rotation(player: alt.Player) {
    alt.log(player.rot);
}

async function nativeRotation(player: alt.Player) {
    alt.emitClient(player, 'nativeRot');
}

alt.onClient('nativeRot', (player: alt.Player, rot) => {
    Athena.player.emit.message(player, rot);
    alt.log(player.name + ' : ' + rot);
});
