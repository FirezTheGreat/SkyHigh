const { Schema, model } = require('mongoose');

const MyMuteListSchema = new Schema({
    ID: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    name: {
        type: String,
        required: true
    },
    roles: {
        type: Array,
        required: false
    },
    time: {
        type: Number,
        required: false
    },
    reason: {
        type: String,
        required: false,
        default: 'No Reason Provided'
    },
    tag: {
        type: String,
        required: false
    }
});

module.exports = model('MuteList', MyMuteListSchema, 'MuteList');