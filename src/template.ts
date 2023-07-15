// @ts-ignore
import logoGithub from "./svg/github.svg";
// @ts-ignore
import logoLinkedin from "./svg/linkedin.svg";
// @ts-ignore
import logoEmail from "./svg/email.svg";

function MailToLinkStr(innerHTML: string = ""): string {
    return `<a href="mailto:admin@dkisler.com" target="_blank" rel="noopener">${innerHTML}</a>`;
}

function Footer(): string {
    const copyrightStr =
        `<p style="font-size:16px"><a href="https://www.dkisler.com" target="_blank">dkisler.com</a> © ${
            new Date().getFullYear().toString()}</p>`;

    const iconSquareSize: number = 20;

    const socialContact = `<p id="contacts" style="margin-top:-10px">
    <a href="https://github.com/kislerdm/dynamic-diagrams" target="_blank" rel="noopener">
        <img class="contact-icon" src="${logoGithub}" width="${iconSquareSize}" height="${iconSquareSize}" alt="github">
    </a>
    <a href="https://www.linkedin.com/in/dkisler" target="_blank" rel="noopener">
        <img class="contact-icon" src="${logoLinkedin}" width="${iconSquareSize}" height="${iconSquareSize}" alt="linkedin">
    </a>
    ${MailToLinkStr(`<img class="contact-icon" src="${logoEmail}" width="${iconSquareSize}" height="${iconSquareSize}" alt="email">`)}
</p>`

    return `<footer>${copyrightStr}${socialContact}</footer>`
}

function Header(): string {
    return `<header>Organisational Infrastructure's Diagrams</header>`
}

export default function SetTemplatedComponents(baseHTML: string): string {
    return `${Header()}${baseHTML}${Footer()}`
}
