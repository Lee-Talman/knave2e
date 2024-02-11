import Knave2eItemType from "./item-type.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eLightSource extends Knave2eItemType {
    
    static DEFAULT_CATEGORY = "lightSource";

    static defineSchema(){
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.range = new fields.NumberField({ ...requiredInteger, min: 0});

        return schema;
    }

    prepareBaseData(){
        const categories = SYSTEM.LIGHTSOURCE.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];
    }
}