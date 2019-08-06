import BaseModule from './module';
import longestCommonSubstring from './lcs';
import Discord from 'discord.js';

class ExplainModule extends BaseModule {
    receiveMessage(msg) {
        // Get latest markov message ID
        const latestMsg = this.db.getLatestMarkovMessage();
        if (latestMsg === null) {
            msg.reply('I don\'t have a record of any markov messages');
            return;
        }

        // Get information on all the references
        const refs = this.db.getMarkovReferences(latestMsg.id);

        // Build up an embed with information on all the references
        let embed = new Discord.RichEmbed()
            .setColor('#e54d42');

        for (const ref of refs) {
            const substring = longestCommonSubstring(ref.content, latestMsg.content);
            embed = embed.addField(substring, `[${ref.username.replace('[', '').replace(']', '')}](https://discordapp.com/channels/${ref.guildID}/${ref.channelID}/${ref.messageID})`);
        }

        msg.channel.send(embed);
    }

    testMessage(msg) {
        return msg.content.toLowerCase().startsWith('!explain');
    }
}

export default ExplainModule;
