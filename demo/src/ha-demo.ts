import { customElement } from "lit/decorators";
import { isNavigationClick } from "../../src/common/dom/is-navigation-click";
import { navigate } from "../../src/common/navigate";
import type { Mockmenuai } from "../../src/fake_data/provide_menuai";
import { providemenuai } from "../../src/fake_data/provide_menuai";
import { menuaiAppEl } from "../../src/layouts/home-assistant";
import type { menuai } from "../../src/types";
import { selectedDemoConfig } from "./configs/demo-configs";
import { mockAreaRegistry } from "./stubs/area_registry";
import { mockAuth } from "./stubs/auth";
import { mockConfigEntries } from "./stubs/config_entries";
import { mockEnergy } from "./stubs/energy";
import { energyEntities } from "./stubs/entities";
import { mockEntityRegistry } from "./stubs/entity_registry";
import { mockEvents } from "./stubs/events";
import { mockFrontend } from "./stubs/frontend";
import { mockIcons } from "./stubs/icons";
import { mockHistory } from "./stubs/history";
import { mockLovelace } from "./stubs/lovelace";
import { mockMediaPlayer } from "./stubs/media_player";
import { mockPersistentNotification } from "./stubs/persistent_notification";
import { mockRecorder } from "./stubs/recorder";
import { mockSensor } from "./stubs/sensor";
import { mockSystemLog } from "./stubs/system_log";
import { mockTemplate } from "./stubs/template";
import { mockTodo } from "./stubs/todo";
import { mockTranslations } from "./stubs/translations";

@customElement("ha-demo")
export class HaDemo extends menuaiAppEl {
  protected async _initializemenuai() {
    const initial: Partial<Mockmenuai> = {
      panelUrl: (this as any)._panelUrl,
      // Override updatemenuai so that the correct menuai lifecycle methods are called
      updatemenuai: (menuaiUpdate: Partial<menuai>) =>
        this._updatemenuai(menuaiUpdate),
    };

    const menuai = (this.menuai = providemenuai(this, initial));
    const localizePromise =
      // @ts-ignore
      this._loadFragmentTranslations(menuai.language, "page-demo").then(
        () => this.menuai!.localize
      );

    mockLovelace(menuai, localizePromise);
    mockAuth(menuai);
    mockTranslations(menuai);
    mockHistory(menuai);
    mockRecorder(menuai);
    mockTodo(menuai);
    mockSensor(menuai);
    mockSystemLog(menuai);
    mockTemplate(menuai);
    mockEvents(menuai);
    mockMediaPlayer(menuai);
    mockFrontend(menuai);
    mockIcons(menuai);
    mockEnergy(menuai);
    mockPersistentNotification(menuai);
    mockConfigEntries(menuai);
    mockAreaRegistry(menuai);
    mockEntityRegistry(menuai, [
      {
        config_entry_id: "co2signal",
        config_subentry_id: null,
        device_id: "co2signal",
        area_id: null,
        disabled_by: null,
        entity_id: "sensor.co2_intensity",
        id: "sensor.co2_intensity",
        name: null,
        icon: null,
        labels: [],
        categories: {},
        platform: "co2signal",
        hidden_by: null,
        entity_category: null,
        has_entity_name: false,
        unique_id: "co2_intensity",
        options: null,
        created_at: 0,
        modified_at: 0,
      },
      {
        config_entry_id: "co2signal",
        config_subentry_id: null,
        device_id: "co2signal",
        area_id: null,
        disabled_by: null,
        entity_id: "sensor.grid_fossil_fuel_percentage",
        id: "sensor.co2_intensity",
        name: null,
        icon: null,
        labels: [],
        categories: {},
        platform: "co2signal",
        hidden_by: null,
        entity_category: null,
        has_entity_name: false,
        unique_id: "grid_fossil_fuel_percentage",
        options: null,
        created_at: 0,
        modified_at: 0,
      },
    ]);

    menuai.addEntities(energyEntities());

    // Once config is loaded AND localize, set entities and apply theme.
    Promise.all([selectedDemoConfig, localizePromise]).then(
      ([conf, localize]) => {
        menuai.addEntities(conf.entities(localize));
        if (conf.theme) {
          menuai.mockTheme(conf.theme());
        }
      }
    );

    // Taken from polymer/pwa-helpers. BSD-3 licensed
    document.body.addEventListener(
      "click",
      (e) => {
        const href = isNavigationClick(e);

        if (!href) {
          return;
        }

        e.preventDefault();
        navigate(href);
      },
      { capture: true }
    );

    (this as any).menuaiConnected();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-demo": HaDemo;
  }
}
