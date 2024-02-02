import Knave2eItemType from "./item-type.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eSpellbook extends Knave2eItemType {
    
    static DEFAULT_CATEGORY = "spellbook";

    static defineSchema(){
        const fields = foundry.data.fields;
        return foundry.utils.mergeObject(super.defineSchema()), {

        }
    }

    prepareBaseData(){
        const categories = SYSTEM.SPELLBOOK.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];
    }
}