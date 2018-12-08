export default class Component {
    constructor() {
        this.componentTable = {};
    }

    createComponent(componentClass, ...args) {
        let component = new componentClass(...args);
        this.componentTable[componentClass] = component;
        return component;
    }

    destroy() {
        for (let componentClass in this.componentTable) {
            if (this.componentTable.hasOwnProperty(componentClass)) {
                this.componentTable[componentClass].destroy();
            }
        }
    }
}
