import * as alt from 'alt-client';

// nativeui-min
import * as NativeUI from '../../../native-ui/client/nativeui/nativeui.min.js';
// nativeui
import * as NativeUi from '../../../native-ui/client/nativeui/nativeui.js';
import { Athena } from '../../../../server/api/athena';
import { PORT_GARAGE_INTERACTIONS } from '../../shared/events.js';

function showNativeUI(index: number, name: string, toIn: boolean) {
    const ui = new NativeUi.Menu('Garage', name, new NativeUI.Point(1450, 50));

    let enterGarge = new NativeUi.UIMenuItem('Betreten', 'Betritt die Garage');
    let exitGarage = new NativeUi.UIMenuItem('Verlassen', 'Verlass die Garage');

    if (toIn) {
        ui.AddItem(enterGarge);
    } else {
        ui.AddItem(exitGarage);
    }

    //let takeJobButton = new NativeUI.InstructionalButton('Job annehmen', NativeUI.Control.FrontendRdown);
    //let exitJobMenu = new NativeUI.InstructionalButton('Jobmenü verlassen', NativeUI.Control.FrontendRright);
    //ui.AddInstructionalButton(takeJobButton);
    //ui.AddInstructionalButton(exitJobMenu);

    if (!ui.Visible) ui.Open();

    ui.ItemSelect.on((item) => {
        if (item == enterGarge) {
            alt.emitServer(PORT_GARAGE_INTERACTIONS.ENTER_EXIT, toIn, index);
            ui.Close();
        }
        if (item == exitGarage) {
            alt.emitServer(PORT_GARAGE_INTERACTIONS.ENTER_EXIT, toIn, index);
            ui.Close();
        }
    });
}

alt.onServer(PORT_GARAGE_INTERACTIONS.OPEN, showNativeUI);
