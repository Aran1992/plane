class DataMgr_ {
    constructor() {
        if (localStorage.data) {
            this.dataTable = JSON.parse(localStorage.data);
        } else {
            this.dataTable = {};
        }
    }

    set(key, value) {
        this.dataTable[key] = value;
        localStorage.data = JSON.stringify(this.dataTable);
    }

    get(key, defaultValue) {
        let value = this.dataTable[key];
        if (value === undefined) {
            value = defaultValue;
        }
        return value;
    }
}

const DataMgr = new DataMgr_();

export default DataMgr;
