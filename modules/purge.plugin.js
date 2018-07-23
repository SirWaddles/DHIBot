import BaseModule from './module';

class PurgeModule extends BaseModule {
    receiveMessage(msg) {
        let minutes = parseInt(msg.content.substring(7)) || 10;
        let filterTime = msg.createdAt.getTime() - minutes * 60 * 1000;
        msg.channel.fetchMessages({
            before: msg.id,
            limit: 100
        }).then(res => {
            res.forEach(foundMsg => {
                if (foundMsg.createdAt.getTime() > filterTime) {
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
