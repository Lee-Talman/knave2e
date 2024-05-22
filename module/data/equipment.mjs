import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eEquipment extends Knave2eItemType {
  static DEFAULT_CATEGORY = "equipment";

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantityPerSlot = new fields.NumberField({
      required: true,
      nullable: false,
      integer: false,
      initial: 1,
      min: 1,
    });
    schema.quantity = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
    });

    return schema;
  }

  prepareBaseData() {
    const categories = SYSTEM.EQUIPMENT.CATEGORIES;
    const category =
      categories[this.category] ||
      categories[this.constructor.DEFAULT_CATEGORY];
  }

  prepareDerivedData() {
    if (this.quantityPerSlot > 1) {
      let rawSlots = (1 / this.quantityPerSlot) * this.quantity;
      this.slots = Number(rawSlots.toPrecision(2));
    }
  }
}
