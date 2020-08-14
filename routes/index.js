var express = require('express');

const fs = require('fs')
const path = require('path')

const generate = require('../lib/generate')

const slug = require('slug')
const rateLimit = require('express-rate-limit')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (process.env.NODE_ENV === 'production') return res.redirect('/comic/random')
  res.render('index', { title: 'Express' });
});

router.get('/comic', function (req, res, next) {
  res.redirect('/comic/random')
})

router.get('/privacy', function (req, res, next) {
  res.render('policies', { title: 'Policies' })
})



router.get(['/generate', '/comic/generate'], function (req, res, next) {
  res.redirect('/gpt/generate')
  //res.render('generate')
})
const bodyParser = require('body-parser').text()
router.post('/generate', bodyParser, function (req, res, next) {

  const comic = req.body.comic.replace(/\r/g, '')
  const buffer = new Buffer(comic)
  const base64 = buffer.toString('base64')
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  res.redirect(`/generate/${base64}`)
})
router.get('/generate/:base64', function (req, res, next) {
  const buffer = new Buffer(
    req.params.base64
      .replace(/\-/g, "+")
      .replace(/_/g, "/")
    , 'base64')
  const comic = buffer.toString('ascii')
  res.render('comic', {
    comic: generate(buffer.toString('ascii')),
    original: buffer.toString('ascii'),
    title: 'Generated Output',
    pretty: ' '
  })
})

router.get('/comic/random', rateLimit({
  windowMs: 1000 * 5,
  max: 10,
  message: 'You’re refreshing too fast! Slow down!'
}), (req, res, next) => next())

router.get(['/comic/:index', '/comic/:index/:prefix'], function (req, res, next) {
  const dir = 'comics'
  let fileName = req.params.index
  if (req.params.index == 'random') {
    let files = fs.readdirSync(dir)
    if (req.params.prefix) files = files.filter((x) => x.indexOf(req.params.prefix) != -1)
    if (req.params.index == 'generate') return next()
    fileName =  files[Math.floor(Math.random() * files.length)]
  }
  const synthetic = fileName.includes('gpt')
  const prompted = fileName.includes('gpt2')
  const comic = fs.readFileSync(path.join(dir, fileName), 'utf8')
  const panels = comic.split('\n\n')
  let bodyClass = ''
  if (synthetic) bodyClass += ' synthetic'
  if (prompted) bodyClass += ' prompted'
  res.render('comic', {
    comic: generate(comic),
    original: comic,
    fileName,
    bodyClass: bodyClass.trim(),
    title: 'GPT Dinosaur Comics',
    pretty: ' '
  })
})

module.exports = router;
