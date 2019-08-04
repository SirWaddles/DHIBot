import MarkovModule from './markov';
import fs from 'fs';

class SimpsonsMarkovModule extends MarkovModule {
    constructor(db) {
        console.log('Building Simpsons markov corpus...');
        const simpsonsData = JSON.parse(fs.readFileSync('./modules/simpsons.json')).map(x => x.trim());
        super(simpsonsData, db);
        console.log('Done!');
    }

    removeBotTrigger(msg, content) {
        return content.replace('!simpsons', '');
    }

    testMessage(msg) {
        return msg.content.toLowerCase().startsWith('!simpsons');
    }
}

export default SimpsonsMarkovModule;
