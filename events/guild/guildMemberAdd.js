const Event = require('../../structures/Event');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

module.exports = class guildMemberAdd extends Event {
    constructor(...args) {
		super(...args);
	};

	async run(member) {
		try {
			const channel = member.guild.channels.cache.get('875932911516397598');
            if (!channel) return;

            registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Rubik.ttf'), { family: 'Rubik' });
            registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'PTSans-Regular.ttf'), { family: 'PT Sans' });

            const canvas = createCanvas(800, 250);
            const ctx = canvas.getContext('2d');
            const background = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'skyhigh.png'));

            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 5;
            ctx.strokeStyle = "black";
            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            ctx.font = '35px PT Sans';
            ctx.fillText(`WELCOME`, canvas.width / 2.7, canvas.height / 3);
            ctx.fillStyle = '#ffffff';
            ctx.font = applyText(canvas, `${member.user.tag}`);
            ctx.font = '40px PT Sans';
            ctx.fillText(`${member.user.tag.toUpperCase()}`, canvas.width / 2.7, canvas.height / 2);
            ctx.fillText(`TO ${member.guild.name.toUpperCase()}`, canvas.width / 2.7, canvas.height / 1.5);

            ctx.beginPath();
            ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#23272a";
            ctx.stroke();
            ctx.closePath();
            ctx.clip();

            const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png', size: 4096 }));
            ctx.drawImage(avatar, 25, 25, 200, 200);

            return channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'welcome.png' }] });
		} catch (error) {
			console.error(error);
		};
	};
};

function applyText(canvas, text) {
    const ctx = canvas.getContext('2d');

    let fontSize = 50;

    do {
        ctx.font = `${fontSize -= 10}px Rubik`;
    } while (ctx.measureText(text).width > canvas.width - 390);

    return ctx.font;
};