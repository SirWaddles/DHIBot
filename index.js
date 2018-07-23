import Discord from 'discord.js';
const client = new Discord.Client();
import { DiscordToken } from './tokens';

let moduleContext = require.context('./modules/', false, /\.plugin\.js$/);
let messageModules = moduleContext.keys().map(moduleContext); // wat
const MessageModules = messageModules.map(v => new v.default());

client.on('message', msg => {
	if (msg.charAt() !== '!') return;
	if (MessageModules.map(v => v.filterMessage(msg)).filter(v => v === false).length > 0) return;
	let matchedModules = MessageModules.filter(v => v.testMessage(msg));
	matchedModules.forEach(v => v.receiveMessage(msg));
});

client.login(DiscordToken);
