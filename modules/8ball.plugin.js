import BaseModule from './module';

let eightBallResults = [
	"It is certain.",
	"It is decidedly so.",
	"Without a doubt.",
	"Yes - definitely.",
	"You may rely on it.",
	"As I see it, yes.",
	"Most likely.",
	"Outlook good.",
	"Yes.",
	"Signs point to yes.",
	"Reply hazy, try again",
	"Ask again later.",
	"Better not tell you now.",
	"Cannot predict now.",
	"Concentrate and ask again.",
	"Don't count on it.",
	"My reply is no.",
	"My sources say no",
	"Outlook not so good.",
	"Very doubtful.",
];

class EightBall extends BaseModule {
    receiveMessage(msg) {
        msg.reply( eightBallResults[ Math.floor( Math.random() * eightBallResults.length ) ] );
    }

	testMessage(msg) {
		return msg.content.startsWith('!8ball');
	}
}

export default EightBall;
