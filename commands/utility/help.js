const Command = require("../../structures/Command");
const { MessageEmbed } = require('discord.js');
const { readdirSync } = require('fs')

module.exports = class Help extends Command {
    constructor(...args) {
        super(...args, {
            name: 'help',
            category: 'Utility',
            description: 'Displays A List Of Commands Available',
            usage: '[name] (optional)',
            accessableby: 'Everyone',
            slashCommand: true,
            commandOptions: [
                { name: 'command', type: 'STRING', description: 'Command for Details', required: false }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            const command = interaction.options.getString('command');

            const helpEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setThumbnail(this.bot.user.displayAvatarURL({ dynamic: true }));

            if (!command) {
                helpEmbed.setAuthor(`${interaction.guild.me.displayName} Help`, interaction.guild.iconURL({ dynamic: true }));
                const categories = readdirSync("./commands/");

                helpEmbed.setDescription(`**These Are the Available Commands For ${interaction.guild.me.displayName}\nBot's Prefix Is \`${this.bot.prefix}\`\n\nFor Help Related To A Particular Command Type -\n\`${this.bot.prefix}help [command name]\`**`)
                helpEmbed.setFooter(`${interaction.guild.me.displayName} | Total Commands - ${this.bot.commands.size}`, this.bot.user.displayAvatarURL({ dynamic: true }));

                categories.forEach(category => {
                    const dir = this.bot.commands.filter(command => command.category.toLowerCase() === category.toLowerCase());
                    const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1)
                    try {
                        helpEmbed.addField(` ${capitalise} [${dir.size}] - `, dir.map(c => `\`${c.name}\``).join(", "))
                    } catch (error) {
                        console.error(error);
                        return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
                    };
                });
                return interaction.reply({ embeds: [helpEmbed] });
            } else {
                helpEmbed.setAuthor(`${interaction.guild.me.displayName} Help`, this.bot.user.displayAvatarURL({ dynamic: true }))
                let cmd = this.bot.commands.get(command.toLowerCase());
                if (!cmd) return interaction.reply({ embeds: [helpEmbed.setTitle("**Invalid Command!**").setDescription(`**Do \`${this.bot.prefix}help\` For the List Of the Commands!**`)] })

                helpEmbed.setDescription(`**The Bot's Prefix Is \`${this.bot.prefix}\`**\n
** Name -** ${cmd.name.slice(0, 1).toUpperCase() + cmd.name.slice(1)}\n
** Description -** ${cmd.description || "No Description provided."}\n
** Slash Command -** ${cmd.slashCommand}\n
** Category -** ${cmd.category}\n
** Usage -** ${cmd.usage ? `\`${this.bot.prefix}${cmd.name} ${cmd.usage}\`` : `\`${this.bot.prefix}${cmd.name}\``}\n
** Accessible by -** ${cmd.accessableby || "everyone"}\n`)
                helpEmbed.setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                helpEmbed.setTimestamp();

                return interaction.reply({ embeds: [helpEmbed] });
            };
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};