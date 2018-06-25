const Discord = require('discord.js');
const client = new Discord.Client();
const { DiscordToken } = require('./tokens');

class OverwatchRollCaller {
	constructor() {
		this.requiredPlayers = 2;
		this.joinCommand = "!hanzo";
		this.roleName = "Overwatch";
		this.timerDuration = 30 * 60; // 30 minutes yo

		this.players = 0;
		thos.rollcallExpireTime = 0;
		this.pingChannel = false;
	}

	processMsg(msg) {

		if (msg.mentions.roles.filter(v => v.name == this.roleName).length > 0) {
			this.players = 1;
			this.rollcallExpireTime = msg.createdAt().getTime() / 1000 + timerDuration;
			this.pingChannel = msg.channel;
			msg.channel.send("Someone wants to play Overwatch. " + players + "/" + required + "type " + joinCommand + " to join");
			return;
		}

		if(msg.content.tolower() == this.joinCommand) {
			if (msg.createdAt().getTime() / 1000 < this.rollcallExpireTime) {
				this.players++;

				if(players >= requiredPlayers) {
					this.pingChannel.send("Hey @Waddlesworth, " + requiredPlayers + " people want to play Overwatch!");
					this.reset();
				}

				msg.delete();
			}

			msg.reply("There is no active roll call for Overwatch");
		}
	}

	reset() {
		this.players = 0;
		this.rollcallExpireTime = 0;
	}
}

const overwatchRollCall = new OverwatchRollCaller();

client.on('message', msg => {
    if (msg.content == '!roll') {
        msg.reply('4'); // Chosen by fair dice roll - guranteed to be random.
        return;
    }
    if ( msg.content.includes('dayz') ) {
        msg.reply('bad game'); // lets annoy sylver and spiffy
        return;
    }

    overwatchRollCall.processMsg(msg);
});

client.login(DiscordToken);
