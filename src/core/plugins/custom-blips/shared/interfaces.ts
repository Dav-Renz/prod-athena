import { Vector3 } from '../../../shared/interfaces/vector';

/**
 * Interface for working with / using busstops.
 * @export
 * @interface Bliplist
 */
export interface BlipList {
    /**
     * The index of the point.
     * @type {string}
     * @memberof BlipList
     */
    name: string;

    /**
     * The index of the point.
     * @type {number}
     * @memberof BlipList
     */
    scale?: number;

    /**
     * The index of the point.
     * @type {number}
     * @memberof BlipList
     */
    sprite?: number;

    /**
     * The index of the point.
     * @type {number}
     * @memberof BlipList
     */
    spriteColor?: number;

    /**
     * The index of the point.
     * @type {boolean}
     * @memberof BlipList
     */
    shortRange?: boolean;

    /**
     * The name of the busstop.
     * @type {Array<Points>}
     * @memberof BlipList
     */
    points: Array<Points>;
}

export interface Points {
    /**
     * The index of the point.
     * @type {string}
     * @memberof Points
     */
    index?: string;

    /**
     * The index of the point.
     * @type {string}
     * @memberof Points
     */
    Name?: string;

    /**
     * The index of the point.
     * @type {string}
     * @memberof Points
     */
    model?: string;

    /**
     * Position of the point.
     * @type {Vector3}
     * @memberof Points
     */
    position: Vector3;

    /**
     * Position of the point.
     * @type {Vector3}
     * @memberof Points
     */
    rotation?: Vector3;

    /**
     * The index of the point.
     * @type {number}
     * @memberof Points
     */
    sprite?: number;

    /**
     * The index of the point.
     * @type {number}
     * @memberof Points
     */
    spriteColor?: number;

    /**
     * The index of the point.
     * @type {number}
     * @memberof Points
     */
    scale?: number;

    /**
     * The index of the point.
     * @type {boolean}
     * @memberof Points
     */
    shortRange?: boolean;
}
