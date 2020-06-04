import BaseModule from './module';

class MyDudes extends BaseModule {
    receiveMessage(msg) {
        let now = new Date();
        let day = now.toLocaleDateString('en-AU', { weekday: 'long' });
        if (day === "Wednesday") {
            msg.reply("It is *Wednesday* my dudes.");
        } else {
            msg.reply("It's " + day + ".");
        }
    }

    testMessage(msg) {
        return msg.content.toLowerCase() === "what day is it?";
    }
}

export default MyDudes;
