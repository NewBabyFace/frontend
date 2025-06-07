import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-camera-stream";
import type { ImageEntity } from "../../../data/image";
import { computeImageUrl } from "../../../data/image";
import type { menuai } from "../../../types";

@customElement("more-info-image")
class MoreInfoImage extends LitElement {
  @property({ attribute: false }) public menuai?: menuai;

  @property({ attribute: false }) public stateObj?: ImageEntity;

  protected render() {
    if (!this.menuai || !this.stateObj) {
      return nothing;
    }
    return html`<img
      alt=${this.stateObj.attributes.friendly_name || this.stateObj.entity_id}
      src=${this.menuai.menuaiUrl(computeImageUrl(this.stateObj))}
    /> `;
  }

  static styles = css`
    :host {
      display: block;
      text-align: center;
    }
    img {
      max-width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-image": MoreInfoImage;
  }
}
