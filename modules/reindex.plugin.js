import BaseModule from './module';

const USER_WHITELIST = [
    '119256964386652160', // McSimp
    '229419335930609664', // Waddlesworth
];

class ReindexModule extends BaseModule {
    async indexAllChannelMessages(channel) {
        console.log(`Indexing messages from ${channel.id}`);
        let beforeID = channel.lastMessageID;
        while (true) {
            console.log(`Fetching messages before ${beforeID}`);
            const messages = await channel.fetchMessages({
                limit: 100,
                before: beforeID
            });
            console.log(`Got ${messages.size} messages`);

            if (messages.size === 0) {
                break;
            }

            let earliestTS = null;
            for (const msg of messages.values()) {
                if (earliestTS === null || msg.createdTimestamp < earliestTS) {
                    earliestTS = msg.createdTimestamp;
                    beforeID = msg.id;
                }
                await this.db.insertMessage(msg);
            }
        }

        channel.client.sweepMessages();
        console.log(`Finished indexing messages from ${channel.id}`);
    }

    async indexAllMessages(channels) {
        this.db.clearIndex();
        for (const channel of channels.values()) {
            try {
                await this.indexAllChannelMessages(channel);
            } catch (error) {
                if (error.code !== 50001) { // Ignore "Missing Access"
                    throw error;
                }
            }
        }
    }

    receiveMessage(msg) {
        const channels = msg.client.channels.filter(x => x.type == 'text');
        msg.reply(`Indexing ${channels.size} channels`);
        this.indexAllMessages(channels)
          .then(() => msg.reply(`Finished indexing`))
          .catch(err => msg.reply(`Error occurred during indexing: ${err}`));
    }

    testMessage(msg) {
        return msg.content == '!reindex' && USER_WHITELIST.includes(msg.author.id);
    }
}

export default ReindexModule;
