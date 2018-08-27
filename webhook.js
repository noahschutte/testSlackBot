const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3001;
const request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/slack', function(req, res){
  let data = {form: {
    client_id: '257085507780.366209018695',
    client_secret: 'a2d5ff7adab3efbb5d01118fedc96d39',
    code: '257085507780.366144430486.03dab82061913f95a0f3850b9605f4f34223dcbf6965ff8c11eb06d9bd7647be'
  }};
  console.log('data: ', data);
  request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
    console.log('body: ', body);
    if (!error && response.statusCode == 200) {
      // You are done.
      // If you want to get team info, you need to get the token here
      let token = JSON.parse(body).access_token; // Auth token
      console.log('token: ', token);
    }
  })
});

const server = app.listen(PORT, () => {
  console.log('Server online...', server.address().port, app.settings.env)
});
