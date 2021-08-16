const Event = require('../../structures/Event');
const { MessageEmbed } = require('discord.js');
const RemindList = require("../../structures/models/RemindList");

module.exports = class Ready extends Event {
	constructor(...args) {
		super(...args, {
			once: true
		});
	};

	async run() {
		try {
			let slashCommands = this.bot.commands.filter(command => command.slashCommand);
			let data = [];

			for (const [key, value] of slashCommands) {
				data.push({ name: key, description: value.description, options: value.commandOptions });
			};

			await this.bot.guilds.cache.first().commands.set(data)
			console.log(`${this.bot.user.username} is Online!`);

			const guild = await this.bot.guilds.fetch('690106176502759430');
			const members = await guild.members.fetch();
			const totalReminders = await RemindList.find({});

			for (let i = 0; i < totalReminders.length; i++) {
				let reminderInterval = setInterval(async () => {
					let newReminder = await RemindList.findOne({ ID: totalReminders[i].ID });

					if (!newReminder || newReminder.timeInMS - Date.now() > 0) return;
					let { user } = members.filter(member => !member.bot).get(newReminder.UserID);
					
					await dailyReminder(newReminder, user, this.bot);

					if (newReminder.daily) {
						let parsedTimeForTomorrow = new Date(newReminder.timeInMS);
						parsedTimeForTomorrow.setDate(parsedTimeForTomorrow.getDate() + 1);

						return await RemindList.findOneAndUpdate(
							{ ID: newReminder.ID },
							{
								time: parsedTimeForTomorrow.toString(),
								timeInMS: parsedTimeForTomorrow.getTime(),
							}
						);
					} else if (!newReminder.daily) {
						clearInterval(reminderInterval);
						return await RemindList.deleteOne({ ID: newReminder.ID });
					};
				}, 10000);
			};
		} catch (error) {
			console.error(error);
		};
	};
};

async function dailyReminder(reminder, interaction, bot) {
	const reminderEmbed = new MessageEmbed()
		.setAuthor(interaction.username, interaction.displayAvatarURL({ dynamic: true }))
		.setColor('GREEN')
		.addField(`**Reminder Of ${reminder.time.slice(0, -30).trim()}**`, reminder.reason)
		.setTimestamp();
	reminder.daily ? reminderEmbed.setFooter('Your Daily Reminder By SkyHigh Bot', bot.user.displayAvatarURL({ dynamic: true })) : null;
	return interaction.send({ embeds: [reminderEmbed] }).catch(async () => await RemindList.deleteOne({ ID: generatedID }));
};