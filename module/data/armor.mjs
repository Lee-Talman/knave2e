import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eArmor extends Knave2eItemType {
  static DEFAULT_CATEGORY = "shield";

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.armorPoints = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
    });
    schema.equipped = new fields.BooleanField({ initial: true });

    return schema;
  }
}
