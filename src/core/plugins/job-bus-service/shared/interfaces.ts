
/**
 * Interface for working with / using busstops.
 * @export
 * @interface BusstopInfo
 */
export interface BusstopInfo {

    /**
     * The name of the busstop.
     * @type {string}
     * @memberof BusstopInfo
     */
    name: string;

    /**
     * The displayname of the busstop.
     * @type {string}
     * @memberof BusstopInfo
     */
    displayname: string;

    /**
     * Does this busstop have a sign?
     * @type {boolean}
     * @memberof BusstopInfo
     */
    sign: boolean;

    /**
     * Does this busstop have a busstop-shelter?
     * @type {boolean}
     * @memberof BusstopInfo
     */
    shelter: boolean;

    /**
     * X-Coordinate of Busstop
     * @type {number}
     * @memberof BusstopInfo
     */
    x: number;

    /**
    * Y-Coordinate of Busstop
    * @type {number}
    * @memberof BusstopInfo
    */
    y: number;

    /**
   * Z-Coordinate of Busstop
   * @type {number}
   * @memberof BusstopInfo
   */
    z: number;
}

export interface BusserviceLine {

    /**
     * The name of the busstop.
     * @type {string}
     * @memberof BusserviceLine
     */
    name: string;

    /**
     * The displayname of the busstop.
     * @type {string}
     * @memberof BusserviceLine
     */
    displayname: string;

    /**
     * The displayname of the busstop.
     * @type {string}
     * @memberof BusserviceLine
     */
    description: string;

    /**
   * List with all busstop names on the line.
   * @type {Array<String>}
   * @memberof BusserviceLine
   */
    stops: Array<String>;
}