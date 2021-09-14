const Command = require('../../structures/Command');
const MuteList = require('../../structures/models/MuteList');
const { MessageEmbed } = require('discord.js');
const { parseTime, formatTime, generateRandomHex } = require('../../structures/functions');

module.exports = class Mute extends Command {
    constructor(...args) {
        super(...args, {
            name: 'mute',
            description: 'Mutes An User In The Server',
            category: 'Moderation',
            usage: '[mention | ID | username | nickname] <time> (optional)',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'member', type: 'USER', description: 'Member to Mute', required: true },
                { name: 'reason', type: 'STRING', description: 'Reason for Mute', required: false },
                { name: 'time', type: 'STRING', description: 'Time to Mute Until', required: false },
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            if (!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply("**You Dont Have Permmissions To Mute Someone!**");
            if (!interaction.guild.me.permissions.has("MANAGE_GUILD")) return interaction.reply("**I Don't Have Permissions To Mute Someone!**");

            const muteMember = interaction.options.getMember('member');
            const reason = interaction.options.getString('reason') || 'No Reason Provided';
            const time = interaction.options.getString('time') ? parseTime(interaction.options.getString('time')) : 0;

            if (time === null) return interaction.reply(`**Please Enter Time In This Format!\n\n\`\`\`css\n1s, 1m, 1h, 1d, 1w, 1month, 1y\`\`\`**`);
            if (!muteMember) return interaction.reply("**User Is Not In The Server**");

            if (muteMember === interaction.member) return interaction.reply("**You Cannot Mute Yourself!**");
            if (muteMember.roles.highest.comparePositionTo(interaction.guild.me.roles.highest) >= 0) return interaction.reply('**Cannot Mute This User!**');

            let muterole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');
            const userRoles = muteMember.roles.cache.filter(role => !role.managed && role.id !== interaction.guild.id).map(role => role.id);

            await interaction.deferReply();

            if (!muterole) {
                try {
                    muterole = await interaction.guild.roles.create({
                        name: 'Muted',
                        color: "#99AAB5",
                        mentionable: false,
                        permissions: []
                    });

                    for (const [key, channel] of interaction.guild.channels.cache) {
                        await channel.permissionOverwrites.create(muterole, {
                            VIEW_CHANNEL: false,
                            SEND_MESSAGES: false,
                            ADD_REACTIONS: false,
                            SPEAK: false,
                            CONNECT: false,
                        })
                    };
                } catch (error) {
                    console.error(error);
                };
            };

            if (muteMember.roles.cache.has(muterole.id)) return interaction.editReply("**User Is Already Muted!**");
            
            let mutedMemberFetched = await MuteList.findOne({ ID: muteMember.user.id });

            if (!mutedMemberFetched) {
                mutedMemberFetched = await MuteList.create({
                    ID: muteMember.user.id,
                    name: muteMember.user.username,
                    roles: userRoles,
                    time: time !== 0 ? time : 0,
                    reason: reason,
                    tag: `#${generateRandomHex(5)}`
                });

                await mutedMemberFetched.save();
            };

            const removeRoles = muteMember.roles.cache.filter(role => !role.managed);

            muteMember.roles.remove(removeRoles).then(() => {
                muteMember.roles.add(muterole)
                const muteEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setAuthor(muteMember.user.username, muteMember.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`
                **Hello, You Have Been Muted In ${interaction.guild.name}
                ${time !== 0 ? `\n\`Time\` - ${formatTime(time)}` : ''}${`\n\`Reason\` - ${reason}`}**`)
                    .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp();
                muteMember.send({ embeds: [muteEmbed] }).catch(() => null);
            }).catch(() => {
                return interaction.editReply(`Couldn't Mute ${muteMember}`);
            });

            const confirmEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                .setDescription(`
                **${muteMember.user.username} Has Been Muted
                ${time !== 0 ? `\n\`Time\` - ${formatTime(time)}` : ''}${`\n\`Reason\` - ${reason}`}**`)
                .setFooter(this.bot.user.username, this.bot.user.displayAvatarURL())
                .setTimestamp();
            interaction.editReply({ embeds: [confirmEmbed] });

            if (time > 0) {
                setTimeout(async () => {
                    mutedMemberFetched = await MuteList.findOne({ ID: muteMember.user.id });
                    if (!mutedMemberFetched) return;

                    muteMember.roles.remove(muterole).then(async () => {
                        interaction.followUp(`**${muteMember.user.username} Is Now Unmuted!**`);
                        const unmuteEmbed = new MessageEmbed()
                            .setColor('GREEN')
                            .setAuthor(muteMember.user.username, muteMember.user.displayAvatarURL({ dynamic: true }))
                            .setDescription(`**Hello, You Have Been Unmuted In ${interaction.guild.name}**`)
                            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        muteMember.send({ embeds: [unmuteEmbed] }).catch(() => null);

                        const UnmuteMemberFetched = await MuteList.findOne({ ID: muteMember.user.id });

                        if (UnmuteMemberFetched) {
                            for (const roleID of UnmuteMemberFetched.roles) {
                                let role = interaction.guild.roles.cache.get(roleID);
                                muteMember.roles.add(role);
                            };
                            await MuteList.deleteOne({ ID: muteMember.user.id });
                        };
                    }).catch(() => null);

                    const logEmbed = new MessageEmbed()
                        .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                        .setColor('RED')
                        .setTitle(`Prisoner - ${mutedMemberFetched.tag} Unmuted`)
                        .addFields(
                            { name: 'Name', value: muteMember.user.username, inline: true },
                            { name: 'Penalty Duration', value: `${time !== 0 ? formatTime(time) : 'Permanent'}`, inline: true },
                            { name: 'Moderator', value: interaction.user.username, inline: true },
                            { name: 'Reason', value: reason }
                        )
                        .setFooter(`Prisoner Bulletin`, muteMember.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();

                    const logEmbedChannel = interaction.guild.channels.cache.get('875934553800343612');
                    if (logEmbedChannel) return logEmbedChannel.send({ embeds: [logEmbed] });
                }, time);
            };

            const logEmbed = new MessageEmbed()
                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                .setColor('RED')
                .setTitle(`Prisoner - ${mutedMemberFetched.tag} Muted`)
                .addFields(
                    { name: 'Name', value: muteMember.user.username, inline: true },
                    { name: 'Penalty Duration', value: `${time !== 0 ? formatTime(time) : 'Permanent'}`, inline: true },
                    { name: 'Moderator', value: interaction.user.username, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setFooter(`Prisoner Bulletin`, muteMember.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            const logEmbedChannel = interaction.guild.channels.cache.get('875934553800343612');
            if (logEmbedChannel) return logEmbedChannel.send({ embeds: [logEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};