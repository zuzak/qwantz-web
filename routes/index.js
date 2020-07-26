var express = require('express');

const fs = require('fs')
const path = require('path')

const slug = require('slug')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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
  const parsedPanels = panels.map((panel) => {
    const lines = panel.split('\n')
    return lines.map((line) => {
      if (line.startsWith('{{')) return null
      const x = line.split(': ')
      if (x.length === 1) {
        if (line && line == line.toUpperCase()) {
          return {speaker: slug('Narrator'), text: line}
        } else {
          return null
        }
      }
      const speaker = slug(x[0])
      const speech = x.splice(1).join(': ');
      if (!speech) return null
      return {speaker, text: speech}
    })
  })
  //res.json(comic)
  res.render('comic', {
    comic: parsedPanels,
    original: comic,
    fileName,
    synthetic,
    title: 'Dinosaur Comics',
    pretty: ' '
  })
})

module.exports = router;
