import Database from 'better-sqlite3';
import fs from 'fs';

class DB {
    constructor(dbPath, schemaPath) {
        const db = new Database(dbPath);
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);

        this.db = db;
        this.msgStmt = this.db.prepare('REPLACE INTO messages VALUES (:id, :author_id, :channel_id, :timestamp, :content)');
        this.userStmt = this.db.prepare('REPLACE INTO users VALUES (:id, :bot, :username, :discriminator)');
        this.userMentionStmt = this.db.prepare('REPLACE INTO user_mentions VALUES (:user_id, :message_id)');
        this.clearUserMentionStmt = this.db.prepare('DELETE FROM user_mentions WHERE message_id = :message_id');
        this.roleMentionStmt = this.db.prepare('REPLACE INTO role_mentions VALUES (:role_id, :message_id)');
        this.clearRoleMentionStmt = this.db.prepare('DELETE FROM role_mentions WHERE message_id = :message_id');
        this.reactionStmt = this.db.prepare('REPLACE INTO reactions VALUES (:message_id, :user_id, :emoji)');
        this.clearReactionStmt = this.db.prepare('DELETE FROM reactions WHERE message_id = :message_id');
        this.removeReactionStmt = this.db.prepare('DELETE FROM reactions WHERE message_id = :message_id AND user_id = :user_id AND emoji = :emoji');
        this.removeMsgStmt = this.db.prepare('DELETE FROM messages WHERE id = :message_id');
        this.markovRefStmt = this.db.prepare('REPLACE INTO markov_refs VALUES (:markov_msg_id, :ref_msg_id)');
        this.channelStmt = this.db.prepare('REPLACE INTO channels VALUES (:id, :guild_id, :name, :type)');

        this.latestMarkovStmt = this.db.prepare('SELECT messages.id, messages.content FROM markov_refs LEFT JOIN messages ON messages.id = markov_refs.markov_msg_id ORDER BY messages.timestamp DESC LIMIT 1');
        this.latestMarkovStmt.safeIntegers();
        this.nonBotMessagesStmt = this.db.prepare('SELECT messages.id, messages.content FROM messages LEFT JOIN users ON messages.author_id = users.id WHERE users.bot = 0');
        this.nonBotMessagesStmt.safeIntegers();
        this.markovRefsStmt = this.db.prepare(`
            SELECT messages.id AS 'messageID', channels.id AS 'channelID', channels.guild_id AS 'guildID', users.username, messages.content FROM markov_refs
            INNER JOIN messages ON messages.id = markov_refs.ref_msg_id
            INNER JOIN users ON messages.author_id = users.id
            INNER JOIN channels ON messages.channel_id = channels.id
            WHERE markov_refs.markov_msg_id = ?
            ORDER BY messages.timestamp
        `);
        this.markovRefsStmt.safeIntegers();

        this.clearAllMessagesStmt = this.db.prepare('DELETE FROM messages');
        this.clearAllReactionsStmt = this.db.prepare('DELETE FROM reactions');
        this.clearAllRoleMentionsStmt = this.db.prepare('DELETE FROM role_mentions');
        this.clearAllUserMentionsStmt = this.db.prepare('DELETE FROM user_mentions');
    }

    getAllNonBotMessages() {
        return this.nonBotMessagesStmt.all().map(x => ({
            string: x.content,
            messageID: x.id
        }));
    }

    getLatestMarkovMessage() {
        const result = this.latestMarkovStmt.get();
        if (result) {
            return result;
        } else {
            return null;
        }
    }

    getMarkovReferences(markovMsgID) {
        return this.markovRefsStmt.all(markovMsgID);
    }

    insertMarkovReference(markovMsg, referencedMsgID) {
        this.markovRefStmt.run({
            markov_msg_id: markovMsg.id,
            ref_msg_id: referencedMsgID
        });
    }

    insertUserReaction(reaction, user) {
        this.reactionStmt.run({
            message_id: reaction.message.id,
            user_id: user.id,
            emoji: reaction.emoji.name
        });

        this.userStmt.run({
            id: user.id,
            bot: user.bot ? 1 : 0,
            username: user.username,
            discriminator: user.discriminator
        });
    }

    removeUserReaction(reaction, user) {
        this.removeReactionStmt.run({
            message_id: reaction.message.id,
            user_id: user.id,
            emoji: reaction.emoji.name
        });
    }

    removeAllMessageReactions(msg) {
        this.clearReactionStmt.run({
            message_id: msg.id
        });
    }

    removeMessage(msg) {
        this.removeMsgStmt.run({
            message_id: msg.id
        });

        this.removeAllMessageReactions(msg);
    }

    insertChannel(channel) {
        this.channelStmt.run({
            id: channel.id,
            guild_id: channel.guild.id,
            name: channel.name,
            type: channel.type
        });
    }

    clearIndex() {
        this.clearAllMessagesStmt.run();
        this.clearAllReactionsStmt.run();
        this.clearAllRoleMentionsStmt.run();
        this.clearAllUserMentionsStmt.run();
    }

    async insertMessage(msg) {
        this.msgStmt.run({
            id: msg.id,
            author_id: msg.author.id,
            channel_id: msg.channel.id,
            timestamp: msg.createdTimestamp,
            content: msg.content
        });

        this.userStmt.run({
            id: msg.author.id,
            bot: msg.author.bot ? 1 : 0,
            username: msg.author.username,
            discriminator: msg.author.discriminator
        });

        this.clearUserMentionStmt.run({
            message_id: msg.id
        });

        for (const user of msg.mentions.users.values()) {
            this.userMentionStmt.run({
                user_id: user.id,
                message_id: msg.id
            });

            this.userStmt.run({
                id: user.id,
                bot: user.bot ? 1 : 0,
                username: user.username,
                discriminator: user.discriminator
            });
        }

        this.clearRoleMentionStmt.run({
            message_id: msg.id
        });

        for (const role of msg.mentions.roles.values()) {
            this.roleMentionStmt.run({
                role_id: role.id,
                message_id: msg.id
            });
        }

        this.clearReactionStmt.run({
            message_id: msg.id
        });

        for (const reaction of msg.reactions.values()) {
            const users = await reaction.fetchUsers();
            for (const user of users.values()) {
                await this.insertUserReaction(reaction, user);
            }
        }

        this.insertChannel(msg.channel);
    }
}

export default DB;
