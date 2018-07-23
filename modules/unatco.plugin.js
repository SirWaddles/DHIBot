import BaseModule from './module';

class Unatco extends BaseModule {
    receiveMessage(msg) {
        msg.reply('No, savage');
    }

    testMessage(msg) {
        return msg.content.toLowerCase() == 'unatco' || msg.content.toLowerCase() == 'unatco?';
    }
}

export default Unatco;
