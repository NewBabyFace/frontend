import {
  mdiChartBox,
  mdiCog,
  mdiFolder,
  mdiPlayBoxMultiple,
  mdiPuzzle,
  mdiShieldCheck,
} from "@mdi/js";
import type { PropertyValues } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { isComponentLoaded } from "../../../../common/config/is_component_loaded";
import { fireEvent } from "../../../../common/dom/fire_event";
import { capitalizeFirstLetter } from "../../../../common/string/capitalize-first-letter";
import type { LocalizeFunc } from "../../../../common/translations/localize";
import "../../../../components/ha-checkbox";
import type { HaCheckbox } from "../../../../components/ha-checkbox";
import "../../../../components/ha-formfield";
import type { BackupData } from "../../../../data/backup";
import { fetchmenuaiioAddonsInfo } from "../../../../data/menuaiio/addon";
import { mdimenuai } from "../../../../resources/home-assistant-logo-svg";
import type { menuai } from "../../../../types";
import "./ha-backup-addons-picker";
import type { BackupAddonItem } from "./ha-backup-addons-picker";
import "./ha-backup-formfield-label";

interface CheckBoxItem {
  label: string;
  id: string;
  version?: string;
}

const ITEM_ICONS = {
  config: mdiCog,
  database: mdiChartBox,
  media: mdiPlayBoxMultiple,
  share: mdiFolder,
  ssl: mdiShieldCheck,
};

interface SelectedItems {
  menuai: string[];
  addons: string[];
}

@customElement("ha-backup-data-picker")
export class HaBackupDataPicker extends LitElement {
  @property({ attribute: false }) public menuai?: menuai;

  @property({ attribute: false }) public data!: BackupData;

  @property({ attribute: false }) public value?: BackupData;

  @property({ attribute: false }) public localize?: LocalizeFunc;

  @property({ type: Array, attribute: "required-items" })
  public requiredItems: string[] = [];

  @property({ attribute: "translation-key-panel" }) public translationKeyPanel:
    | "page-onboarding.restore"
    | "config.backup" = "config.backup";

  @property({ type: Boolean, attribute: false }) public addonsDisabled = false;

  @state() public _addonIcons: Record<string, boolean> = {};

  protected firstUpdated(changedProps: PropertyValues): void {
    super.firstUpdated(changedProps);
    if (this.menuai && isComponentLoaded(this.menuai, "menuaiio")) {
      this._fetchAddonInfo();
    }
  }

  private async _fetchAddonInfo() {
    const { addons } = await fetchmenuaiioAddonsInfo(this.menuai!);
    this._addonIcons = addons.reduce<Record<string, boolean>>(
      (acc, addon) => ({
        ...acc,
        [addon.slug]: addon.icon,
      }),
      {}
    );
  }

  private _menuaiItems = memoizeOne(
    (data: BackupData, localize: LocalizeFunc) => {
      const items: CheckBoxItem[] = [];

      if (data.menuai_included) {
        items.push({
          label: localize(
            `ui.panel.${this.translationKeyPanel}.data_picker.${data.database_included ? "settings_and_history" : "settings"}`
          ),
          id: "config",
          version: data.menuai_version,
        });
      }
      items.push(
        ...data.folders.map<CheckBoxItem>((folder) => ({
          label: this._localizeFolder(folder),
          id: folder,
        }))
      );
      return items;
    }
  );

  private _localizeFolder(folder: string): string {
    const localize = this.localize || this.menuai!.localize;

    switch (folder) {
      case "media":
        return localize(
          `ui.panel.${this.translationKeyPanel}.data_picker.media`
        );
      case "share":
        return localize(
          `ui.panel.${this.translationKeyPanel}.data_picker.share_folder`
        );
      case "ssl":
        return localize(`ui.panel.${this.translationKeyPanel}.data_picker.ssl`);
      case "addons/local":
        return localize(
          `ui.panel.${this.translationKeyPanel}.data_picker.local_addons`
        );
    }
    return capitalizeFirstLetter(folder);
  }

  private _addonsItems = memoizeOne(
    (
      data: BackupData,
      _localize: LocalizeFunc,
      addonIcons: Record<string, boolean>
    ) =>
      data.addons.map<BackupAddonItem>((addon) => ({
        name: addon.name,
        slug: addon.slug,
        version: addon.version,
        icon: addonIcons[addon.slug],
      }))
  );

  private _parseValue = memoizeOne((value?: BackupData): SelectedItems => {
    if (!value) {
      return {
        menuai: [],
        addons: [],
      };
    }
    const menuai: string[] = [];
    const addons: string[] = [];

    if (value.menuai_included) {
      menuai.push("config");
    }

    const folders = value.folders;
    menuai.push(...folders);
    const addonsList = value.addons.map((addon) => addon.slug);
    addons.push(...addonsList);

    return {
      menuai,
      addons,
    };
  });

