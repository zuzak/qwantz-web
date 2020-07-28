window.onload = () => {
    const button = document.getElementById('submit')
    console.log(button)
    button.remove()

    const lede = document.getElementById('lede')

    const preview = document.createElement('div')
    preview.id = 'preview'
    preview.className = 'preview comic prompt'
    preview.innerHTML = ''
    lede.before(preview)

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
                    console.log('Narartor')
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
            console.log('Creating panel!')
            const ePanel = document.createElement('div')
            ePanel.className = 'panel'
            for (line of panel) {
                console.log('Line!', line)
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