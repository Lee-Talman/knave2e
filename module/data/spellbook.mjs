import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eSpellbook extends Knave2eItemType {
  static DEFAULT_CATEGORY = "spellbook";

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.cast = new fields.BooleanField({ initial: false });
    schema.castQuantity = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, step: 1});

    return schema;
  }

  prepareDerivedData() {
    this._deriveCastState();
  }

  _deriveCastState() {
    this.castQuantity = Math.min(this.castQuantity, this.quantity);
    if (this.quantity <= 0) {
      this.castQuantity = 0;
      this.cast = false;
    }
    else if (this.castQuantity < this.quantity) {
      this.cast = false;
    }
    else {
      this.cast = true;
    }
  }

  async _preUpdate(changed, options, user) {
    if (changed.system?.quantity !== undefined && changed.system?.quantity < this.quantity && !this.cast) {
      const castDelta = this.quantity - changed.system?.quantity;
      changed["system.castQuantity"] = Math.max(this.castQuantity - castDelta, 0);
    }
    return super._preUpdate(changed, options, user);
  }
}
