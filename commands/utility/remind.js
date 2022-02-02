const Command = require("../../structures/Command");
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { generateRandomHex } = require("../../structures/functions");
const RemindList = require("../../structures/models/RemindList");
const buttonMonthOptions = [
    { customId: 'remind_Jan', value: 'January', maxDate: 31 }, { customId: 'remind_Feb', value: 'February', maxDate: 28, maxLeapYearDate: 29 },
    { customId: 'remind_Mar', value: 'March', maxDate: 31 }, { customId: 'remind_Apr', value: 'April', maxDate: 30 },
    { customId: 'remind_May', value: 'May', maxDate: 31 }, { customId: 'remind_Jun', value: 'June', maxDate: 30 },
    { customId: 'remind_Jul', value: 'July', maxDate: 31 }, { customId: 'remind_Aug', value: 'August', maxDate: 31 },
    { customId: 'remind_Sep', value: 'September', maxDate: 30 }, { customId: 'remind_Oct', value: 'October', maxDate: 31 },
    { customId: 'remind_Nov', value: 'November', maxDate: 30 }, { customId: 'remind_Dec', value: 'December', maxDate: 31 }
];
const buttonYearOptions = [
    { customId: 'remind_2021', value: 2021 },
    { customId: 'remind_2022', value: 2022 }
];

