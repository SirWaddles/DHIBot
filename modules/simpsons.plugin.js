import BaseModule from './module';
import Markov from 'markov-strings';
import fs from 'fs';

const simpsonsData = JSON.parse(fs.readFileSync('./modules/simpsons.json')).map(x => x.trim());
const simpsonsMarkov = new Markov(simpsonsData, {
    stateSize: 3
});
simpsonsMarkov.buildCorpus();

class SimpsonsMarkovModule extends BaseModule {
    generateString(filter) {
        try {
            const result = simpsonsMarkov.generate({
                maxTries: 1000,
                filter
            });

            return result;
        } catch (err) {
            return null;
        }
    }

    receiveMessage(msg) {
        // Grab all the words the user pinged the bot with that are
        // long enough.
        const words = msg.content
            .toLowerCase()
            .replace(`!simpsons`, '')
            .split(' ')
            .map(x => x.trim())
            .filter(x => x.length >= 3);

        // Generate a string with these conditions:
        // * Must reference at least a certain number of other messages
        // * Must have some score
        // * Must not be too long
        // * Must not be a substring of one of the referenced messages
        // * If the user pinged the bot with some words, the string should
        //   include one of these words.
        const normalFilter = result =>
            result.refs.length >= 3 &&
            result.score > 5 &&
            result.string.length < 200 &&
            !result.refs.some(x => x.string.includes(result.string));

        const fullFilter = result => normalFilter(result) &&
            result.string.toLowerCase().split(' ').some(w => words.includes(w));

        let result = null;

        // If there's some user input words, try find a string with one of them
        if (words.length > 0) {
            result = this.generateString(fullFilter);
        }

        // If that didn't work, or these no user input words, try finding without words
        if (result === null) {
            result = this.generateString(normalFilter);
        }

        // If that didn't work either, tell the user, otherwise send the result
        if (result === null) {
            msg.channel.send('I don\'t know what to say');
        } else {
            msg.channel.send(result.string);
        }
    }

    testMessage(msg) {
        return msg.content.toLowerCase() == '!simpsons';
    }
}

export default SimpsonsMarkovModule;
