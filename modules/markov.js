import BaseModule from './module';
import Markov from 'markov-strings';

class MarkovModule extends BaseModule {
    constructor(markovData, db) {
        super(db);
        this.buildCorpus(markovData);
    }

    buildCorpus(markovData) {
        if (markovData.length == 0) {
            markovData.push('Hello World!');
        }
        const markov = new Markov(markovData, {
            stateSize: 3
        });
        markov.buildCorpus();
        this.markov = markov;
    }

    generateString(filter) {
        try {
            const result = this.markov.generate({
                maxTries: 1000,
                filter
            });

            return result;
        } catch (err) {
            return null;
        }
    }

    removeBotTrigger(msg, content) {
        return content;
    }

    onMessageSent(originalMsg, markovMsg, markovResult) {

    }

    receiveMessage(msg) {
        // Grab all the words the user pinged the bot with that are
        // long enough.
        const words = this.removeBotTrigger(msg, msg.content.toLowerCase())
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

        // If that didn't work, or there's no user input words, try finding without words
        if (result === null) {
            result = this.generateString(normalFilter);
        }

        // If that didn't work either, tell the user, otherwise send the result
        if (result === null) {
            msg.channel.send('I don\'t know what to say');
        } else {
            msg.channel.send(result.string).then(markovMsg => this.onMessageSent(msg, markovMsg, result));
        }
    }
}

export default MarkovModule;
