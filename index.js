import Discord from 'discord.js';
import { DiscordToken } from './tokens';
import DB from './db';

const db = new DB('data.db', 'schema.sql');

let moduleContext = require.context('./modules/', false, /\.plugin\.js$/);
let messageModules = moduleContext.keys().map(moduleContext); // wat
const MessageModules = messageModules.map(v => new v.default(db));

const client = new Discord.Client();

client.on('message', msg => {
    db.insertMessage(msg);
    if (msg.author.id == '171926582414409728') return;
    if (MessageModules.map(v => v.filterMessage(msg)).filter(v => v === false).length > 0) return;
    let matchedModules = MessageModules.filter(v => v.testMessage(msg));
    matchedModules.forEach(v => v.receiveMessage(msg));
});

client.on('messageUpdate', (oldMsg, newMsg) => {
    db.insertMessage(newMsg);
});

client.on('messageDelete', msg => {
    db.removeMessage(msg);
});

client.on('messageDeleteBulk', messages => {
    for (const msg of messages.values()) {
        db.removeMessage(msg);
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    db.insertUserReaction(reaction, user);
});

client.on('messageReactionRemove', (reaction, user) => {
    db.removeUserReaction(reaction, user);
});

client.on('messageReactionRemoveAll', msg => {
    db.removeAllMessageReactions();
});

client.on('ready', () => {
    for (const channel of client.channels.values()) {
        db.insertChannel(channel);
    }

    for (const guild of client.guilds.values()) {
        for (const role of guild.roles.values()) {
            db.insertRole(role);
        }
    }
})

client.login(DiscordToken);
