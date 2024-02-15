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
            dungeon: new fields.StringField({ initial: "1d6" }),
            wilderness: new fields.StringField({ initial: "3d6" })
        });
        return schema;
    }
}