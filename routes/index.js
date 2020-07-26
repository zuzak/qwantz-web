var express = require('express');

const fs = require('fs')
const path = require('path')

const generate = require('../lib/generate')

const slug = require('slug')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (process.env.NODE_ENV === 'production') return res.redirect('/comic/random')
  res.render('index', { title: 'Express' });
});

router.get('/comic', function (req, res, next) {
  res.redirect('/comic/random')
})

router.get('/comic/:index', function (req, res, next) {
  const dir = 'comics'
  let fileName = req.params.index
  if (req.params.index == 'random') {
    const files = fs.readdirSync(dir)
    fileName =  files[Math.floor(Math.random() * files.length)]
  }
  const synthetic = fileName.includes('gpt')
  const comic = fs.readFileSync(path.join(dir, fileName), 'utf8')
  const panels = comic.split('\n\n')
  res.render('comic', {
    comic: generate(comic),
    original: comic,
    fileName,
    synthetic,
    title: 'Dinosaur Comics',
    pretty: ' '
  })
})

module.exports = router;
