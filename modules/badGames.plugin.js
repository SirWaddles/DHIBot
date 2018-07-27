import BaseModule from './module';

const badGames = [
    'dayz',
    'pubg',
    'overwatch',
    'fortnite',
    /\bgmod\b/,
    'garrys mod',
    'garry\'s mod',
    'titanfall',
    'ttf2',
    'runescape',
    'world of warcraft',
    /\beve\b/,
    'payday',
    /\barma\b/,
    'fallout',
    'overcooked',
    'borderlands',
    'apb',
    'minecraft',
    'killing floor',
];

class BadGamesModule extends BaseModule {
    receiveMessage(msg) {
        msg.reply('Bad game!');
    }

    testMessage(msg) {
        const lowerMessage = msg.content.toLowerCase();
        for (const game of badGames) {
            if (game instanceof RegExp) {
                if (game.test(lowerMessage)) {
                    return true;
                }
            } else if (msg.content.toLowerCase().includes(game)) {
                return true;
            }
        }
        return false;
    }
}

export default BadGamesModule;
