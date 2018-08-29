const dotenv = require("dotenv").config()

module.exports = {
    port:process.env.PORT || 8080,
    africasTalking:{
        apiKey:process.env.apiKey,
        username:process.env.username
    },
    pubnub:{
        subscribeKey:process.env.subscribeKey,
        publishKey:process.env.publishKey
    }
}