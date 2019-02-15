import { LitElement, css as litCss } from "lit-element";

LitElement.prototype.css = litCss;

class HuiErrorEntityRow extends LitElement {}

customElements.define("hui-error-entity-row", HuiErrorEntityRow);
