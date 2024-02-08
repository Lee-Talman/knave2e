import Knave2eItemType from "./item-type.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eLightSource extends Knave2eItemType {
    
    static DEFAULT_CATEGORY = "lightSource";

    static defineSchema(){
        const fields = foundry.data.fields;
        return foundry.utils.mergeObject(super.defineSchema()), {
            range: new fields.NumberField({integer: true, nullable: false, initial: 20, min: 1}),
        }
    }

    prepareBaseData(){
        const categories = SYSTEM.LIGHTSOURCE.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];
    }
}