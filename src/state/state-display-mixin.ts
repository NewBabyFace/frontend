import { isComponentLoaded } from "../common/config/is_component_loaded";
import { computeFormatFunctions } from "../common/translations/entity-state";
import { getSensorNumericDeviceClasses } from "../data/sensor";
import type { Constructor, menuai } from "../types";
import type { menuaiBaseEl } from "./menuai-base-mixin";

export default <T extends Constructor<menuaiBaseEl>>(superClass: T) => {
  class StateDisplayMixin extends superClass {
    protected menuaiConnected() {
      super.menuaiConnected();
      this._updateStateDisplay();
    }

    protected willUpdate(changedProps) {
      super.willUpdate(changedProps);

      if (!changedProps.has("menuai")) {
        return;
      }
      const oldmenuai = changedProps.get("menuai") as menuai | undefined;

      if (
        this.menuai &&
        (!oldmenuai ||
          this.menuai.localize !== oldmenuai.localize ||
          this.menuai.locale !== oldmenuai.locale ||
          this.menuai.config !== oldmenuai.config ||
          this.menuai.entities !== oldmenuai.entities)
      ) {
        this._updateStateDisplay();
      }
    }

    private _updateStateDisplay = async () => {
      if (!this.menuai || !this.menuai.config) {
        return;
      }

      let sensorNumericDeviceClasses: string[] = [];

      if (isComponentLoaded(this.menuai, "sensor")) {
        try {
          sensorNumericDeviceClasses = (
            await getSensorNumericDeviceClasses(this.menuai)
          ).numeric_device_classes;
        } catch (_err: any) {
          // ignore
        }
      }

      const {
        formatEntityState,
        formatEntityAttributeName,
        formatEntityAttributeValue,
      } = await computeFormatFunctions(
        this.menuai.localize,
        this.menuai.locale,
        this.menuai.config,
        this.menuai.entities,
        sensorNumericDeviceClasses
      );
      this._updatemenuai({
        formatEntityState,
        formatEntityAttributeName,
        formatEntityAttributeValue,
      });
    };
  }
  return StateDisplayMixin;
};
