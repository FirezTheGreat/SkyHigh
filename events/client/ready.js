const Event = require('../../structures/Event');

module.exports = class ready extends Event {
	constructor(...args) {
		super(...args, {
			once: true
		});
	};

	async run() {
		let slashCommands = this.bot.commands.filter(command => command.slashCommand);
		let data = [];

		for (const [key, value] of slashCommands) {
			data.push({ name: key, description: value.description, options: value.commandOptions });
		};
		
		await this.bot.guilds.cache.first().commands.set(data);
		console.log(`${this.bot.user.username} is Online!`);
	};
};