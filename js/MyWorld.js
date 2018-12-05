import {World} from "./libs/planck-wrapper";
import Utils from "./utils/Utils";

export default class MyWorld {
    constructor(...args) {
        this.world = new World(...args);

        this.eventTable = {
            "pre-solve": [],
            "begin-contact": [],
            "step": [],
        };

        this.world.on("pre-solve", this.onPreSolve.bind(this));
        this.world.on("begin-contact", this.onBeginContact.bind(this));
    }

    registerEvent(event, item) {
        this.eventTable[event].push(item);
    }

    unregisterEvent(event, item) {
        Utils.removeItemFromArray(this.eventTable[event], item);
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
    }

    createBody(...args) {
        return this.world.createBody(...args);
    }

    createDynamicBody(...args) {
        return this.world.createDynamicBody(...args);
    }

    destroyBody(body) {
        this.world.destroyBody(body);
    }
}
