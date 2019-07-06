import BaseModule from './module';
import Markov from 'markov-strings';
import fs from 'fs';

const markovData = JSON.parse(fs.readFileSync('./modules/markov.json')).map(x => x.trim());
const markov = new Markov(markovData, {
    stateSize: 3
});
markov.buildCorpus();

class MarkovModule extends BaseModule {
    generateString(filter) {
        try {
            const result = markov.generate({
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
            .replace(`<@${msg.client.user.id}>`, '')
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
        // Only save messages that aren't from a bot
        if (!msg.author.bot) {
            markovData.push(msg.content);
        }

        return msg.mentions.users.map(v => v.id).includes(msg.client.user.id);
    }
}

setInterval(() => {
    fs.writeFileSync('./modules/markov.json', JSON.stringify(markovData));
}, 1000 * 60 * 30); // 30 minutes

export default MarkovModule;
