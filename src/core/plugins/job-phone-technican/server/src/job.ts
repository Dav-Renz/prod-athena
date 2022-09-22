import * as alt from 'alt-server';
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
import { ANIMATION_FLAGS } from '../../../../shared/flags/animationFlags';
import { offsettedPos } from './vectorMagic';

const START_POINT = { x: 479.13, y: -106.6, z: 62.15 }; //479.13, -106.6, 63.93
const TOTAL_REPAIRS = 8;
const VEHICLE = 'Utillitruck3';
const JOB_NAME = 'phone-tech';
let randomPoints;
let timers: Array<number> = [];

export class PhoneTechJob {
    /**
     * Create In-World Job Location(s)
     * @static
     * @memberof Job
     */
    static init() {
        ServerBlipController.append({
            sprite: 465,
            color: 5,
            pos: START_POINT,
            scale: 1,
            shortRange: true,
            text: 'Phone Technican',
        });

        ServerMarkerController.append({
            pos: START_POINT,
            color: new alt.RGBA(255, 255, 255, 150),
            type: MARKER_TYPE.CYLINDER,
            scale: new alt.Vector3(1, 1, 1),
        });

        InteractionController.add({
            callback: PhoneTechJob.begin,
            description: 'Repair Phones',
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
    static async begin(player: alt.Player) {
        const openSpot = await PhoneTechJob.getVehicleSpawnPoint();
        if (!openSpot) {
            Athena.player.emit.notification(player, `~r~No room for vehicles right now. Please wait...`);
            return;
        }

        randomPoints = PhoneTechJob.getTestPoints(); // TEST-VALUES
        //randomPoints = PhoneTechJob.getRandomPoints(TOTAL_REPAIRS, JOB_DATA.PHONES); // TEST-VALUES

        for (let i = 0; i < randomPoints.length; i++) {
            let timer = alt.setInterval(() => {
                if (randomPoints[i].repaired === false) {
                    Athena.player.emit.particle(
                        player,
                        {
                            pos: offsettedPos(
                                randomPoints[i].pos,
                                randomPoints[i].rot,
                                JOB_DATA.OFFSETS[randomPoints[i].name].effect,
                            ),
                            dict: 'core',
                            name: 'ent_amb_sparking_wires',
                            duration: 5000,
                            scale: 1,
                            delay: 0,
                        },
                        true,
                    );
                } else {
                    clearInterval(timer);
                }
            }, 5000);
            timers.push(timer);

            Athena.controllers.text.append({
                pos: offsettedPos(
                    randomPoints[i].pos,
                    randomPoints[i].rot,
                    JOB_DATA.OFFSETS[randomPoints[i].name].text,
                ),
                data: 'Broken',
                maxDistance: 3.4,
                uid: `textLabel-phone-tech-job-${i}`,
            });
        }

        const objectives: Array<Objective> = [];
        objectives.push({
            description: 'Get into the Truck',
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
            textLabel: {
                data: 'Get into the Truck',
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
                Athena.player.emit.notification(player, `Get into the Truck`);
            },
        });

        for (let i = 0; i < randomPoints.length; i++) {
            const rPoint = randomPoints[i];
            let id = `${JOB_NAME}-objective-loop-${i}`;
            // let position: Vector3 = Athena.utility.vector.getVectorInFrontOfPosition(rPoint.pos, rPoint.rot, 0.5);
            let position = rPoint.pos;
            objectives.push({
                description: 'Drive to the phone and repair it',
                type: JobEnums.ObjectiveType.INTERACION_POINT,
                pos: {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                },
                range: 2,
                id: id,
                marker: {
                    pos: offsettedPos(rPoint.pos, rPoint.rot, JOB_DATA.OFFSETS[rPoint.name].marker),
                    type: MARKER_TYPE.CYLINDER,
                    color: new alt.RGBA(0, 255, 0, 100),
                },
                blip: {
                    text: 'Repair the Phone',
                    color: 2,
                    pos: {
                        x: position.x,
                        y: position.y,
                        z: position.z + 1.5,
                    },
                    scale: 1,
                    shortRange: true,
                    sprite: 271,
                },
                criteria:
                    JobEnums.ObjectiveCriteria.FAIL_ON_JOB_VEHICLE_DESTROY |
                    JobEnums.ObjectiveCriteria.NO_DYING |
                    JobEnums.ObjectiveCriteria.NO_VEHICLE,
                callbackOnStart: (player: alt.Player) => {
                    Athena.player.emit.notification(player, `Drive to the phone and repair it`);
                    Athena.controllers.interaction.add({
                        uid: `${id}-interaction`,
                        position: {
                            x: position.x,
                            y: position.y,
                            z: position.z,
                        },
                        description: 'Objective-Interaction',
                        data: [id, position, rPoint.rot, i], // objective ID, position, rotation, loop-index
                        callback: PhoneTechJob.repairPhone,
                        isPlayerOnly: true,
                    });
                },
                callbackOnFinish: (player: alt.Player) => {
                    randomPoints[i].repaired = true;
                    Athena.controllers.text.remove(`textLabel-phone-tech-job-${i}`);
                    //Athena.controllers.interaction.remove(`${id}-interaction`);
                    Athena.player.emit.notification(player, `Phone repaired!`);
                    player.deleteSyncedMeta(id);
                },
            });
        }

        objectives.push({
            description: 'Drop Off Vehicle',
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
                text: 'Park Vehicle',
                color: 2,
                pos: openSpot.pos,
                scale: 1,
                shortRange: true,
                sprite: 271,
            },
            textLabel: {
                data: 'Park Vehicle',
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
                Athena.player.emit.notification(player, `Drive the Bike Back`);
            },
            callbackOnFinish: (player: alt.Player) => {
                // Payout 100 - 200; Random;
                const earned = Math.floor(Math.random() * 100) + 100;
                Athena.player.currency.add(player, CurrencyTypes.CASH, earned);
                Athena.player.emit.notification(player, `~g~$${earned}`);
            },
        });

        const job = new Job();
        job.addVehicle(
            player,
            VEHICLE,
            openSpot.pos,
            openSpot.rot,
            new alt.RGBA(255, 255, 255, 255),
            new alt.RGBA(255, 255, 255, 255),
        );

        job.loadObjectives(objectives);
        job.addPlayer(player);
        job.addTimers(timers);
    }

    /**
     * Creates and checks if a vehicle is in a spot and returns a spot if it is open.
     * @static
     * @return {({ pos: Vector3; rot: Vector3 } | null)}
     * @memberof PizzaJob
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
    static getRandomPoints(
        amount: number,
        list,
    ): Array<{ name: string; repaired: boolean; pos: Vector3; rot: Vector3 }> {
        const points = [];

        while (points.length < amount) {
            points.push(list[Math.floor(Math.random() * list.length)]);
        }

        return points;
    }

    static getTestPoints(): Array<{ name: string; repaired: boolean; pos: Vector3; rot: Vector3 }> {
        const points = JOB_DATA.TEST;
        return points;
    }

    static async repairPhone(player: alt.Player, objectiveID: string, position: Vector3, rotation: Vector3) {
        //Do repair

        //Athena.player.safe.setPosition(player, position.x, position.y, position.z);
        //player.rot = new alt.Vector3(rotation.x, rotation.y, rotation.z);
        Athena.controllers.interaction.remove(`${objectiveID}-interaction`);
        Athena.player.emit.animation(
            player,
            'mp_car_bomb',
            'car_bomb_mechanic',
            ANIMATION_FLAGS.NORMAL | ANIMATION_FLAGS.STOP_LAST_FRAME,
            4500,
        );
        let waiter = alt.setTimeout(() => {
            player.setSyncedMeta(objectiveID, true);
            alt.clearTimeout(waiter);
        }, 5000);
    }
}
