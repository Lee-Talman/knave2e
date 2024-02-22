import Knave2eActorType from "./actor-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eRecruit extends Knave2eActorType {

    static DEFAULT_CATEGORY = "hireling";
    static DEFAULT_RARITY = "KNAVE2E.Common";

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.morale = new fields.NumberField({ ...requiredInteger, initial: 7, min: 2, max: 12 });
        schema.numberAppearing = new fields.SchemaField({
            combined: new fields.StringField({ initial: "1d6(3d6)" }),
            dungeon: new fields.StringField({ initial: "" }),
            wilderness: new fields.StringField({ initial: "" })
        });
        return schema;
    }

    prepareDerivedData() {

        // Rip single NA roll of format 1d6(3d6) into separate rolls
        const combined = this.numberAppearing.combined;

        // Find the index of the opening and closing parenthesis
        const openingParenIndex = combined.indexOf('(');
        const closingParenIndex = combined.indexOf(')');

        // Extract string1 using substring
        this.numberAppearing.dungeon = combined.substring(0, openingParenIndex);

        // Extract string2 using slice
        this.numberAppearing.wilderness = combined.slice(openingParenIndex + 1, closingParenIndex);

    }
}