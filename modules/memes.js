const REACTION_RATINGS = ["0⃣", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];

function sumReduce(acc, v) {
    return acc + v;
}

function GetMemeScore(m, averages) {
    let weight = Math.min((0.66 * m.reactions.length) / averages.avg_rating_count, 1);
    let average = m.reactions.map(r => r.rating).reduce(sumReduce, 0) / m.reactions.length;
    return (weight * average) + ((1 - weight) * averages.average_rating);
}

function scoreSort(a, b) {
    if (a.score < b.score) return 1;
    if (a.score > b.score) return -1;
    return 0;
}

function averageSort(a, b) {
    if (a.average < b.average) return 1;
    if (a.average > b.average) return -1;
    return 0;
}

function getDaysOld(timestamp) {
    return (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
}

function getWeightedScore(memes) {
    let totalWeights = 0;
    let totalScore = 0;
    for (let meme of memes) {
        let dayWeight = Math.max(0, 30 - getDaysOld(meme.timestamp));
        totalWeights += dayWeight;
        totalScore += meme.meme_score * dayWeight;
    }
    if (totalWeights <= 0) return 0;
    return totalScore / totalWeights;
}

class MemeData {
    constructor(db, user) {
        this.memes = this.getMemes(db, user);
        this.user = user;
    }

    getMemeAverages() {
        let ratings = this.memes.map(v => v.reactions.map(r => r.rating).reduce(sumReduce, 0) / v.reactions.length);
        let mean = ratings.reduce(sumReduce, 0) / ratings.length;
        return {
            total_ratings: ratings.length,
            average_rating: mean,
            deviation: Math.sqrt(ratings.map(r => (r - mean) * (r - mean)).reduce(sumReduce, 0) / ratings.length),
            max_rating_count: this.memes.map(r => r.reactions.length).reduce((acc, v) => Math.max(acc, v), 0),
            avg_rating_count: this.memes.map(r => r.reactions.length).reduce(sumReduce, 0) / this.memes.length,
        };
    }

    getMemerScores() {
        return this.getMemerStats(this.memes).map(v => ({
            author: v.author,
            // Take the average rating, but bias slightly against a small number of memes.
            score: v.weighted_score - (5/(v.total_memes + 0.25)),
            average: v.average_rating,
        })).sort(this.user ? averageSort : scoreSort);
    }

    getMemerStats() {
        const averages = this.getMemeAverages();
        let memers = Object.values(this.memes.reduce((acc, v) => {
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
                weighted_score: getWeightedScore(mr.memes, averages),
                total_memes: mr.memes.length,
            });
        });

        return memers;
    }

    getMemes(db, user) {
        let reactions = db.getAllReactions(REACTION_RATINGS, '447038181431574528', user);
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
                    timestamp: v.m_stamp,
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
}

export default MemeData;
