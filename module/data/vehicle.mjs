import Knave2eActorType from "./actor-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eVehicle extends Knave2eActorType {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.ammo = new fields.SchemaField({
      arrow: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      bullet: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
    });
    schema.coins = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.cost = new fields.NumberField({
      ...requiredInteger,
      initial: 30,
      min: 0,
    });
    schema.crew = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.slots = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 50, min: 0 }),
    });
    return schema;
  }
}
