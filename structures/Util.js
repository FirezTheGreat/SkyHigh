const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const Command = require('./Command.js');
const Event = require('./Event.js');

module.exports = class Util {

    constructor(bot) {
        this.bot = bot;
    };

    isClass(input) {
        return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
    };

    get directory() {
        return `${path.dirname(require.main.filename)}${path.sep}`;
    };

    async loadCommands() {
        return glob(`${this.directory}commands/**/*.js`).then(commands => {
            for (const commandFile of commands) {
                delete require.cache[commandFile];
                const { name } = path.parse(commandFile);
                const File = require(commandFile);
                if (!this.isClass(File)) throw new TypeError(`Command ${name} doesn't export a class.`);
                const command = new File(this.bot, name.toLowerCase());
                if (!(command instanceof Command)) throw new TypeError(`Command ${name} doesnt belong in Commands.`);
                this.bot.commands.set(command.name, command);
            };
        });
    };

    async loadEvents() {
        return glob(`${this.directory}events/**/*.js`).then(events => {
            for (const eventFile of events) {
                delete require.cache[eventFile];
                const { name } = path.parse(eventFile);
                const File = require(eventFile);
                if (!this.isClass(File)) throw new TypeError(`Event ${name} doesn't export a class!`);
                const event = new File(this.bot, name.toLowerCase());
                if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in Events`);
                this.bot.events.set(event.name, event);
                event.emitter[event.type](name, (...args) => event.run(...args));
            };
        });
    };
};