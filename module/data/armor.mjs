import Knave2eItemType from "./item-type.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eArmor extends Knave2eItemType {
    
    static DEFAULT_CATEGORY = "shield";

    static defineSchema(){
        const fields = foundry.data.fields;
        return foundry.utils.mergeObject(super.defineSchema()), {
            armorPoints: new fields.NumberField({integer: true, nullable: false, initial: 1, min: 0}),
        }
    }

    prepareBaseData(){
        const categories = SYSTEM.ARMOR.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];
    }
}