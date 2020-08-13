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

const generateComic = (comic, transcript) => {
    const json = transcriptToJson(transcript)
    comic.innerHTML = jsonToHtml(json)
}

const transcriptToJson = (transcript) => {
    const slugify = (str) => str.replace(/[!\"# $%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
    const panels = transcript.split('\n\n')
    return parsedPanels = panels.map((panel) => {
        const lines = panel.split('\n')
        return lines.map((line) => {
            if (line.startsWith('{{')) return null
            const x = line.split(': ')
            if (x.length === 1) {
                if (line && line == line.toUpperCase()) {
                    return {speaker: slugify('Narrator'), text: line}
                } else {
                    return null
                }
            }
            const speaker = slugify(x[0])
            const speech = x.splice(1).join(': ');
            if (!speech) return null
            return {speaker, text: speech}
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
                    eLine.textContent = line.text
                    ePanel.appendChild(eLine)
                }
            }
            comic.appendChild(ePanel)
        }
    }
    return comic.innerHTML
}

const generateNewComic = (form) => {
    const button = document.getElementById('submit')
    button.disabled = true
    const comic = document.getElementById('comic')
    comic.innerHTML = '<p class="placeholder">Generating a comic... (this will at least ten seconds -- use Firefox if you want it quicker)</p>'
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
            comic.innerHTML = '<p class="placeholder">Generating comic... (This might take over ten seconds)</p>'
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
                generateComic(comic, data)
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
