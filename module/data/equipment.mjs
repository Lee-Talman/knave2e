import Knave2eItemType from "./item-type.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eEquipment extends Knave2eItemType {
    
    static DEFAULT_CATEGORY = "equipment";

    static defineSchema(){
        const fields = foundry.data.fields;
        return foundry.utils.mergeObject(super.defineSchema()), {

        }
    }

    prepareBaseData(){
        const categories = SYSTEM.EQUIPMENT.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];
    }
}