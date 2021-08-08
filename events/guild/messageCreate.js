const Event = require('../../structures/Event');

module.exports = class messageCreate extends Event {
	async run(message) {
		try {
			if (message.mentions.users.has(this.bot.user.id) && message.content === `<@!${this.bot.user.id}>`) return message.channel.send(`Prefix For This Server Is \`${this.bot.prefix}\``);

			if (!message.guild || message.author.bot || !message.content.startsWith(this.bot.prefix)) return;

            const [cmd, ...args] = message.content.slice(this.bot.prefix.length).split(/ +/g);

            const command = this.bot.commands.get(cmd.toLowerCase());
			if (command && !command.slashCommand) command.run(message, args);
		} catch (error) {
			console.error(error);
		};
	};
};