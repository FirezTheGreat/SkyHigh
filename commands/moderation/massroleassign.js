const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class MassRoleAssign extends Command {
    constructor(...args) {
        super(...args, {
            name: 'massroleassign',
            description: 'Add A Role To Everyone In The Server',
            category: 'Moderation',
            usage: '[mention | ID]',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'role', type: 'ROLE', description: 'Role to Add', required: true },
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            if (!interaction.member.permissions.has("MANAGE_ROLES")) return interaction.reply("**You Don't Have The Permission To Manage Roles!**");
            if (!interaction.guild.me.permissions.has("MANAGE_ROLES")) return interaction.reply("**I Don't Have The Permission To Manage Roles!**");

            const fetchedRole = interaction.options.getRole('role');
            const role = interaction.guild.roles.cache.get(fetchedRole.id);
            let index = 0;

            if (!role) return interaction.reply("**Role Not Found**");
            if (role.guild.id !== interaction.guild.id) return interaction.reply("**Role Not From This Server!**");
            if (role.managed) return interaction.reply("**Cannot Add That Role To Other Users!**");

            await interaction.deferReply();

            for (const member of interaction.guild.members.cache) {
                if (member.roles.cache.has(role.id) || member.user.bot || member.roles.highest.comparePositionTo(interaction.guild.me.roles.highest) >= 0) return;
                    member.roles.add(role.id).catch(() => null);
                    index++
            };

            if (index === 0) return interaction.editReply(`**Everyone Already Has ${role} Assigned To Them!**`);
            const confirmEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                .setDescription(`**${role} Has Been Added To Everyone**`)
                .setFooter(this.bot.user.username, this.bot.user.displayAvatarURL())
                .setTimestamp();

            return await interaction.editReply({ embeds: [confirmEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};