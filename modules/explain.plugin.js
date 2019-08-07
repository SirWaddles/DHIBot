import BaseModule from './module';
import longestCommonSubstring from './lcs';
import Discord from 'discord.js';
import { SimpsonsData } from './simpsons.plugin';

class ExplainModule extends BaseModule {
    receiveMessage(msg) {
        // Get latest markov message ID
        const latestMsg = this.db.getLatestMarkovMessage();
        if (latestMsg === null) {
            msg.reply('I don\'t have a record of any markov messages');
            return;
        }

        if (latestMsg.markov_db === 'dhimarkov') {
            msg.channel.send(this.sendDhiExplain(latestMsg));
        }
        if (latestMsg.markov_db === 'simpsons') {
            msg.channel.send(this.sendSimpsonsExplain(latestMsg));
        }
    }

    sendDhiExplain(msg) {
        // Get information on all the references
        const refs = this.db.getMarkovReferences(msg.id);

        // Build up an embed with information on all the references
        let embed = new Discord.RichEmbed()
            .setColor('#e54d42');

        for (const ref of refs) {
            const substring = longestCommonSubstring(ref.content, msg.content);
            embed = embed.addField(substring, `[${ref.username.replace('[', '').replace(']', '')}](https://discordapp.com/channels/${ref.guildID}/${ref.channelID}/${ref.messageID})`);
        }

        return embed;
    }

    sendSimpsonsExplain(msg) {
        const indices = this.db.getMarkovIndices(msg.id);
        let embed = new Discord.RichEmbed()
            .setColor('#ffd800');

        for (const index of indices) {
            let simpsonsMessage = SimpsonsData[index.ref_msg_id].string;
            const substring = longestCommonSubstring(simpsonsMessage, msg.content);
            embed = embed.addField(substring, simpsonsMessage);
        }

        return embed;
    }

    testMessage(msg) {
        return msg.content.toLowerCase().startsWith('!explain');
    }
}

export default ExplainModule;
