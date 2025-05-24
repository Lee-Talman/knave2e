import { onAttack, onDamageFromSheet, onCast } from '../helpers/items.mjs';

export default class Knave2eActorSheet extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['knave2e', 'sheet', 'actor'],
            width: 640,
            height: 670,
            dragDrop: [
                { dragSelector: '.item-list .item', dropSelector: null },
                { dragSelector: '.knave-item', dropSelector: null },
            ],
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'character',
                },
            ],
        });
    }

    get template() {
        return `systems/knave2e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }

    async getData() {
        const context = super.getData();

        // Use a safe clone of the actor data for further operations.
        const actorData = this.actor.toObject(false);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system;
        context.flags = actorData.flags;

        // Prepare character data and items.
        if (actorData.type == 'character') {
            this._prepareCharacterData(context);
        }

        if (actorData.type == 'recruit') {
            this._prepareRecruitData(context);
        }

        if (actorData.type == 'monster') {
            this._prepareMonsterData(context);
        }

        if (actorData.type == 'vehicle') {
            this._prepareVehicleData(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        // Add enriched HTML for text editors
        context.system.enrichedHTML = await TextEditor.enrichHTML(context.system.description);

        // Add global knave2e settings for sheet logic
        context.system.settings = {};

        for (let [key, value] of game.settings.settings) {
            if (key.includes('knave2e')) {
                let filteredKey = key.replace('knave2e.', '');
                let filteredValue = game.settings.get('knave2e', filteredKey);
                context.system.settings[filteredKey] = filteredValue;
            }
        }

        return context;
    }

    _prepareCharacterData(context) {
        const systemData = context.system;

        // Handle Armor
        if (game.settings.get('knave2e', 'automaticArmor')) {
            const { armorPoints, armorClass } = this._updateArmor(context);
            systemData.armorPoints = armorPoints;
            systemData.armorClass = armorClass;
        }

        // Handle Blessings
        systemData.blessings.value = this._updateBlessings(context);

        // Handle Companions
        if (game.settings.get('knave2e', 'enforceCompanions')) {
            if (systemData.companions.value > systemData.companions.max) {
                systemData.companions.value = Math.min(systemData.companions.value, systemData.companions.max);
            }
        }

        // Handle Light
        if (game.settings.get('knave2e', 'automaticLight')) {
            this._updateLight(context);
        }
    }

    _prepareRecruitData(context) {
        context.recruitCategories = this._labelOptions(CONFIG.SYSTEM.RECRUIT.CATEGORIES);
        context.rarityCategories = {
            'KNAVE2E.Common': 'KNAVE2E.Common',
            'KNAVE2E.Uncommon': 'KNAVE2E.Uncommon',
            'KNAVE2E.Rare': 'KNAVE2E.Rare',
        };

        const systemData = context.system;

        // Handle Recruit Details
        if (game.settings.get('knave2e', 'automaticRecruits')) {
            this._updateRecruitCategoryDetails(context);
        }

        // Handle Armor
        if (game.settings.get('knave2e', 'automaticArmor')) {
            const { armorPoints, armorClass } = this._updateArmor(context);
            systemData.armorPoints = armorPoints;
            systemData.armorClass = armorClass;
        }

        // Handle HP

        // Handle Light
        if (game.settings.get('knave2e', 'automaticLight')) {
            this._updateLight(context);
        }
    }

    _prepareMonsterData(context) {
        const systemData = context.system;

        // Automatic AC, AP, and Armor Types
        if (game.settings.get('knave2e', 'automaticArmor')) {
            systemData.armorPoints = systemData.armorClass - 11;
        }
    }

    _prepareVehicleData(context) {
        const systemData = context.system;
        //systemData.slots.value = this._updateUsedSlots(context);

        if (game.settings.get('knave2e', 'enforceIntegerSlots')) {
            systemData.slots.value = Math.ceil(systemData.slots.value);
            systemData.slots.max = Math.ceil(systemData.slots.max);
        } else {
            systemData.slots.value = Number(systemData.slots.value.toPrecision(2));
            systemData.slots.max = Number(systemData.slots.max.toPrecision(2));
        }

        systemData.crew = Math.ceil(systemData.crew);
        systemData.cost = Math.ceil(systemData.cost);
    }

    _updateArmor(context) {
        const armorPieces = context.items.filter(
            (i) => i.type === 'armor' && i.system.dropped === false && i.system.equipped === true
        );
        let armorPoints = 0;
        let armorClass = 11;

        if (game.settings.get('knave2e', 'enforceArmor')) {
            const uniqueCategories = [];
            armorPoints = 0;

            const uniqueArmorPieces = armorPieces.filter((i) => {
                if (!uniqueCategories.some((cat) => cat === i.system.category)) {
                    uniqueCategories.push(i.system.category);
                    armorPoints = Math.max(armorPoints + i.system.armorPoints, 0);
                    return true;
                }
                const item = this.actor.items.get(i._id);
                item.update({ 'system.equipped': false });
                return false;
            });
        } else {
            armorPoints = armorPieces.reduce((total, armorPiece) => {
                return total + armorPiece.system.armorPoints;
            }, 0);
        }

        armorClass = armorPoints + 11;
        return { armorPoints, armorClass };
    }

    _updateBlessings(context) {
        const activeBlessings = context.items.filter(
            (i) => i.system.relic && i.system.relic.isActive && i.system.dropped === false
        );

        return activeBlessings.length;
    }

    _updateLight(context) {
        const litItems = context.items.filter(
            (i) => i.type === 'lightSource' && i.system.lit === true && i.system.dropped === false
        );
        const token = this.actor.getActiveTokens()[0];

        if (token) {
            if (litItems.length > 0) {
                const brightestLight = litItems.reduce((prev, current) =>
                    prev.system.dimRadius > current.system.dimRadius ? prev : current
                );
                token.document.update({
                    light: {
                        dim: brightestLight.system.dimRadius,
                        bright: brightestLight.system.brightRadius,
                        animation: {
                            type: 'torch',
                            speed: brightestLight.system.speed,
                            intensity: brightestLight.system.intensity,
                        },
                    },
                });
            } else {
                token.document.update({
                    light: {
                        dim: 0,
                        bright: 0,
                        animation: {
                            type: 'none',
                            speed: 5,
                            intensity: 5,
                        },
                    },
                });
            }
        }
    }

    _updateRecruitCategoryDetails(context) {
        const systemData = context.system;

        const category = CONFIG.SYSTEM.RECRUIT.CATEGORIES[systemData.category];

        if (systemData.category === 'hireling' || systemData.category === 'mercenary') {
            systemData.costPerMonth = category.costPerMonth;
            systemData.morale = category.morale;
            systemData.rarity = 'KNAVE2E.Common';
            systemData.spells.max = 0;
        } else if (systemData.category === 'expert') {
            switch (systemData.rarity) {
                case 'KNAVE2E.Common':
                    systemData.costPerMonth = 600;
                    systemData.morale = category.morale;
                    systemData.rarity = 'KNAVE2E.Common';
                    systemData.spells.max = 0;
                    break;
                case 'KNAVE2E.Uncommon':
                    systemData.costPerMonth = 1200;
                    systemData.morale = category.morale;
                    systemData.rarity = 'KNAVE2E.Uncommon';
                    systemData.spells.max = 0;
                    break;
                case 'KNAVE2E.Rare':
                    systemData.costPerMonth = 2400;
                    systemData.morale = category.morale;
                    systemData.rarity = 'KNAVE2E.Rare';
                    systemData.spells.max = 1;
                    break;
            }
        }
    }

    // Convert CATEGORIES({id: "id", label: "label"}) to a selectOptions-compatible object
    _labelOptions(categories) {
        const returnObject = Object.keys(categories).reduce((result, key) => {
            result[key] = categories[key].label;
            return result;
        }, {});
        return returnObject;
    }

    // Convert CATEGORIES({id: "id", costPerMonth: cost}) to a selectOptions-compatible object
    _costOptions(categories) {
        const returnObject = Object.keys(categories).reduce((result, key) => {
            result[key] = categories[key].costPerMonth;
            return result;
        }, {});
        return returnObject;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Render the item sheet for viewing/editing prior to the editable check.
        html.find('.item-edit').click((ev) => {
            const li = $(ev.currentTarget).parents('.knave-item');
            const item = this.actor.items.get(li.data('itemId'));
            item.sheet.render(true);
        });

        // -------------------------------------------------------------
        // Return if sheet is not editable
        if (!this.isEditable) return;

        // Add Inventory Item
        html.find('.item-create').click(this._onItemCreate.bind(this));

        // Delete Inventory Item
        html.find('.item-delete').click((ev) => {
            const li = $(ev.currentTarget).parents('.knave-item');
            const item = this.actor.items.get(li.data('itemId'));
            item.delete();
            li.slideUp(200, () => this.render(false));
        });

        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = (ev) => this._onDragStart(ev);
            html.find('li.item').each((i, li) => {
                if (li.classList.contains('inventory-header')) return;
                li.setAttribute('draggable', true);
                li.addEventListener('dragstart', handler, false);
            });
        }

        // Rollable elements (e.g. Abilities)
        html.on('click', '.rollable', this._onRollable.bind(this));

        // Item Description to chat
        html.on('click', '.item-name', this._onItemName.bind(this));

        // Adjust Item Quantity
        html.on('click', '.item-toggle.quantity', this._onQuantity.bind(this));

        // Toggle Item Icons
        html.on('click', '.item-toggle', this._onItemToggle.bind(this));

        /* -------------------------------------------- */
        /*  Item Rolls                                  */
        /* -------------------------------------------- */

        // Attack Roll
        html.on('click', '.item-button.attack', onAttack.bind(this));

        // Sheet Damage/Direct rolls (chat button rolls handled in './documents/chat-message.mjs')
        html.on('click', '.item-button.damage.sheet', onDamageFromSheet.bind(this));

        // Cast Spell
        html.on('click', '.item-button.cast', onCast.bind(this));

        /* -------------------------------------------- */
        /*  Sheet Buttons                               */
        /* -------------------------------------------- */

        // Checks & Abilities.
        html.on('click', '.actor-button.check', this._onCheck.bind(this));

        // Armor Points for Player-Facing Rolls
        html.on('click', '.actor-button.ap', this._onAP.bind(this));

        // Resting
        html.on('click', '.actor-button.rest', this._onRest.bind(this));

        // Morale
        html.on('click', '.actor-button.morale', this._onMorale.bind(this));

        // Number Appearing
        html.on('click', '.actor-button.numberAppearing', this._onNumberAppearing.bind(this));

        /* -------------------------------------------- */
        /*  Sheet Dropdown                              */
        /* -------------------------------------------- */

        // // Recruit Category
        // html.on('change', '.actor-select.category', this._onRecruitCategory.bind(this));

        // // Recruit Rarity
        // html.on('change', '.actor-select.rarity', this._onRecruitRarity.bind(this));
    }

    async _onItemName(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const systemData = this.actor.system;

        const li = a.closest('li');
        const item = li.dataset.itemId ? this.actor.items.get(li.dataset.itemId) : null;

        if (item.system.description !== '') {
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: `${item.name}`,
                content: `${item.system.description}`,
                rollMode: game.settings.get('core', 'rollMode'),
            });
        }
    }

    async _onItemToggle(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const systemData = this.actor.system;

        // Find closest <li> element containing a "data-item-id" attribute
        const li = a.closest('li');
        const item = li.dataset.itemId ? this.actor.items.get(li.dataset.itemId) : null;

        switch (a.dataset.action) {
            case 'break':
                return item.update({ 'system.broken': !item.system.broken });
            case 'cast':
                return item.update({ 'system.cast': !item.system.cast });
            case 'equip':
                return item.update({ 'system.equipped': !item.system.equipped });
            case 'blessing':
                if (game.settings.get('knave2e', 'enforceBlessings')) {
                    if (item.system.relic.isActive) {
                        this.actor.update({
                            'system.blessings.value': systemData.blessings.value - 1,
                        });
                        return item.update({ 'system.relic.isActive': false });
                    } else if (systemData.blessings.value < systemData.blessings.max) {
                        this.actor.update({
                            'system.blessings.value': systemData.blessings.value + 1,
                        });
                        return item.update({
                            'system.relic.isActive': !item.system.relic.isActive,
                        });
                    } else if (systemData.blessings.value >= systemData.blessings.max) {
                        Dialog.prompt({
                            title: `${game.i18n.localize('KNAVE2E.BlessingDialogTitle')}`,
                            content: `${this.actor.name} ${game.i18n.localize('KNAVE2E.BlessingDialogContentMax')}`,
                            label: 'OK',
                            callback: (html) => {
                                return;
                            },
                        });
                        return;
                    }
                } else {
                    return item.update({
                        'system.relic.isActive': !item.system.relic.isActive,
                    });
                }
            case 'light':
                return item.update({ 'system.lit': !item.system.lit });
            default:
                break;
        }
    }

    _onQuantity(event) {
        event.preventDefault();
        const a = event.currentTarget;
        // Find closest <li> element containing a "data-item-id" attribute
        const li = a.closest('li');
        const item = li.dataset.itemId ? this.actor.items.get(li.dataset.itemId) : null;
        switch (a.dataset.action) {
            case 'increment':
                return item.update({ 'system.quantity': item.system.quantity + 1 });
            case 'decrement':
                return item.update({ 'system.quantity': item.system.quantity - 1 });
            default:
                break;
        }
    }

    async _onCheck(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const systemData = this.actor.system;

        let r = new Roll();
        let rollMod = 0;

        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
        const rollMode = game.settings.get('core', 'rollMode');

        rollMod = await Dialog.wait({
            title: 'Check',
            content: 'Add a bonus to this Check?', //todo: localize
            buttons: {
                standard: {
                    label: game.i18n.localize('KNAVE2E.Level'),
                    callback: () => {
                        return systemData.level;
                    },
                },
                half: {
                    label: game.i18n.localize('KNAVE2E.HalfLevel'),
                    callback: () => {
                        return Math.floor(systemData.level / 2);
                    },
                },
                zero: {
                    label: game.i18n.localize('KNAVE2E.None'),
                    callback: () => {
                        return 0;
                    },
                },
            },
            default: 'standard',
            // close: () => { reject() },
        });

        r = new Roll('1d20 + @mod', { mod: rollMod });
        r.toMessage({
            speaker: speaker,
            flavor: `[Check] ${this.actor.name}: `, //@TODO: localize this
            rollMode: rollMode,
        });
        return r;
    }

    async _onAP(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const context = await this.getData();

        let r = new Roll('d20+@ap', { ap: context.system.armorPoints });

        r.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `[Reverse AP] ${this.actor.name}: `,
            rollMode: game.settings.get('core', 'rollMode'),
        });
    }

    async _onNumberAppearing(event) {
        event.preventDefault();
        const a = event.currentTarget;
        const systemData = this.actor.system;

        let formula;
        let rollFlavor;

        let type = await Dialog.wait({
            title: `${game.i18n.localize('KNAVE2E.NumberAppearingDialogTitle')}`,
            buttons: {
                dungeon: {
                    label: `${game.i18n.localize('KNAVE2E.NumberAppearingDungeon')} (${
                        systemData.numberAppearing.dungeon
                    })`,
                    callback: () => {
                        return 'dungeon';
                    },
                },
                wilderness: {
                    label: `${game.i18n.localize('KNAVE2E.NumberAppearingWilderness')} (${
                        systemData.numberAppearing.wilderness
                    })`,
                    callback: () => {
                        return 'wilderness';
                    },
                },
                cancel: {
                    label: game.i18n.localize('KNAVE2E.Cancel'),
                    callback: () => {
                        return;
                    },
                },
            },
            default: 'dungeon',
        });

        if (type) {
            formula =
                type === 'dungeon'
                    ? systemData.numberAppearing.dungeon
                    : type === 'wilderness'
                    ? systemData.numberAppearing.wilderness
                    : null;
            rollFlavor =
                type === 'dungeon'
                    ? 'KNAVE2E.AppearInDungeon'
                    : type === 'wilderness'
                    ? 'KNAVE2E.AppearInWilderness'
                    : null;
        }

        if (formula) {
            let r = await new Roll(formula);
            r.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: `${this.actor.name}${game.i18n.localize(rollFlavor)}`,
                rollMode: game.settings.get('core', 'rollMode'),
            });
        }
    }

    async _onItemCreate(event) {
        event.preventDefault();

        let itemType;

        if (this.actor.type === 'monster') {
            itemType = 'monsterAttack';
        } else {
            // Get the type of item to create.
            itemType = await Dialog.wait({
                title: `${game.i18n.localize('KNAVE2E.CreateItemDialogHeader')}`,
                content: `${game.i18n.localize('KNAVE2E.CreateItemDialogContent')}`,
                buttons: {
                    armor: {
                        label: game.i18n.localize('KNAVE2E.Armor'),
                        callback: () => {
                            return 'armor';
                        },
                    },
                    equipment: {
                        label: game.i18n.localize('KNAVE2E.Equipment'),
                        callback: () => {
                            return 'equipment';
                        },
                    },
                    lightSource: {
                        label: game.i18n.localize('KNAVE2E.LightSource'),
                        callback: () => {
                            return 'lightSource';
                        },
                    },
                    spellbook: {
                        label: game.i18n.localize('KNAVE2E.Spellbook'),
                        callback: () => {
                            return 'spellbook';
                        },
                    },
                    weapon: {
                        label: game.i18n.localize('KNAVE2E.Weapon'),
                        callback: () => {
                            return 'weapon';
                        },
                    },
                },
                default: 'weapon',
                // close: () => { reject() },
            });
        }

        const header = event.currentTarget;
        // Grab any data associated with this control.
        const data = foundry.utils.duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${itemType.capitalize()}`;
        // Prepare the item object.
        const itemData = {
            name: name,
            type: itemType,
            system: data,
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system['type'];

        // Finally, create the item!
        return await Item.create(itemData, { parent: this.actor });
    }

    async _onDropItem(event, data) {
        if (!this.actor.isOwner) return false;
        const item = await Item.implementation.fromDropData(data);
        if (item.parent !== null && !item.parent?.isOwner) return false;

        //Handle item sorting within the same Actor
        const itemData = item.toObject();
        if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

        //Check to see if item can be added to an existing stack
        let match = await this._isIdentical(itemData);
        if (match !== null) {
            await this._moveItems(item.parent, itemData, match);
        } else {
            await this._moveItems(item.parent, itemData);
        }

        // Create the owned item
        //super._onDropItemCreate(itemData, event);
    }

    async _isIdentical(itemData) {
        let inventory = [];
        let match;
        switch (itemData.type) {
            case 'armor':
                inventory = this.actor.items.filter((existingItem) => existingItem.type === 'armor');
                match = inventory.find(
                    (existingItem) =>
                        existingItem.name === itemData.name &&
                        existingItem.img === itemData.img &&
                        existingItem.system?.category === itemData.system?.category &&
                        existingItem.system?.description === itemData.system?.description &&
                        existingItem.system?.relic.isRelic === itemData.system?.relic.isRelic &&
                        existingItem.system?.slots === itemData.system?.slots &&
                        existingItem.system?.armorPoints === itemData.system?.armorPoints
                );
                break;
            case 'equipment':
                inventory = this.actor.items.filter((existingItem) => existingItem.type === 'equipment');
                match = inventory.find(
                    (existingItem) =>
                        existingItem.name === itemData.name &&
                        existingItem.img === itemData.img &&
                        existingItem.system?.category === itemData.system?.category &&
                        existingItem.system?.description === itemData.system?.description &&
                        existingItem.system?.relic.isRelic === itemData.system?.relic.isRelic &&
                        existingItem.system?.slots === itemData.system?.slots
                );
                break;
            case 'lightSource':
                inventory = this.actor.items.filter((existingItem) => existingItem.type === 'lightSource');
                match = inventory.find(
                    (existingItem) =>
                        existingItem.name === itemData.name &&
                        existingItem.img === itemData.img &&
                        existingItem.system?.category === itemData.system?.category &&
                        existingItem.system?.description === itemData.system?.description &&
                        existingItem.system?.relic.isRelic === itemData.system?.relic.isRelic &&
                        existingItem.system?.slots === itemData.system?.slots &&
                        existingItem.system?.dimRadius === itemData.system?.dimRadius &&
                        existingItem.system?.brightRadius === itemData.system?.brightRadius &&
                        existingItem.system?.intensity === itemData.system?.intensity &&
                        existingItem.system?.speed === itemData.system?.speed
                );
                break;
            case 'weapon':
                inventory = this.actor.items.filter((existingItem) => existingItem.type === 'weapon');
                match = inventory.find(
                    (existingItem) =>
                        existingItem.name === itemData.name &&
                        existingItem.img === itemData.img &&
                        existingItem.system?.category === itemData.system?.category &&
                        existingItem.system?.description === itemData.system?.description &&
                        existingItem.system?.relic.isRelic === itemData.system?.relic.isRelic &&
                        existingItem.system?.slots === itemData.system?.slots &&
                        existingItem.system?.ammoType === itemData.system?.ammoType &&
                        existingItem.system?.attackBonus === itemData.system?.attackBonus &&
                        existingItem.system?.range === itemData.system?.range &&
                        existingItem.system?.damageDiceAmount === itemData.system?.damageDiceAmount &&
                        existingItem.system?.damageDiceSize === itemData.system?.damageDiceSize &&
                        existingItem.system?.damageDiceBonus === itemData.system?.damageDiceBonus &&
                        existingItem.system?.damageRoll === itemData.system?.damageRoll
                );
                break;
            default:
                break;
        }
        if (match) {
            return match;
        } else {
            return null;
        }
    }

    async _moveItems(parent, itemData, match = null) {
        let moveQuantity = 0;
        if (itemData.system.quantity > 1 || parent === null) {
            try {
                moveQuantity = await foundry.applications.api.DialogV2.prompt({
                    window: { title: `Move Quantity?` }, //todo: localize this
                    content: `<input name="moveQuantity" type="number" min="0" max="${itemData.system?.quantity}" step="1" autofocus>`,
                    ok: {
                        label: 'Move',
                        icon: 'fa-solid fa-arrow-right',
                        callback: (event, button, dialog) => button.form.elements.moveQuantity.valueAsNumber,
                    },
                });
            } catch {
                return;
            }
        } else {
            moveQuantity = itemData.system.quantity;
        }
        // Cap move quantity at the amount that exists in the parent, as long as the parent is a sheet
        if (parent !== null) {
            moveQuantity = Math.min(moveQuantity, itemData.system.quantity);
        }
        
        const startingQuantity = itemData.system.quantity;

        if (match !== null) {
            let incrementItem = this.actor.items.map(() => ({
                _id: match._id,
                'system.quantity': match.system.quantity + moveQuantity,
            }));
            this.actor.updateEmbeddedDocuments('Item', incrementItem);
        } else {
            itemData.system.quantity = moveQuantity;
            const createItemData = itemData instanceof Array ? itemData : [itemData];
            this.actor.createEmbeddedDocuments('Item', createItemData);
        }
        if (parent !== null) {
            let decrementItem = parent.items.map(() => ({
                _id: itemData._id,
                'system.quantity': startingQuantity - moveQuantity,
            }));
            parent.updateEmbeddedDocuments('Item', decrementItem);
        }
    }

    async _onMorale(event) {
        event.preventDefault();
        const systemData = this.actor.system;

        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
        const rollMode = game.settings.get('core', 'rollMode');

        let r = new Roll('2d6');
        await r.evaluate();
        if (r.total > systemData.morale) {
            r.toMessage({
                speaker: speaker,
                flavor: `Morale Test Failed!.`, //@TODO: localize this
                rollMode: rollMode,
            });
        } else {
            r.toMessage({
                speaker: speaker,
                flavor: `Morale Test Succeeded!.`, //@TODO: localize this
                rollMode: rollMode,
            });
        }
    }

    async _onRest(event) {
        event.preventDefault();
        await this.actor.system.rest();
    }

    async _onRollable(event) {
        // event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        // Handle item rolls.
        if (dataset.dataType) {
            if (dataset.dataType == 'item') {
                const itemId = element.closest('.item').dataset.itemId;
                const item = this.actor.items.get(itemId);
                if (item) return item.roll();
            }
        }

        // Handle plain-text roll formulas
        if (dataset.roll) {
            let label = dataset.label
                ? `[${game.i18n.localize('KNAVE2E.Check')}]
                  ${game.i18n.localize(dataset.label)}`
                : '';
            let r = await new Roll(dataset.roll, this.actor.getRollData());

            r.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: game.i18n.localize(label),
                rollMode: game.settings.get('core', 'rollMode'),
            });

            return r;
        }
    }
}
