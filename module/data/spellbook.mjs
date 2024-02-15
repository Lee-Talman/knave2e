import Knave2eItemType from "./item-type.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eSpellbook extends Knave2eItemType {
    
    static DEFAULT_CATEGORY = "spellbook";

    static defineSchema(){
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.cast = new fields.BooleanField({ initial: false });

        return schema;
    }
}