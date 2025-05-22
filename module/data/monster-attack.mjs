import Knave2eItemType from "./item-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eMonsterAttack extends Knave2eItemType {
  static DEFAULT_CATEGORY = "attack";

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attackAmount = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
    });
    schema.attackBonus = new fields.NumberField({
        ...requiredInteger,
        initial: 0
    })
    schema.damageDiceAmount = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 0,
    });
    schema.damageDiceSize = new fields.StringField({
      required: false,
      choices: SYSTEM.DAMAGE_DICE_SIZES,
      initial: "d6",
    });
    schema.damageDiceBonus = new fields.NumberField({
      required: true,
      nullable: false,
      integer: false,
      initial: 0,
      min: -999,
    });
    schema.damageRoll = new fields.StringField({
      required: true,
      initial: "1d6",
    });

    return schema;
  }

  prepareBaseData() {}

  prepareDerivedData() {
    const rollDamage = new RegExp("^(\\d*)(d[1-9]\\d*)(?:([+-])(\\d+))?$", "");
    const flatDamage = new RegExp("^(\\+?|\\-?)(\\d+)$", "");
    let m;

    if ((m = rollDamage.exec(this.damageRoll)) !== null) {
      this.damageDiceAmount = m[1] === "" ? 1 : m[1];
      this.damageDiceSize = m[2];

      if (m[3] !== "" && m[3] !== undefined && m[3] !== null) {
        this.damageDiceBonus = m[3] === "+" ? +m[4] : +`-${m[4]}`;
      } 
      else {
        this.damageDiceBonus = 0;
      }
    } 
    else if ((m = flatDamage.exec(this.damageRoll)) !== null) {
      this.damageDiceAmount = 0;
      this.damageDiceSize = "d6";

      if (m[1] !== "" && m[1] !== undefined && m[1] !== null) {
        this.damageDiceBonus = m[1] === "-" ? +`-${m[2]}` : +m[2];
      } 
      else {
        this.damageDiceBonus = +m[2];
      }
    }
  }
}
