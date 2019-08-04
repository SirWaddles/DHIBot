class BaseModule {
    constructor(db) {
        this.db = db;
    }

    receiveMessage(msg) {

    }

    testMessage(msg) {

    }

    filterMessage(msg) {
        return true;
    }
}

export default BaseModule;
