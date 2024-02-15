import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eWeapon extends Knave2eItemType {

    static DEFAULT_CATEGORY = "melee";

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.ammoType = new fields.StringField({ required: true, choices: SYSTEM.AMMO_TYPES, initial: "none" });
        schema.broken = new fields.BooleanField({ initial: false });
        schema.range = new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 });
        schema.damageDiceAmount = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
        schema.damageDiceSize = new fields.StringField({ required: false, choices: SYSTEM.DAMAGE_DICE_SIZES, initial: "d6" });
        schema.damageDiceBonus = new fields.NumberField({ required: true, nullable: false, integer: false, initial: 0, min: -999 });
        // schema.damageRoll = new fields.StringField({required: true, initial: "1d6"});

        return schema;
    }

    prepareBaseData() {
        const categories = SYSTEM.WEAPON.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];
    }

    prepareDerivedData() {
        let damageRoll = "";
        if (this.damageDiceBonus > 0) {
            damageRoll = `${this.damageDiceAmount}${this.damageDiceSize}+${this.damageDiceBonus}`;
        }
        else if (this.damageDiceBonus === 0) {
            damageRoll = `${this.damageDiceAmount}${this.damageDiceSize}`;
        }
        else {
            damageRoll = `${this.damageDiceAmount}${this.damageDiceSize}${this.damageDiceBonus}`;
        }
        this.damageRoll = damageRoll;
    }
}

