import * as alt from 'alt-server';

import './cmds';
import { ServerMarkerController } from '../../../../server/streamers/marker';
import { ServerBlipController } from '../../../../server/systems/blip';
import { InteractionController } from '../../../../server/systems/interaction';
import { Job } from '../../../../server/systems/job';
import { MARKER_TYPE } from '../../../../shared/enums/markerTypes';
import { Objective } from '../../../../shared/interfaces/job';
import { Vector3 } from '../../../../shared/interfaces/vector';
import JOB_DATA from './data';
import JobEnums from '../../../../shared/interfaces/job';
import { CurrencyTypes } from '../../../../shared/enums/currency';
import { Athena } from '../../../../server/api/athena';
import { BUSSERVICE_INTERACTIONS, BUS_LINES } from '../../shared/enums';
import { Player } from 'alt-client';
import { test_route_1 } from './test';

const START_POINT = { x: 454.5, y: -600.65, z: 27.57 }; //454.5, -600.65, 27.57
const TOTAL_DROP_OFFS = 5;
const LINE = 1;

export class BusJob {
    /**
     * Create In-World Job Location(s)
     * @static
     * @memberof Job
     */
    static init() {
        ServerBlipController.append({
            sprite: 513,
            color: 38,
            pos: START_POINT,
            scale: 1,
            shortRange: true,
            text: 'Busservice',
        });

        ServerMarkerController.append({
            pos: START_POINT,
            color: new alt.RGBA(255, 255, 255, 150),
            type: MARKER_TYPE.CYLINDER,
            scale: new alt.Vector3(1, 1, 1),
        });

        InteractionController.add({
            callback: BusJob.showMenu,
            description: 'Choose Busline',
            position: START_POINT,
            range: 2,
            isPlayerOnly: true,
        });
    }

    /**
     * Call this to start the job. Usually called through interaction point.
     * @static
     * @param {alt.Player} player
     * @memberof Job
     */
    static async begin(player: alt.Player, line: number) {
        const openSpot = await BusJob.getVehicleSpawnPoint();
        if (!openSpot) {
            Athena.player.emit.notification(player, `~r~No room for vehicles right now. Please wait...`);
            return;
        }

        const busStops = BusJob.getBusstops(line);
        const objectives: Array<Objective> = [];

        let distance = 5.432;

        const num = Math.abs(Math.cos(openSpot.rot.x));
        const forward = {
            x: -Math.sin(openSpot.rot.z) * num,
            y: Math.cos(openSpot.rot.z) * num,
            z: Math.sin(openSpot.rot.x),
        };

        let newPos = {
            x: openSpot.pos.x + forward.x * distance,
            y: openSpot.pos.y + forward.y * distance,
            z: openSpot.pos.z + forward.z * distance,
        };

        objectives.push({
            description: 'Enter the Vehicle',
            type: JobEnums.ObjectiveType.WAYPOINT,
            pos: openSpot.pos,
            range: 8,
            marker: {
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z - 1,
                },
                type: MARKER_TYPE.CYLINDER,
                color: new alt.RGBA(0, 255, 0, 100),
            },
            textLabel: {
                data: 'Get in Vehicle',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.message(player, '/quitjob - To stop this job.');
                Athena.player.emit.notification(player, `Get in the Bus`);
            },
        });

