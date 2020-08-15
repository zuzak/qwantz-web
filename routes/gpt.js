var express = require('express');
const debug = require('debug')('qwantz-web:gpt')
var router = express.Router();
const {spawn} = require('child_process')
const rateLimit = require('express-rate-limit');
const multer = require('multer')
const upload = multer()

router.get('/', function (req, res, next) {
  res.redirect('generate')
})
router.get('/generate', function (req, res, next) {
  res.render('generate', {title: "GPT"})
})

router.post('/generate', rateLimit({
  windowMs: 1000 * 60,
  max: 10,
  message: 'Rate limited -- try again later'
}), upload.none(), function (req, res, next) {
  let prompt = req.body.comic ? req.body.comic : ''
  const prefix = '<|startoftext|>\n' + prompt
  const delimiter = [ '<', '|', 'end', 'of', 'text', '|', '>' ]

  let kValue = parseInt(req.body.topk)

  if (!Number.isInteger(kValue)) kValue = 40

  const modelToUse = '117M'
  debug(JSON.stringify(req.body))
  const args = ['-m', modelToUse, '-l', '500', '-k',  '' + kValue, 'g', prefix]
  res.type('text')
  const gptStream = spawn(
    './gpt2tc',
    args,
    {cwd: 'gpt', shell: false}
  )

  let i = 0
  gptStream.stdout.on('data', (data) => {
    res.write(data)
    if (data.includes(delimiter[i])) {
      i++
      if (i == delimiter.length) {
        debug('Killing stream early')
        gptStream.kill(15)
      }
    } else {
      i = 0
    }
  })
  gptStream.stderr.on('data', (data) => res.write(data))
  gptStream.on('close', (code) => res.end())
  req.on('close', (err) => {
    debug('Closing connection')
    gptStream.kill(15)
  })
})

module.exports = router;
