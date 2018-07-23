import BaseModule from './module';

class DayzModule extends BaseModule {
    receiveMessage(msg) {
        msg.reply('Bad game!');
    }

	testMessage(msg) {
		return msg.content.toLowerCase().includes('dayz');
	}
}

export default DayzModule;
