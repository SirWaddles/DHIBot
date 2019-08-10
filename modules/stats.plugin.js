import BaseModule from './module';
import Discord from 'discord.js';

const REACTION_RATINGS = ["0⃣", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];

function sumReduce(acc, v) {
    return acc + v;
}

function GetMemeScore(m, averages) {
    let weight = Math.min((0.66 * m.reactions.length) / averages.avg_rating_count, 1);
    let average = m.reactions.map(r => r.rating).reduce(sumReduce, 0) / m.reactions.length;
    return (weight * average) + ((1 - weight) * averages.average_rating);
}

class StatsModule extends BaseModule {
    receiveMessage(msg) {
        let embed = new Discord.RichEmbed()
            .setColor('#e54d42');

        const mostPinged = this.db.getMostPingedByHoops();
        if (mostPinged !== null) {
            embed = embed.addField('Most pinged by Hoops', `${mostPinged.username} (${mostPinged.count} times)`, true);
        }

        const mostReferenced = this.db.getMostReferencedByHoops();
        if (mostReferenced !== null) {
            embed = embed.addField('Most referenced by Hoops', `${mostReferenced.username} (${mostReferenced.count} times)`, true);
        }

        const mostPingedRole = this.db.getMostPingedRoleSince((new Date).getTime() - (7*24*60*60*1000));
        if (mostPingedRole !== null) {
            embed = embed.addField('Game of the week', mostPingedRole.name, true);
        }

        const memes = this.getMemes();
        const memerScores = this.getMemerScores(memes);
        if (memerScores.length > 0) {
            embed = embed.addField('Best Memer', memerScores[0].author.username + " (" + memerScores[0].score.toFixed(2) + ")", true);
            let worstMemer = memerScores[memerScores.length - 1];
            embed = embed.addField('Worst Memer', worstMemer.author.username + " (" + worstMemer.score.toFixed(2) + ")", true);
        }

        embed = embed.addField('Total messages', this.db.getTotalMessages(), true)
            .addField('Pepsi messages', this.db.getPepsiMessagesCount(), true)
            .addField('Biggest shazbot', 'Wilko', true);

        msg.channel.send(embed);
    }

    getMemeAverages(memes) {
        let ratings = memes.map(v => v.reactions.map(r => r.rating).reduce(sumReduce, 0) / v.reactions.length);
        return {
            average_rating: ratings.reduce(sumReduce, 0) / ratings.length,
            max_rating_count: memes.map(r => r.reactions.length).reduce((acc, v) => Math.max(acc, v), 0),
            avg_rating_count: memes.map(r => r.reactions.length).reduce(sumReduce, 0) / memes.length,
        };
    }

    getMemerScores(memes) {
        return this.getMemerStats(memes).map(v => ({
            author: v.author,
            // Take the average rating, but bias slightly against a small number of memes.
            score: v.average_score - (5/(v.total_memes + 0.25)),
            average: v.average_rating,
        })).sort((a, b) => {
            if (a.score < b.score) return 1;
            if (a.score > b.score) return -1;
            return 0;
        });
    }

    getMemerStats(memes) {
        const averages = this.getMemeAverages(memes);
        let memers = Object.values(memes.reduce((acc, v) => {
            if (!acc.hasOwnProperty(v.author.id)) {
                acc[v.author.id] = {
                    author: v.author,
                    memes: [],
                };
            }
            acc[v.author.id].memes.push(v);
            return acc;
        }, {}));

        memers = memers.map(mr => {
            mr.memes = mr.memes.map(m => Object.assign(m, {
                average_rating: m.reactions.map(r => r.rating).reduce(sumReduce, 0) / m.reactions.length,
                meme_score: GetMemeScore(m, averages),
            }));
            return Object.assign(mr, {
                average_rating: mr.memes.map(v => v.average_rating).reduce(sumReduce, 0) / mr.memes.length,
                average_score: mr.memes.map(v => v.meme_score).reduce(sumReduce, 0) / mr.memes.length,
                total_memes: mr.memes.length,
            });
        });

        return memers;
    }

    getMemes() {
        let reactions = this.db.getAllReactions(REACTION_RATINGS);
        const reaction_lookup = REACTION_RATINGS.reduce((acc, v, idx) => {
            acc[v] = idx;
            return acc;
        }, {});

        let memes = reactions.reduce((acc, v) => {
            if (!acc.hasOwnProperty(v.id)) {
                acc[v.id] = {
                    id: v.id,
                    author: {
                        id: v.m_id,
                        username: v.m_author,
                    },
                    reactions: [],
                };
            }
            // Just skip any double ratings. I had thought about getting the maximum rating, but people shouldn't be doing this.
            if (acc[v.id].reactions.map(a => a.author.id).includes(v.r_id)) return acc;
            acc[v.id].reactions.push({
                author: {
                    id: v.r_id,
                    username: v.r_author,
                },
                rating: reaction_lookup[v.emoji],
            });
            return acc;
        }, {});

        return Object.values(memes);
    }

    testMessage(msg) {
        return msg.content.toLowerCase().startsWith('!stats');
    }
}

export default StatsModule;

/*
Other ideas:
** highest rated maymay
** lowest rated maymay
** average meme quality
** harshest critic (lowest average vote)
** easily impressed (highest average vote)
*/
