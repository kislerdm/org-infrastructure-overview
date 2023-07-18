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

const githubLink: string = "https://github.com/kislerdm/org-infrastructure-overview/";

function Footer(): string {
    const copyrightStr =
        `<p style="font-size:16px"><a href="https://www.dkisler.com" target="_blank">dkisler.com</a> © ${
            new Date().getFullYear().toString()}</p>`;

    const iconSquareSize: number = 20;

    const socialContact = `<p id="contacts" style="margin-top:-10px">
    <a href="${githubLink}" target="_blank" rel="noopener">
        <img class="contact-icon" src="${logoGithub}" width="${iconSquareSize}" height="${iconSquareSize}" alt="github">
    </a>
    <a href="https://www.linkedin.com/in/dkisler" target="_blank" rel="noopener">
        <img class="contact-icon" src="${logoLinkedin}" width="${iconSquareSize}" height="${iconSquareSize}" alt="linkedin">
    </a>
    ${MailToLinkStr(`<img class="contact-icon" src="${logoEmail}" width="${iconSquareSize}" height="${iconSquareSize}" alt="email">`)}
</p>`

    return `<footer>${copyrightStr}${socialContact}</footer>`
}

function infoPopup(): string {
    const infoIconWidth: number = 20;
    return `<sup><img id="info-icon" src="${infoSign}" alt="info" width="${infoIconWidth}" height="${infoIconWidth}"></sup>
<div class="modal">
    <div class="modal-content"><span class="close">×</span>
        <h3 style="text-align:center;margin-top:-10px">About</h3>
        <p class="info">
            The webapp demonstrates capabilities of 
            <a href="${githubLink}" target="_blank"><em><strong>org-infrastructure-overview</strong></em></a>.
        </p>
        
        <p class="info">
            The tool provides a comprehensive overview of the organisation's infrastructure to help tech 
            and product experts, and business executives to maintain up-to-date understanding of interactions 
            between sub-organisations (departments, teams), systems and sub-systems (applications).
        </p>
            
        <p class="info">
            The <strong>motivation</strong> is to enable business to accept 
            <a href="https://martinfowler.com/bliki/ConwaysLaw.html" target="_blank"><em>Conway's law</em></a> 
            and employ Inverse Conway Maneuver.
        </p>
        
        <h3 style="text-align:center;margin-top:-10px">How it works</h3>
        <ul class="info">
            <li>Select the org infrastructure's node in the <em>left panel</em></li>
            <li>Analyse the diagram in the <em>right panel</em></li>
        </ul>
        
        <h3 style="text-align:center;margin-top:-10px">How to implement the tool</h3>
        <p class="info" style="text-align:center">
            ${MailToLinkStr("<em><strong>Get in touch</strong></em>")} and follow the 
            <a href="https://github.com/kislerdm/org-infrastructure-overview/#how-to-run" target="_blank"><em><strong>instructions</strong></em></a>.
        </p>
        
    </div>
</div>`
}

function Header(): string {
    return `<header><div class="header">Organisational Infrastructure's Diagrams${infoPopup()}</div></header>`
}

export default function SetTemplatedComponents(baseHTML: string): string {
    return `${Header()}${baseHTML}${Footer()}`
}

export function addInfoPopUp(mountPoint: HTMLDivElement): void {
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
