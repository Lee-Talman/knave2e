import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eLightSource extends Knave2eItemType {

    static DEFAULT_CATEGORY = "torch";
    static DEFAULT_DIMRADIUS = 10;
    static DEFAULT_BRIGHTRADIUS = 5;
    static DEFAULT_QUANTITYPERSLOT = 1;

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.lit = new fields.BooleanField({ initial: false });
        schema.dimRadius = new fields.NumberField({ ...requiredInteger, initial: this.DEFAULT_DIMRADIUS, min: 0 });
        schema.brightRadius = new fields.NumberField({ ...requiredInteger, initial: this.DEFAULT_BRIGHTRADIUS, min: 0 });
        schema.intensity = new fields.NumberField({ ...requiredInteger, initial: 3, min: 0, max: 10 });
        schema.speed = new fields.NumberField({ ...requiredInteger, initial: 3, min: 0, max: 10 });
        schema.quantityPerSlot = new fields.NumberField({ required: true, nullable: false, integer: false, initial: this.DEFAULT_QUANTITYPERSLOT, min: 1 });

        return schema;
    }

    prepareBaseData() {
        const categories = SYSTEM.LIGHTSOURCE.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];
    }

    prepareDerivedData() {
        const categories = SYSTEM.LIGHTSOURCE.CATEGORIES;
        this.dimRadius = categories[this.category].dimRadius || categories[this.constructor.DEFAULT_DIMRADIUS];
        this.brightRadius = categories[this.category].brightRadius || categories[this.constructor.DEFAULT_BRIGHTRADIUS];
        this.quantityPerSlot = categories[this.category].quantityPerSlot || categories[this.constructor.DEFAULT_BRIGHTRADIUS];
        this.slots = (1 / this.quantityPerSlot);
    }
}