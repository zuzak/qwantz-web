var express = require('express');
var router = express.Router();
const {spawn} = require('child_process')
const rateLimit = require('express-rate-limit')

router.get('/', function (req, res, next) {
  res.redirect('generate')
})
router.get('/generate', function (req, res, next) {
  res.render('generate', {title: "GPT"})
})
const bodyParser = require('body-parser').text()
router.post('/generate', bodyParser, rateLimit({
  windowMs: 1000 * 60,
  max: 10,
  message: 'Rate limited -- try again later'
}), function (req, res, next) {
  const prefix = '<|startoftext|>' + req.body.comic
  const args = ['-m', '117M', 'g', '-l', '500', prefix]
  res.type('text')
  const cmd = spawn(
    './gpt2tc',
    args,
    {cwd: 'gpt', shell: false}
  )

  cmd.stdout.on('data', (data) => res.write(data))
  cmd.stderr.on('data', (data) => res.write(data))
  cmd.on('close', (code) => res.end())
})

module.exports = router;