module.exports = class Remind extends Command {
    constructor(...args) {
        super(...args, {
            name: 'remind',
            category: 'Utility',
            description: 'Reminds You 5 Minutes Before',
            usage: '[time] <daily> (optional)',
            accessableby: 'Everyone',
            slashCommand: true,
            buttonCommands: ['remind_Jan', 'remind_Feb', 'remind_Mar', 'remind_Apr',
                'remind_May', 'remind_Jun', 'remind_Jul', 'remind_Aug', 'remind_Sep',
                'remind_Oct', 'remind_Nov', 'remind_Dec', 'remind_2021', 'remind_2022',
                'remind_selectDate', 'remind_enterReason'],
            commandOptions: [
                {
                    name: 'create', type: 'SUB_COMMAND', description: 'Create a Reminder', options:
                        [
                            { name: 'time', type: 'STRING', description: 'Remind After', required: true },
                            {
                                name: 'daily', type: 'STRING', description: 'Remind Daily', required: false, choices:
                                    [
                                        { name: 'yes', value: 'true' },
                                        { name: 'no', value: 'false' }
                                    ]
                            }
                        ]
                },
                {
                    name: 'delete', type: 'SUB_COMMAND', description: 'Delete a Reminder', options:
                        [
                            { name: 'id', type: 'STRING', description: 'ReminderId to Delete', required: true }
                        ]
                },
                {
                    name: 'edit', type: 'SUB_COMMAND', description: 'Edit a Reminder', options:
                        [
                            { name: 'id', type: 'STRING', description: 'ReminderId to Edit', required: true },
                            {
                                name: 'daily', type: 'STRING', description: 'Remind Daily', required: false, choices:
                                    [
                                        { name: 'yes', value: 'true' },
                                        { name: 'no', value: 'false' }
                                    ]
                            }
                        ]
                },
                {
                    name: 'show', type: 'SUB_COMMAND', description: 'List of Reminders', options:
                        [
                            { name: 'id', type: 'STRING', description: 'ReminderId to Show', required: false }
                        ]
                }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            const command = interaction.options._subcommand;

            if (command === 'create') {
                const time = interaction.options.getString('time');
                let parsedTime;

                const row_first = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('remind_Jan')
                            .setLabel('January')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('remind_Feb')
                            .setLabel('February')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('remind_Mar')
                            .setLabel('March')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('remind_Apr')
                            .setLabel('April')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('remind_May')
                            .setLabel('May')
                            .setStyle('SECONDARY')
                    );
                const row_second = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('remind_Jun')
                            .setLabel('June')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('remind_Jul')
                            .setLabel('July')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('remind_Aug')
                            .setLabel('August')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('remind_Oct')
                            .setLabel('October')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('remind_Nov')
                            .setLabel('November')
                            .setStyle('SECONDARY')
                    );
                const row_third = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('remind_Dec')
                            .setLabel('December')
                            .setStyle('SECONDARY')
                    );
                const row_fourth = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('remind_2021')
                            .setLabel('2021')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('remind_2022')
                            .setLabel('2022')
                            .setStyle('SECONDARY')
                    );

                const monthEmbed = new MessageEmbed()
                    .setTitle('Select Month')
                    .setColor('GREEN')
                    .setDescription('**Select Which Month To Remind You On?**')
                    .setFooter(this.bot.user.username, this.bot.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                const dateEmbed = new MessageEmbed()
                    .setTitle('Enter Date')
                    .setColor('GREEN')
                    .setDescription('**Enter Which Date To Remind You On?**')
                    .setFooter(this.bot.user.username, this.bot.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                const yearEmbed = new MessageEmbed()
                    .setTitle('Select Year')
                    .setColor('GREEN')
                    .setDescription('**Select Which Year To Remind You On?**')
                    .setFooter(this.bot.user.username, this.bot.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                const reasonEmbed = new MessageEmbed()
                    .setTitle('Enter Reason')
                    .setColor('GREEN')
                    .setDescription('**Enter Reason To Remind You For**')
                    .setFooter(this.bot.user.username, this.bot.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();
                try {
                    await interaction.deferReply();
                    const messageMonth = await interaction.editReply({ embeds: [monthEmbed], components: [row_first, row_second, row_third] });
                    const buttonMonthFilter = button => this.buttonCommands.includes(button.customId) && button.user.id === interaction.user.id;

                    const collectorMonth = await messageMonth.awaitMessageComponent({ filter: buttonMonthFilter, time: 20000, componentType: 'BUTTON' });
                    const month = buttonMonthOptions.findIndex(button => button.customId === collectorMonth.customId);
                    const { value: monthName } = buttonMonthOptions[month];

                    const updated_row_first = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('remind_selectedMonth')
                                .setLabel(monthName)
                                .setStyle('SUCCESS')
                                .setDisabled()
                        );
                    await collectorMonth.update({ components: [updated_row_first] });

                    let maxDate;
                    monthName !== 'February' ? maxDate = buttonMonthOptions[month].maxDate : maxDate = buttonMonthOptions[month].maxLeapYearDate;

                    const updated_row_second_disabled = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('remind_selectDate')
                                .setLabel('Enter Date')
                                .setStyle('SECONDARY')
                                .setDisabled()
                        );
                    const messageDate = await interaction.followUp({ embeds: [dateEmbed], components: [updated_row_second_disabled], fetchReply: true });

                    const messageDateFilter = message => message.author.id === interaction.user.id;
                    const collectorDate = await messageDate.channel.awaitMessages({ filter: messageDateFilter, max: 1, time: 20000 });

                    if (collectorDate.size === 0 || (Number(collectorDate.first().content) < 1 || Number(collectorDate.first().content) > maxDate)) return interaction.followUp(`**Please Enter A Valid Date For The ${monthName} Month**`);
                    else collectorDate.first().delete().catch(() => null);
                    const date = Number(collectorDate.first().content);

                    const updated_row_second = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('remind_selectedDate')
                                .setLabel(date.toString().length === 1 ? `0${date}` : `${date}`)
                                .setStyle('SUCCESS')
                                .setDisabled()
                        );
                    await messageDate.edit({ components: [updated_row_second] });

                    const messageYear = await interaction.followUp({ embeds: [yearEmbed], components: [row_fourth], fetchReply: true });
                    const buttonYearFilter = button => this.buttonCommands.includes(button.customId) && button.user.id === interaction.user.id;

                    const collectorYear = await messageYear.awaitMessageComponent({ filter: buttonYearFilter, time: 20000, componentType: 'BUTTON' });
                    const year = buttonYearOptions.findIndex(button => button.customId === collectorYear.customId);
                    const { value: yearName } = buttonYearOptions[year];

                    const updated_row_third = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('remind_selectedYear')
                                .setLabel(`${yearName}`)
                                .setStyle('SUCCESS')
                                .setDisabled()
                        );
                    await collectorYear.update({ components: [updated_row_third] });

                    parsedTime = new Date(`${month + 1}/${date}/${yearName} ${time}`);

                    if (parsedTime.toString() === 'Invalid Date') return interaction.followUp(`**Please Enter Correct Time Format!\n\n\`\`\`css\n10:00 | 18:30 | 23:59 | 00:10:59\`\`\`**`);
                    if (parsedTime.getTime() - Date.now() < 0) return interaction.followUp(`**Entered Time Exceeds Current Time**`);

                    let remindDaily = interaction.options.getString('daily') || false;
                    if (remindDaily === 'true') remindDaily = true;

                    const updated_row_fourth_disabled = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('remind_enterReason')
                                .setLabel('Enter Reason')
                                .setStyle('SECONDARY')
                                .setDisabled()
                        );
                    const messageReason = await interaction.followUp({ embeds: [reasonEmbed], components: [updated_row_fourth_disabled], fetchReply: true });
                    let reasonReminder;

                    const messageReasonFilter = message => message.author.id === interaction.user.id;
                    const collectorReason = await messageReason.channel.awaitMessages({ filter: messageReasonFilter, max: 1, time: 20000 });

                    if (collectorReason.size === 0) reasonReminder = 'No Reason';
                    else {
                        reasonReminder = collectorReason.first().content;
                        collectorReason.first().delete().catch(() => null);
                    };

                    const updated_row_fourth = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('remind_selectedReason')
                                .setLabel('Reason Entered')
                                .setStyle('SUCCESS')
                                .setDisabled()
                        );
                    await messageReason.edit({ components: [updated_row_fourth] });

                    const generatedID = generateRandomHex(5);

                    const reminder = await RemindList.create({
                        ID: generatedID,
                        UserID: interaction.member.id,
                        GuildID: interaction.guild.id,
                        time: parsedTime.toString(),
                        timeInMS: parsedTime.getTime(),
                        reason: reasonReminder,
                        daily: remindDaily
                    });

                    const reminderSetEmbed = new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setColor('GREEN')
                        .setDescription(`Set${reminder.daily ? ' Daily' : ''} Reminder - ${reminder.reason}`)
                        .setFooter('Reminder By SkyHigh')
                        .setTimestamp();
                    await interaction.followUp({ embeds: [reminderSetEmbed] });

                    let reminderInterval = setInterval(async function () {
                        let newReminder = await RemindList.findOne({ ID: generatedID });

                        if (!newReminder || newReminder.timeInMS - Date.now() > 0) return;
                        await dailyReminder(interaction, newReminder, this.bot);

                        if (newReminder.daily) {
                            let parsedTimeForTomorrow = new Date(newReminder.timeInMS);
                            parsedTimeForTomorrow.setDate(parsedTimeForTomorrow.getDate() + 1);

                            return await RemindList.findOneAndUpdate(
                                { ID: generatedID },
                                {
                                    time: parsedTimeForTomorrow.toString(),
                                    timeInMS: parsedTimeForTomorrow.getTime(),
                                }
                            );
                        } else if (!newReminder.daily) {
                            clearInterval(reminderInterval);
                            return await RemindList.deleteOne({ ID: generatedID });
                        };
                    }, 10000);
                    return;
                } catch (error) {
                    if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
                        await interaction.editReply({ components: [] })
                        return interaction.followUp('**Timeout**');
                    } else {
                        console.error(error);
                        return interaction.followUp(`An Error Occurred: \`${error.message}\`!`);
                    };
                };
            } else if (command === 'delete') {
                const reminderID = interaction.options.getString('id');
                const reminder = await RemindList.findOne({ ID: reminderID });

                if (reminder) {
                    await RemindList.deleteOne({ ID: reminder.ID });
                    return interaction.reply(`**ID - ${reminder.ID} Deleted**`);
                } else {
                    return interaction.reply('**Incorrect Reminder ID!**');
                };
            } else if (command === 'edit') {
                const reminderID = interaction.options.getString('id');
                let remindDaily = interaction.options.getString('daily') || false;
                if (remindDaily === 'true') remindDaily = true;

                const findReminder = await RemindList.findOne({ ID: reminderID });
                if (!findReminder) return interaction.reply('**Incorrect Reminder ID!**')

                const reasonEmbed = new MessageEmbed()
                    .setTitle('Enter New Reason')
                    .setColor('GREEN')
                    .setDescription('**Enter New Reason To Remind You**')
                    .setFooter(this.bot.user.username, this.bot.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await interaction.deferReply();
                const row_first_disabled = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('remind_editReason')
                            .setLabel('Edit Reason')
                            .setStyle('SECONDARY')
                            .setDisabled()
                    );

                const messageReason = await interaction.reply({ embeds: [reasonEmbed], components: [row_first_disabled], fetchReply: true });
                let reasonReminder;

                const messageReasonFilter = message => message.author.id === interaction.user.id;
                const collectorReason = await messageReason.channel.awaitMessages({ filter: messageReasonFilter, max: 1, time: 20000 });

                if (collectorReason.size === 0) reasonReminder = 'No Reason';
                else {
                    reasonReminder = collectorReason.first().content;
                    collectorReason.first().delete().catch(() => null);
                };

                const updated_row_first = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('remind_selectedEditReason')
                            .setLabel('Reason Updated')
                            .setStyle('SUCCESS')
                            .setDisabled()
                    );
                await messageReason.edit({ components: [updated_row_first] });

                const reminder = await RemindList.findOneAndUpdate(
                    {
                        ID: reminderID
                    },
                    {
                        reason: reasonReminder,
                        daily: remindDaily
                    },
                    {
                        new: true
                    }
                );

                const reminderSetEmbed = new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                    .setColor('GREEN')
                    .setDescription(`Updated Your${reminder.daily ? ' Daily' : ''} Reminder - ${reminder.reason}`)
                    .setFooter('Reminder By SkyHigh')
                    .setTimestamp();
                return await interaction.followUp({ embeds: [reminderSetEmbed] });
            } else if (command === 'show') {
                const reminderID = interaction.options.getString('id') || null;

                if (!reminderID) {
                    const reminders = await RemindList.find({ UserID: interaction.user.id });
                    if (!reminders.length) return interaction.reply(`**You Haven't Created Any Reminders!**`);
                    let description = '';

                    for (let i in reminders) {
                        description += `ID - #${reminders[i].ID} | Time - ${new Date(reminders[i].timeInMS).toLocaleTimeString([], { timeZone: 'IST' })} | Reminder - ${reminders[i].reason}${reminders[i].daily ? ' | Daily Reminder' : ` | Reminds On - <t:${Math.floor(reminders[i].timeInMS / 1000)}:D>`}\n`;
                    };

                    const reminderListEmbed = new MessageEmbed()
                        .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                        .setColor('GREEN')
                        .setDescription(description)
                        .setFooter(`Reminder List For ${interaction.user.username}`, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();
                    return interaction.reply({ embeds: [reminderListEmbed] });
                } else {
                    const reminder = await RemindList.findOne({ ID: reminderID });
                    if (!reminder) return interaction.reply(`**Reminder With ID - ${reminderID} Not Found!**`);

                    const reminderListEmbed = new MessageEmbed()
                        .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                        .setColor('GREEN')
                        .setDescription(`ID - #${reminder.ID} | Time - ${new Date(reminder.timeInMS).toLocaleTimeString([], { timeZone: 'IST' })} | Reminder - ${reminder.reason}${reminder.daily ? ' | Daily Reminder' : ` | Reminds On - <t:${Math.floor(reminder.timeInMS / 1000)}:D>`}\n`)
                        .setFooter(`Reminder List For ${interaction.user.username}`, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();
                    return interaction.reply({ embeds: [reminderListEmbed] });
                };
            };
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};

async function dailyReminder(interaction, reminder, bot) {
    const reminderEmbed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setColor('GREEN')
        .addField(`**Reminder Of ${reminder.time.slice(0, -30).trim()}**`, reminder.reason)
        .setTimestamp();
    reminder.daily ? reminderEmbed.setFooter('Your Daily Reminder By SkyHigh Bot', bot.user.displayAvatarURL({ dynamic: true })) : null;
    return interaction.user.send({ embeds: [reminderEmbed] }).catch(async () => await RemindList.deleteOne({ ID: generatedID }));
};