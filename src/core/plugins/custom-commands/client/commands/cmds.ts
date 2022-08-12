import * as alt from 'alt-client';
import * as native from 'natives';

function getRot() {
    let rotation = native.getEntityRotation(alt.Player.local.scriptID, 2);

    alt.emitServer('nativeRot', rotation);
}

alt.onServer('nativeRot', getRot);
