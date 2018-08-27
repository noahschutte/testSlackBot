const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const {
    authenticateUser,
    authenticateSlack,
} = require('./middleware/authenticate');
const config = require('./config/configMaster').config();
const balanceThresholds = require('./balanceThesholds');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let cookies;

async function _main () {
    try {
        const loginUrl = config.admin.url + 'login_L79zXPKebsEqe0WR2YLd';
        await request.post({
            url: loginUrl,
            form: {
                'username': config.admin.username,
                'password': config.admin.password,
            }
        },
        function (error, response) {
            if (error || !response.headers['set-cookie']) { throw error }
            cookies = response.headers['set-cookie']
        });
    } catch (error) {
        throw new Error(`Admin login | ${error}`)
    }
}

app.post('/balances', authenticateSlack, authenticateUser, async function (req, res) {
    try {
        if (req.body.channel_id !== config.slack.balancesChannelId) {
            let data = {};
            data.response_type = 'ephemeral'; // private
            data.text = 'Wrong channel, homie.';
            return res.json(data);
        }

        const balancesUrl = config.admin.url + 'balances';
        request.get({
                url: balancesUrl,
                headers: {
                    'Cookie': cookies
                }
            },
            function (error, response) {
                if (error) { throw error }
                const content = JSON.parse(response.body);
                const {
                    wallets,
                    coins,
                    asymCoins
                } = content;

                const messages = []
                for (let i = 0; i < coins.length; i++) {

                    let hot = (!!wallets.hot) ? wallets.hot[coins[i]].balance : null;
                    let binance = (!!wallets.binance && wallets.binance[coins[i]]) ? wallets.binance[coins[i]].balance : null;
                    let bitfinex = (!!wallets.bitfinex && wallets.bitfinex[coins[i]]) ? wallets.bitfinex[coins[i]].balance : null;
                    let bittrex = (!!wallets.bittrex && wallets.bittrex[coins[i]]) ? wallets.bittrex[coins[i]].balance : null;
                    let poloniex = (!!wallets.poloniex && wallets.poloniex[coins[i]]) ? wallets.poloniex[coins[i]].balance : null;
                    // let btce = (!!wallets.btce && wallets.btce[coins[i]]) ? wallets.btce[coins[i]].balance : null;
                    // let kraken = (!!wallets.kraken && wallets.kraken[coins[i]]) ? wallets.kraken[coins[i]].balance : null;
                    // let yunbi = (!!wallets.yunbi && wallets.yunbi[coins[i]]) ? wallets.yunbi[coins[i]].balance : null;
                    // let liqui = (!!wallets.liqui && wallets.liqui[coins[i]]) ? wallets.liqui[coins[i]].balance : null;
                    // let totals = (!!wallets.totals && wallets.totals[coins[i]]) ? wallets.totals[coins[i]].balance : null;

                    let asym = asymCoins && asymCoins.length > 0 && asymCoins.includes(coins[i].toLowerCase());

                    const coin = coins[i].toUpperCase();
                    const thresholds = balanceThresholds[`${coin}`];

                    if (hot && thresholds && hot < thresholds.HOT_min) {
                        messages.push(`:chart_with_downwards_trend: :${coin}: ${coin} :moneybag: HOT balance ${hot} < ${thresholds.HOT_min}`)
                    }
                    if (hot && thresholds && hot > thresholds.HOT_max) {
                        messages.push(`:chart_with_upwards_trend: :${coin}: ${coin} :moneybag: HOT balance ${hot} > ${thresholds.HOT_max}`)
                    }
                    if (bittrex && thresholds && bittrex < thresholds.Bittrex_min) {
                        messages.push(`:chart_with_downwards_trend: :${coin}: ${coin} :bittrex: balance ${bittrex} < ${thresholds.Bittrex_min}`)
                    }
                    if (bittrex && thresholds && bittrex > thresholds.Bittrex_max) {
                        messages.push(`:chart_with_upwards_trend: :${coin}: ${coin} :bittrex: balance ${bittrex} > ${thresholds.Bittrex_max}`)
                    }
                    if (binance && thresholds && binance < thresholds.Binance_min) {
                        messages.push(`:chart_with_downwards_trend: :${coin}: ${coin} :binance: balance ${binance} < ${thresholds.Binance_min}`)
                    }
                    if (binance && thresholds && binance > thresholds.Binance_max) {
                        messages.push(`:chart_with_upwards_trend: :${coin}: ${coin} :binance: balance ${binance} > ${thresholds.Binance_max}`)
                    }
                    if (bitfinex && thresholds && bitfinex < thresholds.Bitfinex_min) {
                        messages.push(`:chart_with_downwards_trend: :${coin}: ${coin} :bitfinex: balance ${bitfinex} < ${thresholds.Bitfinex_min}`)
                    }
                    if (bitfinex && thresholds && bitfinex > thresholds.Bitfinex_max) {
                        messages.push(`:chart_with_upwards_trend: :${coin}: ${coin} :bitfinex: balance ${bitfinex} > ${thresholds.Bitfinex_max}`)
                    }
                    if (poloniex && thresholds && poloniex < thresholds.Poloniex_min) {
                        messages.push(`:chart_with_downwards_trend: :${coin}: ${coin} :poloniex: balance ${poloniex} < ${thresholds.Poloniex_min}`)
                    }
                    if (poloniex && thresholds && poloniex > thresholds.Poloniex_max) {
                        messages.push(`:chart_with_upwards_trend: :${coin}: ${coin} :poloniex: balance ${poloniex} > ${thresholds.Poloniex_max}`)
                    }
                }

                let text;
                if (messages.length) {
                    text = messages.join('\n')
                } else {
                    text = `The universe is in perfect balance.`
                }

                // Dash emoji namespace is taken, the custom emoji is :dash_:
                // capitalization does not matter for emojis
                const regex = /:DASH:/gi;
                text = text.replace(regex, ':DASH_:');

                const result = {
                    response_type: 'in_channel',
                    text: text
                };

                return res.json(result);
            })
    } catch (error) {
        console.log(`Failed to fetch balances | ${error}`)
    }
});

app.listen(PORT, async () => {
    try {
        await _main()
    } catch (error) {
        throw new Error(`Failed to start balance bot | ${error.message}`)
    }
    console.log('Server online...');
});

