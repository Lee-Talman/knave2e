import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eWeapon extends Knave2eItemType {
  static DEFAULT_CATEGORY = "melee";

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.ammoType = new fields.StringField({
      required: true,
      choices: SYSTEM.AMMO_TYPES,
      initial: "none",
    });
    schema.attackBonus = new fields.NumberField({
        ...requiredInteger,
        initial: 0
    })
    schema.broken = new fields.BooleanField({ initial: false });
    schema.range = new fields.NumberField({
      ...requiredInteger,
      initial: 5,
      min: 0,
    });
    schema.damageDiceAmount = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 0,
    });
    schema.damageDiceSize = new fields.StringField({
      required: false,
      initial: "d6",
    });
    schema.damageDiceBonus = new fields.NumberField({
      required: false,
      initial: 0,
      min: -999,
    });
    schema.damageRoll = new fields.StringField({
      required: true,
      initial: "1d6",
    });

    return schema;
  }

  prepareBaseData() {
    const categories = SYSTEM.WEAPON.CATEGORIES;
    const category =
      categories[this.category] ||
      categories[this.constructor.DEFAULT_CATEGORY];
  }

  prepareDerivedData() {
    const rollDamage = new RegExp("^(\\d*)(d[1-9]\\d*)(?:([+-])(\\d+))?$", "");
    const flatDamage = new RegExp("^(\\+?|\\-?)(\\d+)$", "");
    let m;

    if ((m = rollDamage.exec(this.damageRoll)) !== null) {
      this.damageDiceAmount = m[1] === "" ? 1 : m[1];
      this.damageDiceSize = m[2];

      if (m[3] !== "" && m[3] !== undefined && m[3] !== null) {
        this.damageDiceBonus = m[3] === "+" ? +m[4] : +`-${m[4]}`;
      } else {
        this.damageDiceBonus = 0;
      }
    } else if ((m = flatDamage.exec(this.damageRoll)) !== null) {
      this.damageDiceAmount = 0;
      this.damageDiceSize = "d6";

      if (m[1] !== "" && m[1] !== undefined && m[1] !== null) {
        this.damageDiceBonus = m[1] === "-" ? +`-${m[2]}` : +m[2];
      } else {
        this.damageDiceBonus = +m[2];
      }
    }
  }
}
