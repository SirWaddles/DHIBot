import BaseModule from './module';

class SeptemberModule extends BaseModule {
    constructor(db) {
        super(db);
        this.can_post = false;
        this.startTimer();
    }

    startTimer() {
        setTimeout(() => {
        	this.can_post = true;
        }, 1000 * 60 * 60 * 8);
    }

    receiveMessage(msg) {
        msg.channel.send(
            "https://www.youtube.com/watch?v=Gs069dndIYk"
        );

        this.can_post = false;
        this.startTimer();
    }

    testMessage(msg) {
    	var today = new Date();
        return this.can_post && today.getMonth() == 8 && today.getDate() == 1;
    }
}

export default SeptemberModule;
