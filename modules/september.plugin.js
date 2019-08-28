import BaseModule from './module';

class SeptemberModule extends BaseModule {
    receiveMessage(msg) {
        msg.channel.send(
            "https://www.youtube.com/watch?v=Gs069dndIYk"
        );

        this.can_post = false;

        const self = this;
        var nextInHours = Math.random() * 10 + 8;
        setTimeout(() => {
        	self.can_post = true;
        }, 1000 * 60 * 60 * nextInHours);
    }

    testMessage(msg) {
    	var today = new Date();
        return this.can_post && today.getMonth() == 8;
    }
}

export default SeptemberModule;
