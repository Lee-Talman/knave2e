export default class Knave2eActorSheet extends ActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["knave2e", "sheet", "actor"],
            template: "systems/knave2e/templates/actor/actor-sheet.hbs",
            width: 600,
            height: 800,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "character" }]
        });
    }

    get template() {
        return `systems/knave2e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }

    getData() {
        const context = super.getData();

        // Use a safe clone of the actor data for further operations.
        const actorData = this.actor.toObject(false);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system;
        context.flags = actorData.flags;

        // Prepare character data and items.
        if (actorData.type == 'character') {
            //this._prepareItems(context);
            this._prepareCharacterData(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        // Prepare active effects
        // context.effects = prepareActiveEffectCategories(this.actor.effects);


        return context;
    }

    _prepareCharacterData(context) {
        const systemData = context.system;

        const { currentLevel, progress } = this._calculateLevelAndProgress(systemData.xp.value);
        systemData.level = currentLevel;
        systemData.xp.progress = progress;
        systemData.hitPoints.progress = Math.floor((systemData.hitPoints.value / systemData.hitPoints.max) * 100);
        systemData.wounds.progress = Math.floor(((systemData.wounds.max - systemData.wounds.value) / systemData.wounds.max) * 100);

        this._updateSlots(context);
    }

    _calculateLevelAndProgress(xp) {
        let currentLevel;
        let progress;

        switch (true) {
            case xp >= 0 && xp < 2000:
                currentLevel = 1;
                progress = Math.floor((xp / 2000) * 100);
                break;
            case xp >= 2000 && xp < 4000:
                currentLevel = 2;
                progress = Math.floor(((xp - 2000) / 2000) * 100);
                break;
            case xp >= 4000 && xp < 8000:
                currentLevel = 3;
                progress = Math.floor(((xp - 4000) / 4000) * 100);
                break;
            case xp >= 8000 && xp < 16000:
                currentLevel = 4;
                progress = Math.floor(((xp - 8000) / 8000) * 100);
                break;
            case xp >= 16000 && xp < 32000:
                currentLevel = 5;
                progress = Math.floor(((xp - 16000) / 16000) * 100);
                break;
            case xp >= 32000 && xp < 64000:
                currentLevel = 6;
                progress = Math.floor(((xp - 32000) / 32000) * 100);
                break;
            case xp >= 64000 && xp < 125000:
                currentLevel = 7;
                progress = Math.floor(((xp - 64000) / 61000) * 100);
                break;
            case xp >= 125000 && xp < 250000:
                currentLevel = 8;
                progress = Math.floor(((xp - 125000) / 125000) * 100);
                break;
            case xp >= 250000 && xp < 500000:
                currentLevel = 9;
                progress = Math.floor(((xp - 250000) % 250000) * 100);
                break;
            case xp >= 500000:
                currentLevel = 10;
                progress = 100;
                break;
            default:
                currentLevel = 1;
                progress = 0;
                break;
        }
        return { currentLevel, progress };
    }

    _updateSlots(context) {

        const systemData = context.system;

        // Check max slots
        systemData.slots.max = systemData.slots.max - systemData.wounds.value;

        // Sum item slots...
        const itemSlots = context.items.reduce((total, item) => {
            return total + item.system.slots;
        }, 0);
        console.log(itemSlots);

        // Sum coin slots
        const coinSlots = Math.ceil(systemData.coins / 500);
        console.log(coinSlots);

        // Add up used slots
        systemData.slots.used = itemSlots + coinSlots;
        console.log(systemData.slots.used);

        // If slots > max, start dropping items...
        if (systemData.slots.used > systemData.slots.max) {
            const overflowSlots = systemData.slots.used - systemData.slots.max;
            let slotCounter = 0; // count up to systemData.slots.used to derive how many discrete items to drop
            for (let i = 0; i < Math.min(overflowSlots, context.items.length); i++) {
                const currentItem = context.items[i];
                currentItem.system.dropped = true;

                // Make sure to account for multi-slot items
                slotCounter = slotCounter + currentItem.system.slots;
                if (slotCounter >= overflowSlots) {
                    break;
                }
            }
        }
    }

    _rest() {
        // event.preventDefault();
        const systemData = this.actor.system;
        console.log("rest button clicked");

        return this.actor.update(
            {
                "system.hitPoints.value": systemData.hitPoints.max,
                "system.wounds.value": Math.max(systemData.wounds.value - 1, 0)
            });
    }

    _updateXPProgressBar() {
        const progress = this.getData().system.xp.progress;
        const xpProgressBar = $('#xp-progress-bar');
        const xpProgressValue = $('#xp-progress-value');

        xpProgressValue.css({
            'width': progress + '%',
            'background-color': 'red'
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Render the item sheet for viewing/editing prior to the editable check.
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Add Inventory Item
        html.find('.item-create').click(this._onItemCreate.bind(this));

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.delete();
            li.slideUp(200, () => this.render(false));
        });

        // Active Effect management
        html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

        // Rollable abilities.
        html.find('.rollable').click(this._onRoll.bind(this));

        // Rest button.
        html.find('.rest-button').click(this._rest.bind(this));



        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            html.find('li.item').each((i, li) => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });
        }
    }

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            system: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system["type"];

        // Finally, create the item!
        return await Item.create(itemData, { parent: this.actor });
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    _onRoll(event) {
        // event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        console.log("Roll Data:");
        console.log(this.actor.getRollData());

        console.log("dataset.roll");
        console.log(dataset.roll);

        // Handle item rolls.
        if (dataset.rollType) {
            if (dataset.rollType == 'item') {
                const itemId = element.closest('.item').dataset.itemId;
                const item = this.actor.items.get(itemId);
                if (item) return item.roll();
            }
        }

        // Handle plain-text roll formulas
        if (dataset.roll) {
            if (event.shiftKey) {
                console.log("Shift Click!"); // @TODO: Add optional modifier pop-up
            }
            else {
                let label = dataset.label ?
                    `[${game.i18n.localize("KNAVE2E.Check")}]
                  ${game.i18n.localize(dataset.label)}` : '';
                let roll = new Roll(dataset.roll, this.actor.getRollData());

                roll.toMessage({
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    flavor: game.i18n.localize(label),
                    rollMode: game.settings.get('core', 'rollMode'),
                });
                return roll;
            }
        }
    }
}