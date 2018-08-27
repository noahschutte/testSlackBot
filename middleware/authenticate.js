const yubikey = require('../modules/yubikey');
const config = require('../config/configMaster').config();

const authenticateUser = async (req, res, next) => {
    const yubiTap = req.body.text;
    if (yubiTap === '') {
        const responses = [
            "Hey dummy, you forgot your yubikey tap.",
        ]
        const text = responses[Math.floor(Math.random()*responses.length)];
        const result = {
            response_type: 'ephemeral',
            text: text
        };

        return res.json(result);
    }
    const authentication = await yubikey.authenticate(yubiTap)
    if (authentication.success !== true) {
        const responses = [
            "You are not authorized.",
            "We are the knights who say ni!",
            "You must be this tall to ride this ride.",
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        ]
        const text = responses[Math.floor(Math.random()*responses.length)];
        const result = {
            response_type: 'ephemeral',
            text: text
        };

        return res.json(result);
    }
    next()
};

const authenticateSlack = async (req, res, next) => {
    if (req.body.token !== config.slack.token) {
        const responses = [
            "HACKER!",
        ]
        const text = responses[Math.floor(Math.random()*responses.length)];
        const result = {
            response_type: 'ephemeral',
            text: text
        };

        return res.json(result);
    }
    next()
};

module.exports = {
    authenticateUser,
    authenticateSlack,
};
