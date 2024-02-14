import Knave2eActorType from "./actor-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eRecruit extends Knave2eActorType {

    static DEFAULT_CATEGORY = "hireling";
    static DEFAULT_RARITY = "KNAVE2E.Common";

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.ammo = new fields.SchemaField({
            arrow: new fields.NumberField( {...requiredInteger, initial: 0, min: 0 }),
            bullet: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0})
        })
        schema.armorPoints = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 7 });
        schema.category = new fields.StringField({ required: true, blank: false, initial: this.DEFAULT_CATEGORY });
        schema.coins = new fields.NumberField({...requiredInteger, initial: 0, min: 0});
        schema.costPerMonth = new fields.NumberField({ ...requiredInteger, initial: 300, min: 0});
        schema.morale = new fields.NumberField({ ...requiredInteger, initial: 4, min: 2, max: 12 });
        schema.rarity = new fields.StringField({ initial: this.DEFAULT_RARITY });
        schema.requiresStarterItems = new fields.BooleanField({ initial: false });
        schema.spells = new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
            max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
        });
        schema.slots = new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
            max: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 })
        });
        return schema;
    }

    prepareBaseData() {
        const categories = SYSTEM.RECRUIT.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];

        this.hitPoints.max = 3;
        this.requiresStarterItems = category.requiresStarterItems;
    }

    prepareDerivedData() {
        const categories = SYSTEM.RECRUIT.CATEGORIES;
        const category = categories[this.category] || categories[this.constructor.DEFAULT_CATEGORY];
    }

    //     if (category === "hireling" || category === "mercenary") {
    //         this.costPerMonth = category.costPerMonth;
    //         this.morale = category.morale;
    //         this.rarity = category.rarity.label;
    //     }

    //     if (category === "expert"){
    //         switch (category.rarity.value) {
    //             case "common":
    //                 this.costPerMonth = 600;
    //                 this.category.rarity.label = "KNAVE2E.Common";
    //                 this.morale = category.morale;
    //                 this.rarity = category.rarity.label;
    //                 break;
    //             case "uncommon":
    //                 this.costPerMonth = 1200;
    //                 this.category.rarity.label = "KNAVE2E.Uncommon";
    //                 this.morale = category.morale;
    //                 this.rarity = category.rarity.label;
    //                 break;
    //             case "rare":
    //                 this.costPerMonth = 2400;
    //                 this.category.rarity.label = "KNAVE2E.Rare";
    //                 this.morale = category.morale;
    //                 this.rarity = category.rarity.label;
    //                 this.spells.max = 1;
    //                 break;
    //         }
    //     }
    // }
}