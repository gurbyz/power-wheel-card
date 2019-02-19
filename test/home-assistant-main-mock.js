import { LitElement, html as litHtml, css as litCss } from "lit-element";

LitElement.prototype.html = litHtml;
LitElement.prototype.css = litCss;

class HomeAssistantMain extends LitElement {}

customElements.define("home-assistant-main", HomeAssistantMain);
