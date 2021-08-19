const { Schema, model } = require('mongoose');

const MyRemindListSchema = new Schema({
    ID: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    UserID: {
        type: String,
        required: true,
    },
    GuildID: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true,
        default: Date.now()
    },
    reason: {
        type: String,
        required: true,
        default: 'No Reason'
    },
    timeInMS: {
        type: Number,
        required: true,
        default: Date.now()
    },
    daily: {
        type: Boolean,
        required: false,
        default: false
    }
});

module.exports = model('RemindList', MyRemindListSchema, 'RemindList');