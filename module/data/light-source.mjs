import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eLightSource extends Knave2eItemType {

    static DEFAULT_CATEGORY = "torch";

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.lit = new fields.BooleanField({ initial: false });
        schema.dimRadius = new fields.NumberField({ ...requiredInteger, initial: 40, min: 0 });
        schema.brightRadius = new fields.NumberField({ ...requiredInteger, initial: 20, min: 0 });
        schema.intensity = new fields.NumberField({ ...requiredInteger, initial: 3, min: 0, max: 10 });
        schema.speed = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0, max: 10 });
        schema.quantityPerSlot = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

        return schema;
    }

    prepareBaseData() {
        const categories = SYSTEM.LIGHTSOURCE.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];
    }
}