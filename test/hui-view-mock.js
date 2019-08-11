import { LitElement, html as litHtml, css as litCss } from "lit-element";

LitElement.prototype.html = litHtml;
LitElement.prototype.css = litCss;

class HuiView extends LitElement {}

customElements.define("hui-view", HuiView);