        for (let i = 0; i < busStops.length; i++) {
            const busStop = busStops[i];
            objectives.push({
                description: 'Get to the next Busstop',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: busStop,
                range: 4,
                marker: {
                    pos: busStop,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                textLabel: {
                    data: 'Busstop',
                    pos: {
                        x: busStop.x,
                        y: busStop.y,
                        z: busStop.z + 1.5,
                    },
                },
                blip: {
                    text: 'Busstop',
                    color: 2,
                    pos: busStop,
                    scale: 1,
                    shortRange: true,
                    sprite: 542,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.NO_DYING |
                    JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Drive to the next Busstop`);
                },
                callbackOnFinish: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `You have reached the Busstop`);
                },
            });
        }

        objectives.push({
            description: 'Drop Off Bus',
            type: JobEnums.ObjectiveType.WAYPOINT,
            pos: openSpot.pos,
            range: 4,
            marker: {
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z - 1,
                },
                type: MARKER_TYPE.CYLINDER,
                color: new alt.RGBA(0, 255, 0, 100),
            },
            blip: {
                text: 'Park the Bus',
                color: 2,
                pos: openSpot.pos,
                scale: 1,
                shortRange: true,
                sprite: 271,
            },
            textLabel: {
                data: 'Park the Bus',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                JobEnums.ObjectiveCriteria.JOB_VEHICLE_NEARBY |
                JobEnums.ObjectiveCriteria.NO_VEHICLE |
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.notification(player, `Drive back to the Busstation`);
            },
            callbackOnFinish: (player: alt.Player) => {
                // Payout 100 - 200; Random;
                const earned = 200;
                Athena.player.currency.add(player, CurrencyTypes.BANK, earned);
                Athena.player.emit.notification(player, `~g~$${earned}`);
            },
        });

        const job = new Job();
        job.addVehicle(
            player,
            'bus',
            openSpot.pos,
            openSpot.rot,
            new alt.RGBA(255, 255, 255, 255),
            new alt.RGBA(255, 255, 255, 255),
        );

        job.loadObjectives(objectives);
        job.addPlayer(player);
    }

    /**
     * Creates and checks if a vehicle is in a spot and returns a spot if it is open.
     * @static
     * @return {({ pos: Vector3; rot: Vector3 } | null)}
     * @memberof BusJob
     */
    static async getVehicleSpawnPoint(): Promise<{ pos: Vector3; rot: Vector3 } | null> {
        for (let i = 0; i < JOB_DATA.PARKING_POINTS.length; i++) {
            const point = JOB_DATA.PARKING_POINTS[i];
            const pointTest = new alt.ColshapeSphere(point.pos.x, point.pos.y, point.pos.z - 1, 2);

            // Have to do a small sleep to the ColShape propogates entities inside of it.
            await new Promise((resolve: Function) => {
                alt.setTimeout(() => {
                    resolve();
                }, 250);
            });

            const spaceOccupied = alt.Vehicle.all.find((veh) => veh && veh.valid && pointTest.isEntityIn(veh));

            try {
                pointTest.destroy();
            } catch (err) {}

            if (spaceOccupied) {
                continue;
            }

            return point;
        }

        return null;
    }

    /**
     * Get random point from list of points.
     * @static
     * @return {Array<Vector3>}
     * @memberof Job
     */
    static getBusstops(line: number): Array<Vector3> {
        const points = [];
        let tempStore;

        switch (line) {
            case 1: {
                tempStore = JOB_DATA.BUSSTOPS_LINE_1;
                break;
            }
            case 2: {
                tempStore = JOB_DATA.BUSSTOPS_LINE_2;
                break;
            }
            case -1: {
                tempStore = test_route_1;
                break;
            }
            default: {
                tempStore = JOB_DATA.BUSSTOPS_LINE_1;
                break;
            }
        }

        for (let i = 0; i < tempStore.length; i++) {
            points.push(tempStore[i]);
        }

        return points;
    }

    static async showMenu(player: alt.Player) {
        if (!player || !player.valid || player.data.isDead) {
            return;
        }

        alt.emitClient(player, BUSSERVICE_INTERACTIONS.SHOW_MENU);
    }

    /**
     * Call this to start the job. Usually called through interaction point.
     * @static
     * @param {alt.Player} player
     * @memberof Job
     */
    static async beginTest(player: alt.Player, line: number) {
        const openSpot = await BusJob.getVehicleSpawnPoint();
        if (!openSpot) {
            Athena.player.emit.notification(player, `~r~No room for vehicles right now. Please wait...`);
            return;
        }

        const busStops = BusJob.getBusstops(line);
        const objectives: Array<Objective> = [];

        let distance = 5.432;

        const num = Math.abs(Math.cos(openSpot.rot.x));
        const forward = {
            x: -Math.sin(openSpot.rot.z) * num,
            y: Math.cos(openSpot.rot.z) * num,
            z: Math.sin(openSpot.rot.x),
        };

        let newPos = {
            x: openSpot.pos.x + forward.x * distance,
            y: openSpot.pos.y + forward.y * distance,
            z: openSpot.pos.z + forward.z * distance,
        };

        objectives.push({
            description: 'Enter the Vehicle',
            type: JobEnums.ObjectiveType.WAYPOINT,
            pos: openSpot.pos,
            range: 8,
            marker: {
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z - 1,
                },
                type: MARKER_TYPE.CYLINDER,
                color: new alt.RGBA(0, 255, 0, 100),
            },
            textLabel: {
                data: 'Get in Vehicle',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                JobEnums.ObjectiveCriteria.IN_JOB_VEHICLE |
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.message(player, '/quitjob - To stop this job.');
                Athena.player.emit.notification(player, `Get in the Bus`);
            },
        });

        for (let i = 0; i < busStops.length; i++) {
            const busStop = busStops[i];
            objectives.push({
                description: 'Get to the next waypoint',
                type: JobEnums.ObjectiveType.WAYPOINT,
                pos: busStop,
                range: 6,
                marker: {
                    pos: busStop,
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                blip: {
                    text: 'Busstop',
                    color: 2,
                    pos: busStop,
                    scale: 1,
                    shortRange: true,
                    sprite: 542,
                },
                criteria: JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY | JobEnums.ObjectiveCriteria.NO_DYING,
            });
        }

        objectives.push({
            description: 'Drop Off Bus',
            type: JobEnums.ObjectiveType.WAYPOINT,
            pos: openSpot.pos,
            range: 4,
            marker: {
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z - 1,
                },
                type: MARKER_TYPE.CYLINDER,
                color: new alt.RGBA(0, 255, 0, 100),
            },
            blip: {
                text: 'Park the Bus',
                color: 2,
                pos: openSpot.pos,
                scale: 1,
                shortRange: true,
                sprite: 271,
            },
            textLabel: {
                data: 'Park the Bus',
                pos: {
                    x: openSpot.pos.x,
                    y: openSpot.pos.y,
                    z: openSpot.pos.z + 1.5,
                },
            },
            criteria:
                JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                JobEnums.ObjectiveCriteria.JOB_VEHICLE_NEARBY |
                JobEnums.ObjectiveCriteria.NO_VEHICLE |
                JobEnums.ObjectiveCriteria.NO_DYING,
            callbackOnStart: (player: alt.Player) => {
                Athena.player.emit.notification(player, `Drive back to the Busstation`);
            },
            callbackOnFinish: (player: alt.Player) => {
                // Payout 100 - 200; Random;
                const earned = 200;
                Athena.player.currency.add(player, CurrencyTypes.BANK, earned);
                Athena.player.emit.notification(player, `~g~$${earned}`);
            },
        });

        const job = new Job();
        job.addVehicle(
            player,
            'bus',
            openSpot.pos,
            openSpot.rot,
            new alt.RGBA(255, 255, 255, 255),
            new alt.RGBA(255, 255, 255, 255),
        );

        job.loadObjectives(objectives);
        job.addPlayer(player);
    }
}

alt.onClient(BUSSERVICE_INTERACTIONS.START_JOB, BusJob.begin);
alt.onClient(BUSSERVICE_INTERACTIONS.START_TEST, BusJob.beginTest);