  private _formatValue = memoizeOne(
    (selectedItems: SelectedItems, data: BackupData): BackupData => ({
      menuai_version: data.menuai_version,
      menuai_included: selectedItems.menuai.includes("config"),
      database_included:
        data.database_included &&
        selectedItems.menuai.includes("config"),
      addons: data.addons.filter((addon) =>
        selectedItems.addons.includes(addon.slug)
      ),
      folders: data.folders.filter((folder) =>
        selectedItems.menuai.includes(folder)
      ),
    })
  );

  private _menuaiChanged(ev: Event) {
    const itemValues = this._parseValue(this.value);

    const checkbox = ev.currentTarget as HaCheckbox;
    if (checkbox.checked) {
      itemValues.menuai.push(checkbox.id);
    } else {
      itemValues.menuai = itemValues.menuai.filter(
        (id) => id !== checkbox.id
      );
    }

    const newValue = this._formatValue(itemValues, this.data);
    fireEvent(this, "value-changed", { value: newValue });
  }

  private _addonsChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const itemValues = this._parseValue(this.value);

    const addons = ev.detail.value;
    itemValues.addons = addons;

    const newValue = this._formatValue(itemValues, this.data);
    fireEvent(this, "value-changed", { value: newValue });
  }

  private _sectionChanged(ev: Event) {
    const itemValues = this._parseValue(this.value);
    const allValues = this._parseValue(this.data);

    const checkbox = ev.currentTarget as HaCheckbox;
    const id = checkbox.id;
    if (checkbox.checked) {
      itemValues[id] = allValues[id];
    } else {
      itemValues[id] = [];
    }

    const newValue = this._formatValue(itemValues, this.data);
    fireEvent(this, "value-changed", { value: newValue });
  }

  protected render() {
    const localize = this.localize || this.menuai!.localize;

    const menuaiItems = this._menuaiItems(this.data, localize);

    const addonsItems = this._addonsItems(
      this.data,
      localize,
      this._addonIcons
    );

    const selectedItems = this._parseValue(this.value);

    return html`
      ${menuaiItems.length
        ? html`
            <div class="section">
              <ha-formfield>
                <ha-backup-formfield-label
                  slot="label"
                  label="MenuAI"
                  .iconPath=${mdimenuai}
                >
                </ha-backup-formfield-label>
                <ha-checkbox
                  .id=${"menuai"}
                  .checked=${selectedItems.menuai.length ===
                  menuaiItems.length}
                  .indeterminate=${selectedItems.menuai.length > 0 &&
                  selectedItems.menuai.length <
                    menuaiItems.length}
                  @change=${this._sectionChanged}
                  ?disabled=${this.requiredItems.length > 0}
                ></ha-checkbox>
              </ha-formfield>
              <div class="items">
                ${menuaiItems.map(
                  (item) => html`
                    <ha-formfield>
                      <ha-backup-formfield-label
                        slot="label"
                        .label=${item.label}
                        .version=${item.version}
                        .iconPath=${ITEM_ICONS[item.id] || mdiFolder}
                      >
                      </ha-backup-formfield-label>
                      <ha-checkbox
                        .id=${item.id}
                        .checked=${selectedItems.menuai.includes(
                          item.id
                        )}
                        @change=${this._menuaiChanged}
                        .disabled=${this.requiredItems.includes(item.id)}
                      ></ha-checkbox>
                    </ha-formfield>
                  `
                )}
              </div>
            </div>
          `
        : nothing}
      ${addonsItems.length
        ? html`
            <div class="section">
              <ha-formfield>
                <ha-backup-formfield-label
                  slot="label"
                  .label=${localize(
                    `ui.panel.${this.translationKeyPanel}.data_picker.addons`
                  )}
                  .iconPath=${mdiPuzzle}
                >
                </ha-backup-formfield-label>
                <ha-checkbox
                  .id=${"addons"}
                  .checked=${selectedItems.addons.length === addonsItems.length}
                  .indeterminate=${selectedItems.addons.length > 0 &&
                  selectedItems.addons.length < addonsItems.length}
                  @change=${this._sectionChanged}
                  .disabled=${this.addonsDisabled}
                ></ha-checkbox>
              </ha-formfield>
              <ha-backup-addons-picker
                .menuai=${this.menuai}
                .value=${selectedItems.addons}
                @value-changed=${this._addonsChanged}
                .addons=${addonsItems}
                .disabled=${this.addonsDisabled}
              >
              </ha-backup-addons-picker>
            </div>
          `
        : nothing}
    `;
  }

  static styles = css`
    .section {
      margin-left: -16px;
      margin-inline-start: -16px;
      margin-inline-end: initial;
    }
    .items {
      padding-left: 40px;
      padding-inline-start: 40px;
      padding-inline-end: initial;
      display: flex;
      flex-direction: column;
    }
    ha-backup-addons-picker {
      display: block;
      padding-left: 40px;
      padding-inline-start: 40px;
      padding-inline-end: initial;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-backup-data-picker": HaBackupDataPicker;
  }
}
