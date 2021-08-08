const Command = require("../../structures/Command");

module.exports = class Avatar extends Command {
    constructor(...args) {
        super(...args, {
            name: 'avatar',
            category: 'Utility',
            description: 'Shows Avatar Of An User Or Your Avatar',
            usage: '[mention | ID | username | nickname] (optional)',
            accessableby: 'Everyone',
            slashCommand: true,
            commandOptions: [
                { name: 'member', type: 'USER', description: 'User for Avatar', required: false }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            const member = interaction.options.getMember('member') || interaction.member;
            if (!member) return interaction.reply('**Member Not Found!**');

            if (interaction.options.length > 0) {
                return interaction.reply({
                    embeds: [
                        {
                            title: `${member.user.username}'s Avatar`,
                            color: 'GREEN',
                            image: {
                                url: member.user.displayAvatarURL({ dynamic: true, size: 4096 })
                            },
                            timestamp: new Date(),
                            footer: {
                                text: interaction.guild.name,
                                icon_url: interaction.guild.iconURL({ dynamic: true })
                            }
                        }
                    ]
                });
            } else {
                return interaction.reply({
                    embeds: [
                        {
                            title: `${member.user.username}'s Avatar`,
                            color: 'GREEN',
                            image: {
                                url: member.user.displayAvatarURL({ dynamic: true, size: 4096 })
                            },
                            timestamp: new Date(),
                            footer: {
                                text: interaction.guild.name,
                                icon_url: interaction.guild.iconURL({ dynamic: true })
                            }
                        }
                    ]
                });
            };
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};