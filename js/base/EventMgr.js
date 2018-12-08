import Component from "./Component";

export default class EventMgr extends Component {
    constructor() {
        super();

        this.eventTable = {};
    }

    registerEvent(event, handler) {
        this.eventTable[event] = handler;
        App.registerEvent(event, handler);
    }

    unregisterEvent(event) {
        App.unregisterEvent(event, this.eventTable[event]);
        this.eventTable[event] = undefined;
    }

    destroy() {
        for (let event in this.eventTable) {
            if (this.eventTable.hasOwnProperty(event)) {
                App.unregisterEvent(event, this.eventTable[event]);
            }
        }
        super.destroy();
    }
}
