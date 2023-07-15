function Footer(): string {
    return `<footer><a href="https://www.dkisler.com" target="_blank">dkisler.com</a> © ${new Date().getFullYear()}</footer>`
}

function Header(): string {
    return `<header>Organisational Infrastructure Diagrams</header>`
}

export default function SetTemplatedComponents(baseHTML: string): string {
    return `${Header()}${baseHTML}${Footer()}`
}
