import fetch from 'node-fetch';
import Discord from 'discord.js';
import BaseModule from './module';

function GetCurrentStats() {
    return fetch("https://will.io/apb/instances.php", {
        method: 'GET',
    }).then(v => v.json());
}

const WorldMap = {
    '4008467211': {
        name: 'Financial',
        colour: '#af6060',
    },
    '684354270': {
        name: 'Waterfront',
        colour: '#6060af',
    },
};
const Locations = {
  '2': 'EU-West',
  '5': 'US-West',
  '6': 'US-East',
};

class APBModule extends BaseModule {
    async receiveMessage(msg) {
        const rawStats = await GetCurrentStats();
        const stats = rawStats.filter(v => v.threat == "2" && v.world_uid == "3002" && Object.keys(WorldMap).includes(v.district_instance_type_sdd));
        const finalStat = stats.reduce((acc, v) => {
            if ((v.enforcers + v.criminals) > (acc.enforcers + acc.criminals)) return v;
            return acc;
        });

        const embed = new Discord.RichEmbed();
        embed.setTitle(WorldMap[finalStat.district_instance_type_sdd].name + ' ' + Locations[finalStat.district_location_id] + ' Bronze');
        embed.setColor(WorldMap[finalStat.district_instance_type_sdd].colour);
        embed.setURL('https://will.io/apb');
        embed.addField('Population', finalStat.enforcers + finalStat.criminals, true);
        embed.addField('Enforcers', finalStat.enforcers, true);
        embed.addField('Criminals', finalStat.criminals, true);
        embed.setTimestamp(new Date(finalStat.time));

        msg.channel.send(embed);
    }

    testMessage(msg) {
        if (msg.content == "!pop") {
            return true;
        }
        return false;
    }
}

export default APBModule;
