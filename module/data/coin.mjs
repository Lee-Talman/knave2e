import Knave2eBaseItemData from "./base-item.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eCoin extends Knave2eBaseItemData {
    
    static DEFAULT_CATEGORY = "coin";

    static defineSchema(){
        const fields = foundry.data.fields;
        return foundry.utils.mergeObject(super.defineSchema()), {
            
        }
    }

    totalSlots;

    prepareBaseData(){
        const categories = SYSTEM.COIN.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];

        this.totalSlots = Math.ceil(this.quantity / category.quantityPerSlot);
    }
}