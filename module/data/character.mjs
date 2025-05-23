import Knave2eActorType from './actor-type.mjs';
import { SYSTEM } from '../config/system.mjs';

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

        schema.hitPoints.fields.value.min = -999;
        return schema;
    }

    prepareBaseData() {}

    prepareDerivedData() {
        this._deriveBlessings();
        this._deriveCompanions();
        this._deriveHP();
        this._deriveLevel();
        this._deriveSlots();
        this._deriveSpells();
    }

    _deriveBlessings() {
        if (game.settings.get('knave2e', 'automaticBlessings')) {
            this.blessings.max = this.abilities.charisma.value;
        }
    }

    _deriveCompanions() {
        if (game.settings.get('knave2e', 'automaticCompanions')) {
            this.companions.max = this.abilities.charisma.value;
        }
    }

    _deriveHP() {
        if (game.settings.get('knave2e', 'automaticWounds')) {
            this.wounds.max = 10 + this.abilities.constitution.value;
        }
        this.hitPoints.value = Math.min(this.hitPoints.value, this.hitPoints.max);
        this.wounds.value = Math.min(this.wounds.value, this.wounds.max);

        //Overflow any negative HP into wounds
        if (this.hitPoints.value < 0) {
            const overflowDamage = -this.hitPoints.value;
            this.hitPoints.value = 0;

            this.wounds.value = this.wounds.value - overflowDamage;
            if (this.wounds.value <= 0) {
                this.wounds.value = 0;
            }
        }

        // Update progress bars for HP/wounds
        this.hitPoints.progress = Math.floor((this.hitPoints.value / this.hitPoints.max) * 100);

        this.wounds.progress = Math.floor((this.wounds.value / this.wounds.max) * 100);
    }

    _deriveLevel() {
        if (game.settings.get('knave2e', 'automaticLevel') === false) {
            this.xp.progress = 0;
        } else {
            // Ignore level keys with an 'xp' value < 0
            //const validLevels = Object.entries(SYSTEM.LEVELS.LEVELS)
            const validLevels = Object.entries(JSON.parse(game.settings.get('knave2e', 'xpPerLevel')))
                .filter(([_, value]) => value.xp >= 0)
                .map(([key, value]) => ({
                    level: parseInt(key),
                    xp: value.xp,
                    label: value.label,
                }));

            // Determine level from this.xp.value
            for (let i = 0; i < validLevels.length - 1; i++) {
                const currentLevel = validLevels[i];
                const nextLevel = validLevels[i + 1];

                if (this.xp.value >= currentLevel.xp && this.xp.value < nextLevel.xp) {
                    (this.level = currentLevel.level),
                        (this.label = currentLevel.label),
                        (this.xp.progress = Math.floor(
                            ((this.xp.value - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100
                        ));
                    return;
                }
            }

            const highestLevel = validLevels[validLevels.length - 1];
            (this.level = highestLevel.level),
                (this.label = game.i18n.localize(highestLevel.label)),
                (this.xp.progress = 100);
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

        if (game.settings.get('knave2e', 'automaticSlots') === true) {
            this.slots.max = 10 + this.abilities['constitution'].value - (this.wounds.max - this.wounds.value);
        }
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

    _deriveSpells() {
        if (game.settings.get('knave2e', 'automaticSpells')) {
            this.spells.max = this.abilities.intelligence.value;
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
        const update = { ...actorRestData, 'system.spells.value': 0 };

        const type = await Dialog.wait({
            title: `${game.i18n.localize('KNAVE2E.RestDialogTitle')}`,
            content: `${game.i18n.localize('KNAVE2E.RestDialogContent')}`,
            buttons: {
                standard: {
                    label: game.i18n.localize('KNAVE2E.Standard'),
                    callback: () => {
                        return 'standard';
                    },
                },
                safe: {
                    label: game.i18n.localize('KNAVE2E.SafeHaven'),
                    callback: () => {
                        return 'safe';
                    },
                },
            },
            default: 'standard',
        });

        if (type === 'standard') {
            return update;
        } else if (type === 'safe') {
            return {
                ...update,
                'system.wounds.value': Math.min(this.wounds.value + 1, this.wounds.max),
            };
        } else {
            ui.notifications.warn('No rest type selected. Defaulting to standard rest...');
            return update;
        }
    }
}
