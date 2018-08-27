let when = require('when');
let TAG = ' | balancer | ';
let yub = require('yub');

const config = require('../config/configMaster').config();
yub.init(config.yubikey.pub, config.yubikey.priv);

let users = config.users;
let valid = Object.keys(users);

module.exports = {
    authenticate: function (auth) {
        return authenticate_press(auth)
    },
};

const authenticate_press = async function (auth) {
    let tag = TAG + ' | perform_balance_action | ';
    let debug = true;
    try {
        let success = await yubikey(auth);
        if (debug) console.log(tag, 'success:', success);

        // default to error
        let output = {
            success: false,
            msg: ' Im afraid I cant let you do that dave! '
        };
        if (success) {
            output.success = true;
            output.identity = success.identity;
            output.user = users[success.identity];
            output.msg = 'user: ' + users[success.identity] + ' approved'
        }
        return output
    } catch (e) {
        console.error(tag, 'ERROR:', e)
    }
};

const yubikey = function (auth) {
    let d = when.defer();
    let tag = TAG + ' | yubikey | ';
    let debug = true;
    yub.verify(auth, function (err, data) {
        if (debug) console.log(tag, 'data:', data);
        if (debug) console.log(tag, 'err:', data);
        if (!err && data.valid && data.signatureVerified && data.nonceVerified && valid.indexOf(data.identity) >= 0) {
            console.log(tag, ' Successful AUTH: ');
            d.resolve(data)
        } else {
            console.error(tag, ' Failed to auth! err: ', err);
            d.resolve(false)
        }
    });

    return d.promise
};
