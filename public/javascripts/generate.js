window.onload = () => {
    const form = document.getElementById('form')
    form.addEventListener('submit', (event) => {
        event.preventDefault()
       // window.history.back()
        generateNewComic(event.target)
        return false
    })

    const lede = document.getElementById('lede')

    const preview = document.createElement('div')
    preview.id = 'preview'
    preview.className = 'preview comic prompt'
    preview.innerHTML = ''
    lede.before(preview)

    const comic = document.createElement('div')
    comic.id = 'comic'
    comic.className = 'comic'
    comic.innerHTML = ''
    form.after(comic)

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
    const slugify = (str) => str.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '-').toLowerCase();
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
    const transcript = getTranscriptElement(form)
    const request = new XMLHttpRequest()
    request.open('POST', window.location.href)
    const formData = new FormData(form)
    request.onreadystatechange = () => {
        console.log("state change.. state: "+ request.readyState);
        if (request.readyState === 3) {
            generateComic(comic,request.response)
            transcript.textContent = request.response
            comic.scrollIntoView(false, {smooth: true, block: 'end'})
        } else if (request.readyState === 4) {
            button.disabled = false
        }
    }
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