import MarkovModule from './markov';
import fs from 'fs';

class DHIMarkovModule extends MarkovModule {
    constructor() {
        console.log('Building DHI markov corpus...');
        const markovData = JSON.parse(fs.readFileSync('./modules/markov.json')).map(x => x.trim());
        super(markovData);
        this.markovData = markovData;
        console.log('Done!');

        setInterval(() => {
            fs.writeFileSync('./modules/markov.json', JSON.stringify(markovData));
        }, 1000 * 60 * 30); // 30 minutes
    }

    removeBotTrigger(msg, content) {
        return content.replace(`<@${msg.client.user.id}>`, '');
    }

    testMessage(msg) {
        // Only save messages that aren't from a bot
        if (!msg.author.bot) {
            this.markovData.push(msg.content);
        }

        return msg.mentions.users.map(v => v.id).includes(msg.client.user.id);
    }
}

export default DHIMarkovModule;
