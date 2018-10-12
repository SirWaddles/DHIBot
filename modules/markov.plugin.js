import BaseModule from './module';
import Markov from 'markov-strings';
import fs from 'fs';

const markovData = JSON.parse(fs.readFileSync('./markov.json'));
const markov = new Markov(data, {
    maxLength: 200,
    minWords: 10,
});
markov.buildCorpus();

class MarkovModule extends BaseModule {
    receiveMessage(msg) {
        markov.generateSentence().then(sentence => {
            msg.reply(sentence);
        });
    }

    testMessage(msg) {
        return msg.content == '!markov';
    }
}

export default MarkovModule;
