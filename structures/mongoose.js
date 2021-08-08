let { connect, Promise, connection } = require('mongoose');

module.exports = {
    init: () => {
        const dbOptions = {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
            useFindAndModify: false,
            family: 4,
            poolSize: 5,
            connectTimeoutMS: 10000
        };

        connect('mongodb+srv://firez:skyhigh@sky-high.s6amn.mongodb.net/skyhigh?authSource=admin&replicaSet=atlas-tbixx0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', dbOptions);
        Promise = global.Promise;

        connection.on('connected', () => {
            console.log('Connected to MongoDB Successfully!');
        });

        connection.on('err', err => {
            console.error(`Error Occured From MongoDB: \n${err.message}`);
        });

        connection.on('disconnected', () => {
            console.warn('Connection Disconnected!');
        });
    }
};