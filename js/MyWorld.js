import {World} from "./libs/planck-wrapper";
import Utils from "./utils/Utils";
import Config from "../config";

export default class MyWorld {
    constructor(...args) {
        this.world = new World(...args);

        this.eventTable = {
            "pre-solve": [],
            "begin-contact": [],
            "step": [],
            "animation-frame": [],
        };

        this.frameIndex = 0;

        this.world.on("pre-solve", this.onPreSolve.bind(this));
        this.world.on("begin-contact", this.onBeginContact.bind(this));
    }

    registerEvent(event, item) {
        this.eventTable[event].push(item);
    }

    unregisterEvent(event, item) {
        Utils.removeItemFromArray(this.eventTable[event], item);
    }

    unregisterAllEvent(item) {
        for (let event in this.eventTable) {
            if (this.eventTable.hasOwnProperty(event)) {
                Utils.removeItemFromArray(this.eventTable[event], item)
            }
        }
    }

    onPreSolve(contact) {
        let fa = contact.getFixtureA();
        let fb = contact.getFixtureB();
        let bodyA = fa.getBody();
        let bodyB = fb.getBody();
        this.eventTable["pre-solve"].forEach(item => {
            if (item.body === bodyA) {
                item.onPreSolve(contact, fb, fa);
            } else if (item.body === bodyB) {
                item.onPreSolve(contact, fa, fb);
            }
        });
    }

    onBeginContact(contact) {
        let fa = contact.getFixtureA();
        let fb = contact.getFixtureB();
        let bodyA = fa.getBody();
        let bodyB = fb.getBody();
        this.eventTable["begin-contact"].forEach(item => {
            if (item.body === bodyA) {
                item.onBeginContact(contact, fb, fa);
            } else if (item.body === bodyB) {
                item.onBeginContact(contact, fa, fb);
            }
        });
    }

    step(time) {
        this.world.step(time);
        this.eventTable["step"].forEach(item => item.onStep());
        let oldFrame = Math.floor(this.frameIndex / Config.frameInterval);
        this.frameIndex++;
        let newFrame = Math.floor(this.frameIndex / Config.frameInterval);
        if (oldFrame !== newFrame) {
            this.eventTable["animation-frame"].forEach(item => item.onAnimationFrame());
        }
    }

    createBody(...args) {
        return this.world.createBody(...args);
    }

    createDynamicBody(...args) {
        return this.world.createDynamicBody(...args);
    }

    destroyBody(body) {
        return this.world.destroyBody(body);
    }

    createJoint(...args) {
        return this.world.createJoint(...args);
    }

    destroyJoint(...args) {
        return this.world.destroyJoint(...args);
    }
}
