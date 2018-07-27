import BaseModule from './module';

const badGames = [
    'dayz',
    'pubg',
    'overwatch',
    'fortnite',
    'gmod',
    'garrys mod',
    'garry\'s mod',
    'titanfall',
    'ttf2',
    'runescape',
    'world of warcraft',
    ' eve',
    'payday',
    'arma',
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
        for (const game of badGames) {
            if (msg.content.toLowerCase().includes(game)) {
                return true;    
            }
        }
        return false;
    }
}

export default BadGamesModule;
