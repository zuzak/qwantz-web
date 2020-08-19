window.onload = () => {
    const form = document.getElementById('form')
    form.addEventListener('submit', (event) => {
        event.preventDefault()
       // window.history.back()
        generateNewComic(form)
        return false
    })

    const lede = document.getElementById('lede')

    const preview = document.createElement('div')
    preview.id = 'preview'
    preview.className = 'preview comic prompt'
    preview.innerHTML = ''
    lede.before(preview)

    const comicContainer = document.createElement('div')
    comicContainer.className = 'comic-container'
    comicContainer.id = 'comic-container'
    preview.before(comicContainer)

    const comic = document.createElement('div')
    comic.id = 'comic'
    comic.className = 'comic generated synthetic'
    comic.innerHTML = ''
    comicContainer.append(comic)

    const footer = document.createElement('footer')
    footer.innerHTML = ''
    comicContainer.append(footer)

    const textarea = document.getElementById('textarea')
    generateComic(preview, textarea.value)
    textarea.oninput = (event) => {
        generateComic(preview, event.target.value)
    }
}

const generateComic = (comic, transcript, prompt) => {
    const json = transcriptToJson(transcript, prompt)
    console.log(json)
    comic.innerHTML = jsonToHtml(json)
}

const markupLine = (line, prompt) => {
    if (line.trim().startsWith(prompt.trim())) {
        let promptWithoutSpeaker = prompt.split(': ')
        if (promptWithoutSpeaker.length == 1) return line
        promptWithoutSpeaker = promptWithoutSpeaker[promptWithoutSpeaker.length - 1]
        line = line.replace(promptWithoutSpeaker, promptWithoutSpeaker + '<|endofprompt|>')
    }
    return line
}

const normalizeTranscript = (transcript) => {
    const slugify = (str) => str.replace(/[!\"# $%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
    if (!transcript) return transcript
    const lines = transcript.split('\n')

    return lines.map((line) => {
        const splitLine = line.split(': ')
        if (splitLine.length === 1) {
            if (splitLine.length === 1) {
                if (line && line == line.toUpperCase()) {
                    return slugify('Narrator') + ': ' + line
                }
            }
        }
        if (splitLine[1]) return slugify(splitLine[0]) + ': ' + splitLine[1]
        return splitLine[1]
    }).join('\n')
}
const transcriptToJson = (transcript, prompt) => {
    const nTranscript = normalizeTranscript(transcript)
    const nPrompt = normalizeTranscript(prompt)
    const panels = nTranscript.split('\n\n')
    return parsedPanels = panels.map((panel) => {
        const lines = panel.split('\n')
        return lines.map((line) => {
            const ret = {}
            if (prompt) {
                line = markupLine(line, nPrompt)
            }
            if (line.startsWith('{{')) return null
            const x = line.split(': ')
            ret.speaker = x[0]
            ret.text = x.splice(1).join(': ');
            if (!ret) return null
            return ret
        })
    })
}

const jsonToHtml = (json) => {
    const comic = document.createElement('div')
    for (panel of json) {
        if (panel !== null) {
            const ePanel = document.createElement('div')
            ePanel.className = 'panel'
            for (line of panel) {
                if (line !== null) {
                    const eLine = document.createElement('div')
                    eLine.className = line.speaker
                    if (line.text.includes('<|endofprompt|>')) {
                        const mark = document.createElement('mark')
                        const splitLine = line.text.split('<|endofprompt|>')
                        mark.textContent = splitLine[0]
                        eLine.textContent = splitLine[1]
                        eLine.prepend(mark)
                    } else {
                        eLine.textContent = line.text
                    }
                    ePanel.appendChild(eLine)
                }
            }
            comic.appendChild(ePanel)
        }
    }
    return comic.innerHTML
}

const getComicNumber = () => {
    const key = 'comicCount'
    const oldNumber = window.localStorage.getItem(key)
    let newNumber = 1
    if (oldNumber) newNumber = parseInt(oldNumber) + 1
    window.localStorage.setItem(key, newNumber)
    return newNumber
}
const generateNewComic = (form) => {
    const comicId = getComicNumber()
    const button = document.getElementById('submit')
    button.disabled = true
    const comic = document.getElementById('comic')
    comic.innerHTML = '<p class="placeholder">Generating comic #' + comicId + '... (this often takes around ten seconds)</p>'
    const transcript = getTranscriptElement(form)
    const request = new XMLHttpRequest()
    request.open('POST', window.location.href)
    const formData = new FormData(form)
    console.log(formData.get('comic'), form)
    document.body.className = 'pending'
    try {
    gtag('event', 'generateComic', {comic: formData.get('comic')})
    } catch (e) {
      console.log('no ganalytics')
    }
    let oldData = undefined
    let timeout = 0
    request.onreadystatechange = () => {
        console.log("state change.. state: "+ request.readyState);
        if (request.readyState === 2) {
            comic.innerHTML = '<p class="placeholder">Comic almost ready...</p>'
        } else if  (request.readyState === 3) {
            let data = request.response
            data = data.split('<|startoftext|>', 2).join('')
            data = data.split('<|endoftext|>', 1)
            console.log(request.response)
            if (data.length > 1) {
                console.log("Aborting!")
                request.abort()
                console.log("state change.. state: "+ request.readyState);
            }
            data = data.join('')
            if (data !== oldData) {
                oldData = data
                timeout = 0
                transcript.textContent = data
                generateComic(comic, data, formData.get('comic'))
                document.documentElement.scrollTop = 0;
            } else {
                if (timeout++ > 3) request.abort()
            }
        } else if (request.readyState === 4 || request.readyState === 0) {
            document.body.className = ''
            button.disabled = false
        }
    }
    if (formData === undefined) throw new Error("och naw");
    request.send(formData)
}

const getTranscriptElement = (form) => {
    const existingTranscript = document.getElementById('transcript')

    if (existingTranscript) return existingTranscript

    const details = document.createElement('details')
    form.after(details)

    const summary = document.createElement('summary')
    summary.textContent = 'Transcript'
    details.append(summary)

    const transcript = document.createElement('p')
    transcript.id = 'transcript'
    transcript.className = 'transcript'
    summary.after(transcript)

    return transcript
}
