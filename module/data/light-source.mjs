import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eLightSource extends Knave2eItemType {
  static DEFAULT_CATEGORY = "torch";
  static DEFAULT_DIMRADIUS = 20;
  static DEFAULT_BRIGHTRADIUS = 10;
  static DEFAULT_QUANTITYPERSLOT = 1;

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.lit = new fields.BooleanField({ initial: false });
    schema.dimRadius = new fields.NumberField({
      ...requiredInteger,
      initial: this.DEFAULT_DIMRADIUS,
      min: 0,
    });
    schema.brightRadius = new fields.NumberField({
      ...requiredInteger,
      initial: this.DEFAULT_BRIGHTRADIUS,
      min: 0,
    });
    schema.intensity = new fields.NumberField({
      ...requiredInteger,
      initial: 3,
      min: 0,
      max: 10,
    });
    schema.speed = new fields.NumberField({
      ...requiredInteger,
      initial: 3,
      min: 0,
      max: 10,
    });

    return schema;
  }
}
