const Discord = require('discord.js');
const client = new Discord.Client();
const { DiscordToken } = require('./tokens');

client.on('message', msg => {
    if (msg.content == '!roll') {
        msg.reply('4'); // Chosen by fair dice roll - guranteed to be random.
        return;
    }
});

client.login(DiscordToken);
