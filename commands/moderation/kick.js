const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class Kick extends Command {
    constructor(...args) {
        super(...args, {
            name: 'kick',
            description: 'Kicks An User From The Server',
            category: 'Moderation',
            usage: '[mention | ID | username | nickname]',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'member', type: 'USER', description: 'Member to Kick', required: true },
                { name: 'reason', type: 'STRING', description: 'Reason for Kick', required: false }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            if (!interaction.member.permissions.has("KICK_MEMBERS")) return interaction.reply("**You Don't Have The Permission To Kick Users!**");
            if (!interaction.guild.me.permissions.has("KICK_MEMBERS")) return interaction.reply("**I Don't Have The Permission To Kick Users!**");

            const kickMember = interaction.options.getMember('member');
            const reason = interaction.options.getString('reason') || 'No Reason Provided';

            if (!kickMember) return interaction.reply("**User Is Not In The Server**");
            if (kickMember === interaction.member) return interaction.reply("**You Cannot Kick Yourself!**");
            if (!kickMember.kickable) return interaction.reply("**Cannot Kick That User!**");

            kickMember.kick(reason.length !== 0 ? reason : 'No Reason Provided').then(() => {
                const kickEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setAuthor(kickMember.user.username, kickMember.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`
                **Hello, You Have Been Kicked From ${interaction.guild.name}
                ${reason.length !== 0 ? `\n\`Reason\` - ${reason}` : ''}**`)
                    .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp();
                kickMember.send({ embeds: [kickEmbed] }).catch(() => null);
            }).catch(() => {
                return interaction.reply(`Couldn't Kick ${kickMember}`); 
            });

            const confirmEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                .setDescription(`
                **${kickMember.user.username} Has Been Kicked
                ${reason.length !== 0 ? `\n\`Reason\` - ${reason}` : '\n\`Reason\` - No Reason Provided'}**`)
                .setFooter(this.bot.user.username, this.bot.user.displayAvatarURL())
                .setTimestamp();
            return interaction.reply({ embeds: [confirmEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};