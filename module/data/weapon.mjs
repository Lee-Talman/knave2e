import Knave2eItemType from "./item-type.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eWeapon extends Knave2eItemType {
    
    static DEFAULT_CATEGORY = "melee";

    static defineSchema(){
        const fields = foundry.data.fields;
        return foundry.utils.mergeObject(super.defineSchema()), {
            ammoType: new fields.StringField({required: false, choices: SYSTEM.AMMO.CATEGORIES.map(ammo => ammo.id), initial: "ITEM.None"}),
            broken: new fields.BooleanField({initial: false}),
            range: new fields.NumberField({required: true, nullable: false, integer: true, initial: 5, min: 0}),
            damageDiceAmount: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 0}),
            damageDiceSize: new fields.StringField({required: true, choices: SYSTEM.DAMAGE_DIE_SIZES, initial: "d6"}),
            damageDiceBonus: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
        }
    }

    attackBonus;

    damageRoll;

    prepareBaseData(){
        const categories = SYSTEM.WEAPON.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];

        this.attackBonus = this._prepareAttackBonus();
        this.damageRoll = this._prepareDamageRoll();
    }

    _prepareAttackBonus(){
        const category = this.category;
        const actor = this.parent.actor;

        let attackBonus = 0; // define attack bonus (str or wis) based on weapon's category (melee or ranged)
        attackBonus = category === melee ? actor.abilities.str.value : category === ranged ? actor.abilities.wis.value : 0;
        this.attackBonus = attackBonus;
    }

    _prepareDamageRoll(){
        let damageRoll = "d6";

        if (this.damageDiceBonus > 0){
            damageRoll = `${this.damageDiceAmount}${this.damageDiceSize}+${this.damageDiceBonus}`;
        }
        else if (this.damageDiceBonus === 0){
            damageRoll = `${this.damageDiceAmount}${this.damageDiceSize}`;
        }
        else{
            damageRoll = `${this.damageDiceAmount}${this.damageDiceSize}-${this.damageDiceBonus}`;
        }

        this.damageRoll = damageRoll;
        
    }
}

