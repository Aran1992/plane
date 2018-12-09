import Config from "../../config";
import {Edge, Vec2} from "../libs/planck-wrapper";

export default class Wall {
    constructor(world) {
        let body = world.createBody();
        let width = Config.gameSceneWidth * Config.pixel2meter,
            height = Config.gameSceneHeight * Config.pixel2meter;
        let opt = {density: 0, friction: 0};
        body.createFixture(Edge(Vec2(0, 0), Vec2(width, 0)), opt).setUserData({type: "top"});
        body.createFixture(Edge(Vec2(width, 0), Vec2(width, height)), opt).setUserData({type: "right"});
        body.createFixture(Edge(Vec2(width, height), Vec2(0, height)), opt).setUserData({type: "bottom"});
        body.createFixture(Edge(Vec2(0, height), Vec2(0, 0)), opt).setUserData({type: "left"});
        body.setUserData(this);
        this.body = body;
        world.registerEvent("pre-solve", this);
    }

    onPreSolve(contact, anotherFixture, selfFixture) {
        let type = selfFixture.getUserData().type;
        let velocity = anotherFixture.getBody().getLinearVelocity();
        if (type === "left" && velocity.x > 0
            || type === "right" && velocity.x < 0
            || type === "top" && velocity.y > 0
            || type === "bottom" && velocity.y < 0) {
            contact.setEnabled(false);
        }
    }
}

window.Wall = Wall;
