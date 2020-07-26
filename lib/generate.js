const slug = require('slug')
module.exports = (comic) => {
    const panels = comic.split('\n\n')
    return parsedPanels = panels.map((panel) => {
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
}