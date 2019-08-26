import Database from 'better-sqlite3';
import fs from 'fs';

class DB {
    constructor(dbPath, schemaPath) {
        const db = new Database(dbPath);
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);

        this.db = db;

        this.migrateDatabase();

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
        this.markovRefStmt = this.db.prepare('REPLACE INTO markov_refs VALUES (:markov_msg_id, :ref_msg_id, :markov_db)');
        this.channelStmt = this.db.prepare('REPLACE INTO channels VALUES (:id, :guild_id, :name, :type)');
        this.roleStmt = this.db.prepare('REPLACE INTO roles VALUES (:id, :name, :guild_id)');

        this.latestMarkovStmt = this.db.prepare('SELECT messages.id, messages.content, markov_refs.markov_db FROM markov_refs LEFT JOIN messages ON messages.id = markov_refs.markov_msg_id ORDER BY messages.timestamp DESC LIMIT 1');
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

        this.markovIndicesStmt = this.db.prepare('SELECT ref_msg_id FROM markov_refs WHERE markov_msg_id = ?');

        this.totalMessagesStmt = this.db.prepare(`SELECT COUNT(*) AS 'total' FROM messages`);
        this.pepsiMessagesStmt = this.db.prepare(`SELECT COUNT(*) AS 'total' FROM messages WHERE content LIKE '%pepsi%'`);
        this.mostPingedByHoopsStmt = this.db.prepare(`
            SELECT COUNT(*) AS 'count', users.username
            FROM user_mentions
            INNER JOIN messages ON messages.id = user_mentions.message_id
            INNER JOIN users ON users.id = user_mentions.user_id
            WHERE user_mentions.message_id IN (SELECT markov_msg_id FROM markov_refs)
            GROUP BY user_mentions.user_id
            ORDER BY count DESC
            LIMIT 1
        `);
        this.mostReferencedByHoopsStmt = this.db.prepare(`
            SELECT COUNT(*) AS 'count', users.username
            FROM markov_refs
            INNER JOIN messages ON messages.id = markov_refs.ref_msg_id
            INNER JOIN users ON users.id = messages.author_id
            GROUP BY users.id
            ORDER BY count DESC
            LIMIT 1
        `);
        this.mostPingedRoleStmt = this.db.prepare(`
            SELECT COUNT(*) AS 'count', roles.name
            FROM role_mentions
            INNER JOIN messages ON messages.id = role_mentions.message_id
            INNER JOIN roles ON roles.id = role_mentions.role_id
            WHERE messages.timestamp >= ?
            GROUP BY role_mentions.role_id
            ORDER BY 'count' DESC
            LIMIT 1
        `);

        this.clearAllMessagesStmt = this.db.prepare('DELETE FROM messages');
        this.clearAllReactionsStmt = this.db.prepare('DELETE FROM reactions');
        this.clearAllRoleMentionsStmt = this.db.prepare('DELETE FROM role_mentions');
        this.clearAllUserMentionsStmt = this.db.prepare('DELETE FROM user_mentions');
    }

    migrateDatabase() {
        let getVersions = this.db.prepare('SELECT version FROM versions');
        let insertVersion = this.db.prepare('INSERT INTO versions VALUES(:version)');
        let dbVersions = getVersions.all().map(x => x.version);
        let fileVersions = fs.readdirSync('./db_versions').filter(v => v.endsWith('.sql')).map(v => v.slice(0, -4));

        let runVersions = fileVersions.filter(v => !dbVersions.includes(v));
        for (let version of runVersions) {
            let migration = fs.readFileSync('./db_versions/' + version + '.sql', 'utf8');
            this.db.exec(migration);
            insertVersion.run({
                version: version,
            });
        }
    }

    getTotalMessages() {
        return this.totalMessagesStmt.get().total;
    }

    getPepsiMessagesCount() {
        return this.pepsiMessagesStmt.get().total;
    }

    getMostPingedByHoops() {
        const result = this.mostPingedByHoopsStmt.get();
        if (result) {
            return result;
        } else {
            return null;
        }
    }

    getMostReferencedByHoops() {
        const result = this.mostReferencedByHoopsStmt.get();
        if (result) {
            return result;
        } else {
            return null;
        }
    }

    getMostPingedRoleSince(time) {
        const result = this.mostPingedRoleStmt.get(time);
        if (result) {
            return result;
        } else {
            return null;
        }
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

    getMarkovIndices(markovMsgID) {
        // Use and abuse the ref_msg_id column 'cause idk makes sense I guess
        return this.markovIndicesStmt.all(markovMsgID);
    }

    insertMarkovReference(markovMsg, referencedMsgID, markovDb) {
        if (typeof markovDb === 'undefined') markovDb = "dhimarkov";
        this.markovRefStmt.run({
            markov_msg_id: markovMsg.id,
            ref_msg_id: referencedMsgID,
            markov_db: markovDb,
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

    getAllReactions(reactions, channelId, user) {
        let query = `
            SELECT m.id, u.id AS m_id, u.username AS m_author, m.timestamp AS m_stamp, ra.id AS r_id, ra.username AS r_author, r.emoji
            FROM reactions r
            INNER JOIN messages m ON m.id = r.message_id
            INNER JOIN users u ON m.author_id = u.id
            INNER JOIN users ra ON r.user_id = ra.id
            WHERE r.emoji IN (` + Array(reactions.length).fill("?").join(", ") + ")";

        let params = reactions.slice();

        if (typeof user !== 'undefined') {
            query += " AND ra.id = ?";
            params.push(user.id)
        }

        if (typeof channelId !== 'undefined') {
            query += " AND m.channel_id = ?";
            params.push(channelId);
        }

        let statement = this.db.prepare(query);

        return statement.all(params);
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

    insertRole(role) {
        this.roleStmt.run({
            id: role.id,
            name: role.name,
            guild_id: role.guild.id
        });
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

            this.insertRole(role);
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
