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

        const mostPingedRole = this.db.getMostPingedRoleSince((new Date).getTime() - (7*24*60*60*1000));
        if (mostPingedRole !== null) {
            embed = embed.addField('Game of the week', mostPingedRole.name, true);
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
