import BaseModule from './module';
import longestCommonSubstring from './lcs';

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

        // Build up a string with information on all the references
        const lines = [];
        for (const ref of refs) {
            const substring = longestCommonSubstring(ref.content, latestMsg.content);
            lines.push(`* \`${substring}\` from ${ref.username} in <#${ref.channelID}>: https://discordapp.com/channels/${ref.guildID}/${ref.channelID}/${ref.messageID}`);
        }

        msg.reply('\n' + lines.join('\n'));
    }

    testMessage(msg) {
        return msg.content.toLowerCase().startsWith('!explain');
    }
}

export default ExplainModule;
