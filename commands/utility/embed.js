const Command = require("../../structures/Command");
const { MessageEmbed } = require('discord.js');

module.exports = class Embed extends Command {
    constructor(...args) {
        super(...args, {
            name: 'embed',
            category: 'Utility',
            description: 'Converts Text Into Embed',
            usage: '[channel] [hexcode] [text]',
            accessableby: 'Everyone',
            slashCommand: true,
            commandOptions: [
                { name: 'channel', type: 'CHANNEL', description: 'Channel to Send', required: true },
                { name: 'color', type: 'STRING', description: 'HexCode or Color', required: true }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'access');
            if (!role) return interaction.reply('**Role Not Found - Access**!');
            if (!interaction.member.roles.cache.has(role.id) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply('**You Are Missing Permissions To Execute This Command**!');

            const channel = interaction.options.getChannel('channel');
            if (!channel || !channel.isText()) return interaction.reply('**Channel Not Found!**');

            const color = interaction.options.getString('color');
            if (!color) return interaction.reply('**Please Enter A Hex Code or Color Name**');

            interaction.reply({ content: '**Please Enter A Message Or Attachment Below!**', ephemeral: true });

            const messageFilter = (message) => message.author.id === interaction.user.id && !interaction.user.bot;
            const collector = await interaction.channel.awaitMessages({
                filter: messageFilter,
                max: 1,
                time: 60000
            });

            if (collector.size === 0) return interaction.followUp(`**Timeout!**`);
            if (!collector.first().content && collector.first().attachments.size === 0) return interaction.followUp('**Please Enter A Message Or Attachment To Announce!**');

            const embed = new MessageEmbed()
                .setColor(color.toUpperCase())
                .setTimestamp();

            if (collector.first().content) embed.setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
            if (collector.first().content) embed.setDescription(collector.first().content);
            if (collector.first().attachments.size !== 0) embed.setImage(collector.first().attachments.first().url);

            interaction.followUp(`**Embed Sent In ${channel}**`);
            return channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};