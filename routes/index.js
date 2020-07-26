var express = require('express');
const randomFile = require('random-file');

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
  const comic = fs.readFileSync(path.join(dir, fileName), 'utf8')
  const panels = comic.split('\n\n')
  const parsedPanels = panels.map((panel) => {                                 
    const lines = panel.split('\n')                                            
    return lines.map((line) => {                                               
      const x = line.split(': ', 2)    
      const speaker = slug(x[0])                                      
      return {speaker, text: x[1]}         
    })                                                                         
  }) 
  //res.json(comic)     
  res.render('comic', {comic: parsedPanels, original: comic, fileName})
})

module.exports = router;
