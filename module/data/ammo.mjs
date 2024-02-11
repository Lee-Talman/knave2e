import Knave2eItemType from "./item-type.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eAmmo extends Knave2eItemType {
    
    static DEFAULT_CATEGORY = "arrow";

    static defineSchema(){
        const fields = foundry.data.fields;
        // const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.quantityPerSlot = new fields.NumberField({ ...requiredInteger, initial: 20, min: 1});

        return schema;
    }

    prepareBaseData(){
        const categories = SYSTEM.AMMO.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];

        this.quantityPerSlot = category.quantityPerSlot;
        this.slots = Math.ceil(this.quantity / category.quantityPerSlot);
    }
}