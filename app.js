const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', (req, res) => {
  let coin = (Math.random() < 0.5) ? 'Heads' : 'Tails';
  let data = {
    response_type: 'in_channel', // public to the channel
    text: coin
  };
  res.json(data);
});

const server = app.listen(PORT, () => {
  console.log('Server online...')
});