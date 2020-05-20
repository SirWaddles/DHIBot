import BaseModule from './module';

class PurgeModule extends BaseModule {
    receiveMessage(msg) {
        let minutes = msg.content.match(/\b\d+\b/g);
        let startMinutes = parseInt(minutes[0]) || 10;
        let endMinutes = parseInt(minutes[1]) || 0;
        let startFilterTime = msg.createdAt.getTime() - startMinutes * 60 * 1000;
        let endFilterTime = msg.createdAt.getTime() - endMinutes * 60 * 1000;
        msg.channel.fetchMessages({
            before: msg.id,
            limit: 100
        }).then(res => {
            res.forEach(foundMsg => {
                let createdAt = foundMsg.createdAt.getTime();
                if (createdAt > startFilterTime && createdAt < endFilterTime) {
                    foundMsg.delete();
                }
            });
        });
    }

    testMessage(msg) {
        return msg.content.startsWith('!purge');
    }
}

export default PurgeModule;
