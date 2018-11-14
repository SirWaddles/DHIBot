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
            msg.channel.send(sentence.string);
        });
    }

    testMessage(msg) {
        markovData.push(msg.content);
        return msg.mentions.users.map(v => v.id).includes('460699949688946688');
    }
}

setInterval(() => {
    fs.writeFileSync('./modules/markov.json', JSON.stringify(markovData));
}, 1000 * 60 * 30); // 30 minutes

export default MarkovModule;
