import Knave2eActorType from './actor-type.mjs';
import { SYSTEM } from '../config/system.mjs';

export default class Knave2eRecruit extends Knave2eActorType {
    static DEFAULT_CATEGORY = 'hireling';
    static DEFAULT_RARITY = 'KNAVE2E.Common';

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

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
            min: 0,
            max: 7,
        });
        schema.category = new fields.StringField({
            required: true,
            blank: false,
            initial: this.DEFAULT_CATEGORY,
        });
        schema.coins = new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: 0,
        });
        schema.costPerMonth = new fields.NumberField({
            ...requiredInteger,
            initial: 300,
            min: 0,
        });
        schema.morale = new fields.NumberField({
            ...requiredInteger,
            initial: 4,
            min: 2,
            max: 12,
        });
        schema.rarity = new fields.StringField({ initial: this.DEFAULT_RARITY });
        schema.spells = new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
            max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        });
        schema.slots = new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
            max: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
        });

        schema.hitPoints.fields.value.initial = 3;
        schema.hitPoints.fields.max.initial = 3;

        return schema;
    }

    prepareDerivedData() {
        this._deriveHP();
        this._deriveSlots();
    }

    _deriveHP() {
        if (this.hitPoints.value > 0) {
            this.hitPoints.value = Math.min(this.hitPoints.value, this.hitPoints.max);
            this.hitPoints.progress = Math.floor((this.hitPoints.value / this.hitPoints.max) * 100);
        } else {
            this.hitPoints.value = 0;
            this.hitPoints.progress = 0;
        }
    }

    _deriveSlots() {
        const coinsPerSlot = game.settings.get('knave2e', 'coinsPerSlot');
        const arrowsPerSlot = game.settings.get('knave2e', 'arrowsPerSlot');
        const bulletsPerSlot = game.settings.get('knave2e', 'slingBulletsPerSlot');

        // Sum coin slots
        const coinSlots = coinsPerSlot === 0 ? 0 : this.coins / coinsPerSlot;

        // Sum ammo slots
        const arrowSlots = arrowsPerSlot === 0 ? 0 : this.ammo.arrow / arrowsPerSlot;
        const bulletSlots = bulletsPerSlot === 0 ? 0 : this.ammo.bullet / bulletsPerSlot;
        const ammoSlots = arrowSlots + bulletSlots;

        const sheetSlots = ammoSlots + coinSlots;
        const usedSlots = this.deriveItemSlots() + sheetSlots;

        if (game.settings.get('knave2e', 'enforceIntegerSlots') === true) {
            this.slots.value = Math.ceil(usedSlots);
            this.slots.max = Math.ceil(this.slots.max);
        } else {
            this.slots.value = Number(usedSlots).toPrecision(2);
        }

        if (usedSlots > this.slots.max) {
            this.deriveDroppedItems(usedSlots - this.slots.max);
        }
    }

    deriveItemSlots() {
        const itemUpdates = [];
        let itemSlots = 0;
        const items = this.parent.items.contents;
        for (const item of items) {
            item.system.held = item.system.quantity;
            if (item.system.quantity > 0) {
                item.system.dropped = false;
            } else {
                item.system.held = 0;
                item.system.dropped = true;
            }
            itemUpdates.push(item);
            itemSlots += item.system.quantity * item.system.slots;
        }
        this.parent.updateEmbeddedDocuments('Item', itemUpdates);
        return itemSlots;
    }

    deriveDroppedItems(remainder) {
        const modifiedItems = [];
        const sortedItems = this.parent.items.contents.sort((a, b) => a.sort - b.sort);
        iterateRemainder: while (remainder > 0) {
            for (const item of sortedItems) {
                for (let i = 0; i < item.system.quantity; i++) {
                    if (item.system.dropped === false) {
                        remainder -= item.system.slots;
                        item.system.held -= 1;
                        if (item.system.held <= 0) {
                            item.system.dropped = true;
                        }
                        if (remainder <= 0) {
                            item.system.progress =
                                ((item.system.quantity - item.system.held) / item.system.quantity) * 100;
                            modifiedItems.push(item);
                            break iterateRemainder;
                        }
                    }
                }
                item.system.progress = ((item.system.quantity - item.system.held) / item.system.quantity) * 100;
                modifiedItems.push(item);
            }
        }
        this.parent.updateEmbeddedDocuments('Item', modifiedItems);
    }
    async getRestData() {
        const actorRestData = await super.getRestData();
        return { ...actorRestData, 'system.spells.value': 0 };
    }
}
