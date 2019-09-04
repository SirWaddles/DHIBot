import BaseModule from './module';
import MemeData from './memes';

class LeaderboardModule extends BaseModule {
    receiveMessage(msg) {
        if (Math.random() > 0.6) {
            msg.channel.send("You all suck at memeing. Try again next time.")
            return;
        }
        let memeData = new MemeData(this.db);
        let globalScores = memeData.getMemerScores();
        msg.channel.send(
            "```\n" +
            "Name          Score   Average\n" +
            globalScores.map(v => v.author.username.padEnd(14, " ") + v.score.toFixed(2).padEnd(8, ' ') + v.average.toFixed(2)).join("\n") +
            "\n```"
        );
    }

    testMessage(msg) {
        return msg.content.toLowerCase().startsWith('!leaderboard');
    }
}

export default LeaderboardModule;
