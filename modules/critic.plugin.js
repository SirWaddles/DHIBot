import BaseModule from './module';
import Discord from 'discord.js';
import MemeData from './memes';
import chroma from 'chroma-js';

function mathClamp(x, min, max) {
    return Math.max(Math.min(x, max), min);
}

class CriticModule extends BaseModule {
    receiveMessage(msg) {
        let globalStats = new MemeData(this.db);
        let localStats = new MemeData(this.db, msg.author);

        let localAverages = localStats.getMemeAverages();

        if (localAverages.total_ratings <= 0) {
            msg.channel.send("You don't have enough ratings for this.");
            return;
        }

        let localScores = localStats.getMemerScores();
        let globalAverages = globalStats.getMemeAverages();

        // Embed colour for how far the local is from the average, scaled to 1.5 deviations either side.
        let colScale = chroma.scale(['#c11e1e', '#ffea00', '#377813']).mode('lab');
        let colScaleCo1 = globalAverages.average_rating - (globalAverages.deviation * 1.5);
        let colScaleCoD = globalAverages.deviation * 3;
        let colScaleCo = mathClamp((localAverages.average_rating - colScaleCo1) / colScaleCoD, 0, 1);
        let embedColour = colScale(colScaleCo).hex();

        let embed = new Discord.RichEmbed()
            .setColor(embedColour)
            .addField('Total Ratings', localAverages.total_ratings, true)
            .addField('Average Rating', localAverages.average_rating.toFixed(2), true)
            .addField('Favourite Memer', localScores[0].author.username, true)
            .addField('Least Favourite Memer', localScores[localScores.length - 1].author.username, true)
            .addField('Your Deviation', localAverages.deviation.toFixed(2), true)
            .addField('Global Average', globalAverages.average_rating.toFixed(2), true)
            .addField('Global Deviation', globalAverages.deviation.toFixed(2), true);

        msg.channel.send(embed);
    }

    testMessage(msg) {
        return msg.content.toLowerCase().startsWith('!critic');
    }
}

export default CriticModule;
