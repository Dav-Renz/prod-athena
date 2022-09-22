import * as alt from 'alt-client';
import { BUS_LINES, BUSSERVICE_INTERACTIONS } from '../../shared/enums';

// nativeui-min
import * as NativeUI from '../../../native-ui/client/nativeui/nativeui.min.js';
// nativeui
import * as NativeUi from '../../../native-ui/client/nativeui/nativeui.js';
import { Athena } from '../../../../server/api/athena';

function showNativeUI() {
    const ui = new NativeUi.Menu('NativeUI Test', 'Test Subtitle', new NativeUI.Point(1700, 50));

    let buslinie1 = new NativeUI.UIMenuItem('Buslinie 1', 'Buslinie 1');
    let buslinie2 = new NativeUI.UIMenuItem('Buslinie 2', 'Buslinie 2');
    let testlinie1 = new NativeUI.UIMenuItem('Buslinie 2', 'Buslinie 2');

    ui.AddItem(buslinie1);
    ui.AddItem(buslinie2);
    ui.AddItem(testlinie1);

    let takeJobButton = new NativeUI.InstructionalButton('Job annehmen', NativeUI.Control.FrontendRdown);
    let exitJobMenu = new NativeUI.InstructionalButton('Jobmenü verlassen', NativeUI.Control.FrontendRright);
    ui.AddInstructionalButton(takeJobButton);
    ui.AddInstructionalButton(exitJobMenu);

    if (!ui.Visible) ui.Open();

    ui.ItemSelect.on((item) => {
        if (item == buslinie1) {
            alt.emitServer(BUSSERVICE_INTERACTIONS.START_JOB, 1);
            ui.Close();
        } else if (item == buslinie2) {
            alt.emitServer(BUSSERVICE_INTERACTIONS.START_JOB, 2);
            ui.Close();
        } else if (item == testlinie1) {
            alt.emitServer(BUSSERVICE_INTERACTIONS.START_TEST, -1);
            ui.Close();
        }
    });
}

alt.onServer(BUSSERVICE_INTERACTIONS.SHOW_MENU, showNativeUI);
