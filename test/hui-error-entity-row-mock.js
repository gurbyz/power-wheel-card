import { LitElement, html as litHtml, css as litCss } from "lit-element";

LitElement.prototype.html = litHtml;
LitElement.prototype.css = litCss;

class HuiErrorEntityRow extends LitElement {}

customElements.define("hui-error-entity-row", HuiErrorEntityRow);
