import BaseModule from './module';

class RollModule extends BaseModule {
    receiveMessage(msg) {
        msg.reply('4'); // Chosen by fair dice roll - guranteed to be random.
    }

	testMessage(msg) {
		return msg.content == '!roll';
	}
}

export default RollModule;
