import type { PropertyValues } from "lit";
import type { menuaiDomEvent } from "../common/dom/fire_event";
import type { HapticType } from "../data/haptics";
import type { Constructor, menuai } from "../types";
import { storeState } from "../util/ha-pref-storage";
import type { menuaiBaseEl } from "./menuai-base-mixin";

interface VibrateParams {
  vibrate: menuai["vibrate"];
}

declare global {
  // for fire event
  interface menuaiDomEvents {
    "menuai-vibrate": VibrateParams;
  }
  // for add event listener
  interface HTMLElementEventMap {
    "menuai-vibrate": menuaiDomEvent<VibrateParams>;
  }
}

const hapticPatterns = {
  success: [50, 50, 50],
  warning: [100, 50, 100],
  failure: [200, 100, 200],
  light: [50],
  medium: [100],
  heavy: [200],
  selection: [20],
};

const handleHaptic = (hapticTypeEvent: menuaiDomEvent<HapticType>) => {
  navigator.vibrate(hapticPatterns[hapticTypeEvent.detail]);
};

export const hapticMixin = <T extends Constructor<menuaiBaseEl>>(superClass: T) =>
  class extends superClass {
    protected firstUpdated(changedProps: PropertyValues) {
      super.firstUpdated(changedProps);
      this.addEventListener("menuai-vibrate", (ev) => {
        const vibrate = ev.detail.vibrate;
        // @ts-expect-error not all browsers support vibrate
        if (navigator.vibrate && vibrate) {
          window.addEventListener("haptic", handleHaptic);
        } else {
          window.removeEventListener("haptic", handleHaptic);
        }
        this._updatemenuai({ vibrate });
        storeState(this.menuai!);
      });
    }

    protected menuaiConnected() {
      super.menuaiConnected();
      // @ts-expect-error not all browsers support vibrate
      if (navigator.vibrate && this.menuai!.vibrate) {
        window.addEventListener("haptic", handleHaptic);
      }
    }
  };
