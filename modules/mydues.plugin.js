import BaseModule from './module';

class MyDudes extends BaseModule {
    receiveMessage(msg) {
        let now = new Date();
        let day = now.toLocaleDateString('en-AU', { weekday: 'long' });
        msg.reply("It's " + day + " my dudes.");
    }

    testMessage(msg) {
        return msg.toLowerCase() === "what day is it?";
    }
}

export default MyDudes;
