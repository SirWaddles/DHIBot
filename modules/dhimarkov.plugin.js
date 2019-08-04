import MarkovModule from './markov';
import fs from 'fs';

class DHIMarkovModule extends MarkovModule {
    constructor(db) {
        console.log('Building DHI markov corpus...');
        const markovData = db.getAllNonBotMessages();
        super(markovData, db);
        console.log('Done!');

        const self = this;
        setInterval(() => {
            self.buildCorpus(self.db.getAllNonBotMessages());
        }, 1000 * 60 * 60 * 24); // 1 day
    }

    removeBotTrigger(msg, content) {
        return content.replace(`<@${msg.client.user.id}>`, '');
    }

    testMessage(msg) {
        return msg.mentions.users.map(v => v.id).includes(msg.client.user.id);
    }
}

export default DHIMarkovModule;
