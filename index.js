// index.js
require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const { URL } = require('url');
const dns = require('dns');
const mongoose = require('mongoose');
const app = express();
const url_model = require(__dirname + '/model/url');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('connected to mongodb'))
  .catch((e) => console.error('Error connecting to mongodb', e));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function (req, res) {
  try {
    const url = new URL(req.body.url);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }

    const hostname = url.hostname;

    dns.lookup(hostname, async (err) => {
      if (err) throw new Error(err);
      else {
        try {
          const existingUrl = await url_model.findOne({ original_url: url }).exec();
          if (existingUrl) {
            res.json({original_url: existingUrl.original_url, short_url: existingUrl.short_url });
          } else {
            const count = await url_model.countDocuments({});
            const short_url = count + 1; // Increment the count for short URL
            const url_doc = new url_model({ original_url: url, short_url: short_url });
            await url_doc.save();
            res.json({ original_url: url, short_url: short_url });
          }
        } catch (e) {
          throw new Error(e);
        }
      }
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});



app.get('/api/shorturl/:id', async (req, res) => {
  try {
    const key = req.params.id;
    const doc = await url_model.findOne({ short_url: key }).exec();
    if (doc) {
      res.redirect(doc.original_url);
    } else {
      res.json({ error: 'No short url found for the given input' });
    }
  } catch (e) {
    res.json({ error: 'An error occurred' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
