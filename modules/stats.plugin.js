import BaseModule from './module';
import Discord from 'discord.js';

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

        const aWeekAgo = (new Date).getTime() - (7*24*60*60*1000);
        const mostPingedRole = this.db.getMostPingedRoleSince(aWeekAgo);
        if (mostPingedRole !== null) {
            embed = embed.addField('Game of the week', mostPingedRole.name, true);
        }

        const ratings = this.db.getAllRatingsForChannelSince('447038181431574528', aWeekAgo); // maymays channel
        if (ratings.length > 0) {
            const averageRating = ratings.reduce((p, c) => p + c.rating, 0) / ratings.length;
            embed = embed.addField('Average meme rating this week', averageRating.toFixed(2));

            const lowestRating = ratings.reduce((p, c) => {
                if (p === null || c.rating < p.rating) {
                    return c;
                } else {
                    return p;
                }
            }, null);
            embed = embed.addField('Worst meme this week', `[From ${}]()${lowestRating.toFixed(2)}`);
        }

        embed = embed.addField('Total messages', this.db.getTotalMessages(), true)
            .addField('Pepsi messages', this.db.getPepsiMessagesCount(), true)
            .addField('Biggest shazbot', 'Wilko', true);

        msg.channel.send(embed);
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

