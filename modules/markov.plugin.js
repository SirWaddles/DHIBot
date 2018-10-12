import BaseModule from './module';
import Markov from 'markov-strings';
import fs from 'fs';

const markovData = JSON.parse(fs.readFileSync('./modules/markov.json'));
const markov = new Markov(markovData, {
    maxLength: 200,
    minWords: 10,
});
markov.buildCorpus();

class MarkovModule extends BaseModule {
    receiveMessage(msg) {
        markov.generateSentence().then(sentence => {
            msg.reply(sentence.string);
        });
    }

    testMessage(msg) {
        return msg.content == '!markov';
    }
}

export default MarkovModule;
