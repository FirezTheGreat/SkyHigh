const Event = require('../../structures/Event');

module.exports = class interactionCreate extends Event {
    constructor(...args) {
        super(...args)
    };

    async run(interaction) {
        if (interaction.isCommand()) {
            const command = this.bot.commands.get(interaction.commandName.toLowerCase());
            if (command) command.interactionRun(interaction);
        };
    };
};