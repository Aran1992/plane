export default class Manager {
    constructor(...args) {
        this.eventTable = {};
        this.onCreate(...args);
    }

    onCreate() {
    }

    destroy() {
        for (let event in this.eventTable) {
            if (this.eventTable.hasOwnProperty(event)) {
                App.unregisterEvent(event, this.eventTable[event]);
            }
        }
        this.onDestroy();
    }

    onDestroy() {
    }

    registerEvent(event, handler) {
        handler = handler.bind(this);
        this.eventTable[event] = handler;
        App.registerEvent(event, handler);
    }

    unregisterEvent(event) {
        App.unregisterEvent(event, this.eventTable[event]);
        delete this.eventTable[event];
    }
}
