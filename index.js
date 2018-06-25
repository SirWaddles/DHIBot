const Discord = require('discord.js');
const client = new Discord.Client();
const { DiscordToken } = require('./tokens');

var overwatchRollCall = {

	requiredPlayers : 2,
	joinCommand : "!hanzo",
	roleName : "Overwatch",
	timerDuration : 30 * 60, // 30 minutes yo
	
	players : 0,
	rollcallExpireTime : 0,

	processMsg : function(msg){

		if(msg.mentions.roles.name == roleName)
		{
			players = 1;
			rollcallExpireTime = msg.createdAt().getTime() / 1000 + timerDuration;

			client.defaultChannel.send("Someone wants to play Overwatch. "+
				players+"/"+required+"type "+joinCommand+" to join");
		}
		else if(msg.content.tolower() == joinCommand)
		{
			if(msg.createdAt().getTime() / 1000 < rollcallExpireTime)
			{
				players++;
				
				if(players == requiredPlayers)
				{
					client.defaultChannel.send("Hey @Waddlesworth, "+requiredPlayers+" people want to play Overwatch!");
					reset();
				}

				msg.delete();
			}
					
			msg.reply("There is no active roll call for Overwatch");		
		}
	},

	reset : function()
	{
		players = 0;
		rollcallExpireTime = 0;
	}
}

overwatchRollCall = new overwatchRollCall();

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
