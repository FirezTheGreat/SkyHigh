const Command = require('../../structures/Command');

module.exports = class Ban extends Command {
    constructor(...args) {
        super(...args, {
            name: 'purge',
            description: 'Purge Messages',
            category: 'Moderation',
            usage: '[amount] <phrase> (optional)',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'amount', type: 'NUMBER', description: 'Amount of Messages', required: true },
                { name: 'phrase', type: 'STRING', description: 'Phrase to Delete', required: false }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            if (!interaction.member.permissions.has("MANAGE_MESSAGES")) return interaction.reply("**You Don't Have The Permission To Purge Text!**");
            if (!interaction.guild.me.permissions.has("MANAGE_MESSAGES")) return interaction.reply("**I Don't Have The Permission To Purge Text!**");

            const amount = interaction.options.getNumber('amount');
            const phrase = interaction.options.getString('phrase');

            if (isNaN(amount)) return interaction.reply('**Please Supply A Valid Amount To Delete Messages!**');

            if (amount > 100) return interaction.reply("**Please Supply A Number Less Than 100!**");
            if (amount < 1) return interaction.reply("**Please Supply A Number More Than 1!**");

            if (!phrase) {
                interaction.channel.bulkDelete(amount, { filterOld: true }).then(async (messages) => {
                    await interaction.reply(`**Succesfully deleted \`${messages.size}/${amount}\` messages**`);
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 2000);
                }).catch(() => null);
            } else {
                interaction.channel.bulkDelete(
                    (await interaction.channel.messages.fetch({ limit: amount })).filter(filteredMsg => filteredMsg.content.toLowerCase() === phrase.toLowerCase()), { filterOld: true }
                ).then(async (messages) => {
                    await interaction.reply(`**Succesfully deleted \`${messages.size}/${amount}\` messages**`);
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 2000);
                }).catch(() => null);
            }
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};