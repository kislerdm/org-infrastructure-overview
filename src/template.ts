// @ts-ignore
import logoGithub from "./svg/github.svg";
// @ts-ignore
import logoLinkedin from "./svg/linkedin.svg";
// @ts-ignore
import logoEmail from "./svg/email.svg";
// @ts-ignore
import infoSign from "./svg/info-sign.svg";

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
    return `<header>Organisational Infrastructure's Diagrams<sup></header>`
}

export default function SetTemplatedComponents(baseHTML: string): string {
    return `${Header()}${baseHTML}${Footer()}`
}

export function addInfoPopUp(mountPoint: HTMLDivElement): void {
    const infoIconWidth: number = 20;

    const header = mountPoint.getElementsByTagName("header")[0]!;

    header.innerHTML += `<sup><img id="info-icon" src="${infoSign}" alt="info" 
width=${infoIconWidth} height=${infoIconWidth} ></sup>
<div class="modal">
    <div class="modal-content"><span class="close">&times;</span>
        <p id="info">foobar<br>qux</p>
    </div>
</div>`

    const modal = mountPoint.querySelector<HTMLElement>(".modal")!;

    for (const el of mountPoint.getElementsByTagName("img")) {
        if (el.id === "info-icon") {
            el.addEventListener("click", () => {
                modal.style.display = "block";
            })
        }
    }

    const closeBtn = mountPoint.querySelector<HTMLElement>(".close")!;
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    })

    modal.addEventListener("click", (e) => {
        // @ts-ignore
        if (e.target.className === "modal") {
            modal.style.display = "none";
        }
    })
}
