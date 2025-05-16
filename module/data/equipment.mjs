import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eEquipment extends Knave2eItemType {
  static DEFAULT_CATEGORY = "equipment";

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    return schema;
  }

  prepareBaseData() {
    const categories = SYSTEM.EQUIPMENT.CATEGORIES;
    const category =
      categories[this.category] ||
      categories[this.constructor.DEFAULT_CATEGORY];
  }
}
