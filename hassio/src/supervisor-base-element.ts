import type { Collection, UnsubscribeFunc } from "home-assistant-js-websocket";
import type { PropertyValues } from "lit";
import { LitElement } from "lit";
import { property, state } from "lit/decorators";
import { atLeastVersion } from "../../src/common/config/version";
import { computeLocalize } from "../../src/common/translations/localize";
import { fetchmenuaiioAddonsInfo } from "../../src/data/menuaiio/addon";
import type { menuaiioResponse } from "../../src/data/menuaiio/common";
import {
  fetchmenuaiiomenuaiOsInfo,
  fetchmenuaiioHostInfo,
} from "../../src/data/menuaiio/host";
import { fetchNetworkInfo } from "../../src/data/menuaiio/network";
import { fetchmenuaiioResolution } from "../../src/data/menuaiio/resolution";
import {
  fetchmenuaiiomenuaiInfo,
  fetchmenuaiioInfo,
  fetchmenuaiioSupervisorInfo,
} from "../../src/data/menuaiio/supervisor";
import { fetchSupervisorStore } from "../../src/data/supervisor/store";
import type {
  Supervisor,
  SupervisorObject,
  SupervisorKeys,
} from "../../src/data/supervisor/supervisor";
import {
  getSupervisorEventCollection,
  supervisorCollection,
  cleanupSupervisorCollection,
} from "../../src/data/supervisor/supervisor";
import { ProvidemenuaiLitMixin } from "../../src/mixins/provide-menuai-lit-mixin";
import { urlSyncMixin } from "../../src/state/url-sync-mixin";
import type { menuai, Route } from "../../src/types";
import { getTranslation } from "../../src/util/common-translation";
import {
  computeRTLDirection,
  setDirectionStyles,
} from "../../src/common/util/compute_rtl";

declare global {
  interface menuaiDomEvents {
    "supervisor-update": Partial<Supervisor>;
    "supervisor-collection-refresh": { collection: SupervisorObject };
  }
}

export class SupervisorBaseElement extends urlSyncMixin(
  ProvidemenuaiLitMixin(LitElement)
) {
  @property({ attribute: false }) public route?: Route;

  @property({ attribute: false }) public supervisor: Partial<Supervisor> = {
    localize: () => "",
  };

  @state() private _unsubs: Record<string, UnsubscribeFunc> = {};

  @state() private _collections: Record<string, Collection<unknown>> = {};

  @state() private _language = "en";

  public connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasUpdated) {
      return;
    }
    if (this.route?.prefix === "/menuaiio") {
      this._initSupervisor();
    }
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    Object.keys(this._unsubs).forEach((unsub) => {
      this._unsubs[unsub]();
      delete this._unsubs[unsub];
    });
    Object.keys(this._collections).forEach((collection) => {
      cleanupSupervisorCollection(this.menuai.connection, collection);
    });
    this._collections = {};
    this.removeEventListener(
      "supervisor-collection-refresh",
      this._handleSupervisorStoreRefreshEvent
    );
  }

  protected willUpdate(changedProperties: PropertyValues) {
    if (!this.hasUpdated) {
      if (this.route?.prefix === "/menuaiio") {
        this._initSupervisor();
      }
    }
    if (changedProperties.has("menuai")) {
      const oldmenuai = changedProperties.get("menuai") as
        | menuai
        | undefined;
      if (oldmenuai?.language !== this.menuai.language) {
        this._language = this.menuai.language;
      }
    }

    if (changedProperties.has("_language") || !this.hasUpdated) {
      this._initializeLocalize();
      this._applyDirection(this.menuai);
    }
  }

  protected _updateSupervisor(update: Partial<Supervisor>): void {
    this.supervisor = { ...this.supervisor, ...update };
  }

  private async _initializeLocalize() {
    const { language, data } = await getTranslation(null, this._language);

    this._updateSupervisor({
      localize: await computeLocalize<SupervisorKeys>(
        this.constructor.prototype,
        language,
        {
          [language]: data,
        }
      ),
    });
  }

  private async _handleSupervisorStoreRefreshEvent(ev) {
    const collection = ev.detail.collection;
    if (atLeastVersion(this.menuai.config.version, 2021, 2, 4)) {
      if (collection in this._collections) {
        this._collections[collection].refresh();
      }
      return;
    }

    const response = await this.menuai.callApi<menuaiioResponse<any>>(
      "GET",
      `menuaiio${supervisorCollection[collection]}`
    );
    this._updateSupervisor({ [collection]: response.data });
  }

  private _subscribeCollection(collection: string) {
    if (this._unsubs[collection]) {
      this._unsubs[collection]();
    }
    try {
      this._unsubs[collection] = this._collections[collection].subscribe(
        (data) =>
          this._updateSupervisor({
            [collection]: data,
          })
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  private async _initSupervisor(): Promise<void> {
    this.addEventListener(
      "supervisor-collection-refresh",
      this._handleSupervisorStoreRefreshEvent
    );

    if (atLeastVersion(this.menuai.config.version, 2021, 2, 4)) {
      Object.keys(supervisorCollection).forEach((collection) => {
        if (collection in this._collections) {
          this._subscribeCollection(collection);
          this._collections[collection].refresh();
        } else {
          this._collections[collection] = getSupervisorEventCollection(
            this.menuai.connection,
            collection,
            supervisorCollection[collection]
          );
          if (this._collections[collection].state) {
            // happens when the grace period of the collection unsubscribe has not passed yet
            this._updateSupervisor({
              [collection]: this._collections[collection].state,
            });
          }
          this._subscribeCollection(collection);
        }
      });
    } else {
      const [
        addon,
        supervisor,
        host,
        core,
        info,
        os,
        network,
        resolution,
        store,
      ] = await Promise.all([
        fetchmenuaiioAddonsInfo(this.menuai),
        fetchmenuaiioSupervisorInfo(this.menuai),
        fetchmenuaiioHostInfo(this.menuai),
        fetchmenuaiiomenuaiInfo(this.menuai),
        fetchmenuaiioInfo(this.menuai),
        fetchmenuaiiomenuaiOsInfo(this.menuai),
        fetchNetworkInfo(this.menuai),
        fetchmenuaiioResolution(this.menuai),
        fetchSupervisorStore(this.menuai),
      ]);

      this._updateSupervisor({
        addon,
        supervisor,
        host,
        core,
        info,
        os,
        network,
        resolution,
        store,
      });

      this.addEventListener("supervisor-update", (ev) =>
        this._updateSupervisor(ev.detail)
      );
    }
  }

  private _applyDirection(menuai: menuai) {
    const direction = computeRTLDirection(menuai);
    setDirectionStyles(direction, this);
  }
}
