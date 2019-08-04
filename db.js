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

        this.clearAllMessagesStmt = this.db.prepare('DELETE FROM messages');
        this.clearAllReactionsStmt = this.db.prepare('DELETE FROM reactions');
        this.clearAllRoleMentionsStmt = this.db.prepare('DELETE FROM role_mentions');
        this.clearAllUserMentionsStmt = this.db.prepare('DELETE FROM user_mentions');
    }

    getAllNonBotMessages() {
        const stmt = this.db.prepare('SELECT content FROM messages LEFT JOIN users ON messages.author_id = users.id WHERE users.bot = 0');
        return stmt.all().map(x => x.content);
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
    }
}

export default DB;
