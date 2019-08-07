import MarkovModule from './markov';
import fs from 'fs';

const SimpsonsData = JSON.parse(fs.readFileSync('./modules/simpsons.json'))
    .map(x => x.trim())
    .map((v, idx) => ({string: v, index: idx}));

class SimpsonsMarkovModule extends MarkovModule {
    constructor(db) {
        console.log('Building Simpsons markov corpus...');
        super(SimpsonsData, db);
        console.log('Done!');
    }

    removeBotTrigger(msg, content) {
        return content.replace('!simpsons', '');
    }

    testMessage(msg) {
        return msg.content.toLowerCase().startsWith('!simpsons');
    }

    onMessageSent(originalMsg, markovMsg, markovResult) {
        for (const ref of markovResult.refs) {
            this.db.insertMarkovReference(markovMsg, ref.index, "simpsons");
        }
    }
}

export { SimpsonsData };

export default SimpsonsMarkovModule;
