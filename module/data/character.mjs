import Knave2eActorType from "./actor-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eCharacter extends Knave2eActorType {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.abilities = new fields.SchemaField(
      Object.values(SYSTEM.ABILITIES.ABILITIES).reduce((obj, ability) => {
        obj[ability.id] = new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          label: new fields.StringField({ initial: ability.label }),
          abbreviation: new fields.StringField({
            initial: ability.abbreviation,
          }),
          detail: new fields.StringField({ initial: ability.detail }),
        });
        return obj;
      }, {})
    );

    schema.ammo = new fields.SchemaField({
      arrow: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      bullet: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
    });
    schema.armorPoints = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.blessings = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });
    schema.careers = new fields.StringField({});
    schema.coins = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.companions = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });
    schema.label = new fields.StringField({});
    schema.slots = new fields.SchemaField({
      value: new fields.NumberField({
        required: true,
        nullable: false,
        integer: false,
        initial: 0,
        min: 0,
        step: 0.01,
      }),
      max: new fields.NumberField({
        required: true,
        nullable: false,
        integer: false,
        initial: 10,
        min: 0,
        step: 0.01,
      }),
    });
    schema.spells = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });
    schema.wounds = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
        min: 0,
      }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      progress: new fields.NumberField({
        ...requiredInteger,
        initial: 100,
        min: 0,
      }),
    });
    schema.xp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      progress: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
        max: 100,
      }),
    });
    return schema;
  }

  prepareBaseData() {}

  prepareDerivedData() {
    console.log(this);
    if (game.settings.get("knave2e", "automaticLevel")) {
      const {level, label, progress} = this._prepareLevel(this.xp.value);
      this.level = level;
      this.label = label;
      this.xp.progress = progress;
    } else {
      this.xp.progress = 0;
    }
  }

  _prepareLevel(currentXP) {
    // Filter out levels with 0 XP
    const validLevels = Object.entries(SYSTEM.LEVELS.LEVELS)
      .filter(([_, value]) => value.xp >= 0)
      .map(([key, value]) => ({
        level: parseInt(key),
        xp: value.xp,
        label: value.label,
      }));

    // Find which level bracket the currentXP falls into
    for (let i = 0; i < validLevels.length - 1; i++) {
      const currentLevel = validLevels[i];
      const nextLevel = validLevels[i + 1];

      if (currentXP >= currentLevel.xp && currentXP < nextLevel.xp) {
        return {
          level: currentLevel.level,
          label: game.i18n.localize(currentLevel.label),
          progress: Math.floor((currentXP / nextLevel.xp) * 100),
        };
      }
    }

    // If we've reached here, the input is at or above the highest level
    const highestLevel = validLevels[validLevels.length - 1];
    return {
      level: highestLevel.level,
      label: game.i18n.localize(highestLevel.label),
      progress: 100,
    };
  }
}
