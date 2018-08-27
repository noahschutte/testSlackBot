module.exports = {
    config: function () {
        const output = {}

        try {
            output.users = require('../whitelist/yubikeys.js')
        } catch (e) {
            // console.error("100: daemonsConfig is not optional for runtime!")
        }
        try {
            output.yubikey = require('./yubikeyConfig.js')
        } catch (e) {
            // console.error("100: daemonsConfig is not optional for runtime!")
        }
        try {
            output.slack = require('./slackConfig.js')
        } catch (e) {
            // console.error("100: daemonsConfig is not optional for runtime!")
        }
        try {
            output.admin = require('./adminConfig.js')
        } catch (e) {
            // console.error("100: daemonsConfig is not optional for runtime!")
        }

        return output
    }
}
