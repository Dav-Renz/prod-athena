import * as alt from 'alt-client';
import { AthenaClient } from '../../api/athena';

const DEFAULT_DRAW_DISTANCE = 20;
const TOUCH_DISTANCE = 2;

export interface SpriteInfo {
    /**
     * A unique identifier for this sprite.
     *
     * @type {string}
     * @memberof SpriteInfo
     */
    uid: string;

    /**
     * The path of the image we want to draw.
     * Use `@plugin/plugin-name/client/image.png` for plugin based pathing.
     * Otherwise paths are based on `../../../plugins/plugin-name/client/image.png`.
     *
     * @type {string}
     * @memberof SpriteInfo
     */
    path: string;

    /**
     * The width of the image. Pixels.
     *
     * @type {number}
     * @memberof SpriteInfo
     */
    width: number;

    /**
     * The height of the image. Pixels.
     *
     * @type {number}
     * @memberof SpriteInfo
     */
    height: number;

    /**
     * A position in-world, or on-screen where to draw this image.
     *
     * @type {(alt.IVector3 | alt.IVector2)}
     * @memberof SpriteInfo
     */
    position: alt.IVector3 | alt.IVector2;

    /**
     * Call this callback once, when the sprite is touched.
     *
     * @memberof Sprite
     */
    callOnceOnTouch?: (uid: string) => void;
}

type InternalSprite = SpriteInfo & { element?: alt.RmlElement; markForDeletion: boolean };

let document: alt.RmlDocument;
let elements: Array<InternalSprite> = [];

const InternalFunctions = {
    /**
     * Returns the scale of an image, based on distance from it.
     *
     * @param {number} dist
     * @param {number} width
     * @param {number} height
     * @return {{ width: number; height: number }}
     */
    getScale(dist: number, width: number, height: number): { width: number; height: number } {
        const percentage = (DEFAULT_DRAW_DISTANCE - dist) / DEFAULT_DRAW_DISTANCE;

        return {
            width: width * percentage,
            height: height * percentage,
        };
    },
    /**
     * Get the index of the image we want to modify.
     *
     * @param {string} uid
     * @return {number}
     */
    getIndexOfElement(uid: string): number {
        return elements.findIndex((x) => x && x.uid === uid);
    },
    /**
     * Create the rml element if it does not exist.
     *
     * @param {string} uid
     */
    createElement(uid: string) {
        const index = InternalFunctions.getIndexOfElement(uid);
        if (index === -1 || typeof elements[index] === 'undefined' || typeof elements[index].element !== 'undefined') {
            return;
        }

        const element = document.createElement('img');
        element.setAttribute('src', elements[index].path);
        element.addClass('image');
        element.setAttribute('width', `${elements[index].width}px`);
        element.setAttribute('height', `${elements[index].height}px`);
        element.id = uid;
        elements[index].element = element;
        document.appendChild(element);
    },
    /**
     * Remove the rml element if it exists.
     *
     * @param {string} uid
     */
    removeElement(uid: string) {
        const index = InternalFunctions.getIndexOfElement(uid);
        if (index === -1 || !elements[index] || !elements[index].element) {
            return;
        }

        document.removeChild(elements[index].element);
        elements[index].element.destroy();
        elements[index].element = undefined;
    },
    /**
     * Simply updates all rmlui elements.
     */
    update() {
        if (!document) {
            return;
        }

        for (let i = elements.length - 1; i >= 0; i--) {
            if (typeof elements[i] === 'undefined') {
                continue;
            }

            const uid = elements[i].uid;
            if (elements[i].markForDeletion) {
                InternalFunctions.removeElement(uid);
                elements.splice(i, 1);
                continue;
            }

            // Decide whether or not to draw this element...
            // This is Vector2; so don't draw it with world positioning. Just create it.
            if (!elements[i].position.hasOwnProperty('z')) {
                InternalFunctions.createElement(uid);
                continue;
            }

            // Handle 3D drawing of elements...
            const spritePosition = elements[i].position as alt.IVector3;
            const dist = AthenaClient.utility.distance3D(alt.Player.local.pos, spritePosition);

            // Removes the element from the rmlui document entirely.
            if (dist > DEFAULT_DRAW_DISTANCE) {
                InternalFunctions.removeElement(uid);
                continue;
            }

            // Creates the element if it does not exist.
            if (!elements[i].element) {
                try {
                    InternalFunctions.createElement(uid);
                } catch (err) {
                    console.log(err);
                }
            }

            let width = elements[i].width;
            let height = elements[i].height;

            // Update Scaling Here
            const scale = InternalFunctions.getScale(dist, width, height);

            // Update position based on world position.
            const screenPosition = alt.worldToScreen(spritePosition.x, spritePosition.y, spritePosition.z);
            elements[i].element.style['left'] = `${screenPosition.x - width / 2}px`;
            elements[i].element.style['top'] = `${screenPosition.y - height / 2}px`;
            elements[i].element.setAttribute('width', `${scale.width}px`);
            elements[i].element.setAttribute('height', `${scale.height}px`);
            elements[i].element.setAttribute('src', elements[i].path);

            if (typeof elements[i].callOnceOnTouch === 'undefined' || dist > TOUCH_DISTANCE) {
                continue;
            }

            elements[i].callOnceOnTouch(uid);
            delete elements[i].callOnceOnTouch;
        }
    },
};

const SpriteConst = {
    /**
     * Create a sprite. Create a JavaScript object to start building the sprite.
     * @param {SpriteInfo} sprite
     */
    create(sprite: SpriteInfo) {
        if (typeof document === 'undefined') {
            document = new alt.RmlDocument('/client/rmlui/images/index.rml');
            document.show();
            AthenaClient.timer.createInterval(InternalFunctions.update, 0, 'rmlui/images/index.ts');
        }

        if (sprite.path.includes('@plugins')) {
            sprite.path = sprite.path.replace('@plugins', '../../../plugins');
        }

        const index = InternalFunctions.getIndexOfElement(sprite.uid);
        if (index === -1) {
            elements.push({ ...sprite, markForDeletion: false });
        } else {
            elements[index] = { ...sprite, markForDeletion: false };
        }
    },
    /**
     * Remove a sprite by `uid` and stop it from updating entirely.
     *
     * @param {string} uid
     */
    remove(uid: string) {
        const index = InternalFunctions.getIndexOfElement(uid);
        if (index === -1) {
            return;
        }

        elements[index].markForDeletion = true;
    },
    /**
     * Updates the sprite data.
     * Use this to update position of the sprite dynamically.
     * Requires the `uid` specified to update it.
     *
     * @param {string} uid
     * @param {Partial<Sprite>} sprite
     */
    update(uid: string, sprite: Partial<SpriteInfo>) {
        const index = InternalFunctions.getIndexOfElement(uid);
        if (index === -1) {
            return;
        }

        if (sprite.path && sprite.path.includes('@plugins')) {
            sprite.path = sprite.path.replace('@plugins', '../../../plugins');
        }

        elements[index] = { ...elements[index], ...sprite };
    },
};

export const Sprite = {
    ...SpriteConst,
};
