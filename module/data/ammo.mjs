import Knave2eItemType from "./item-type.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eAmmo extends Knave2eItemType {
    
    static DEFAULT_CATEGORY = "arrow";

    static defineSchema(){
        const fields = foundry.data.fields;
        return foundry.utils.mergeObject(super.defineSchema()), {
        }
    }

    totalSlots;

    prepareBaseData(){
        const categories = SYSTEM.AMMO.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];

        this.totalSlots = Math.ceil(this.quantity / category.quantityPerSlot);
    }
}