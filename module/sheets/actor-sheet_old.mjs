export class Knave2eActorSheet extends ActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["knave2e", "sheet", "actor"],
      template: "systems/knave2e/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "abilities" }]
    });
  }

  get template() {
    return `systems/knave2e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  getData() {
    const context = super.getData();
    console.log(context);

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare recruit data and items.
    if (actorData.type == 'recruit') {
      this._prepareItems(context);
      this._prepareRecruitData(context);
    }

    // Prepare monster data (no items).
    if (actorData.type == 'monster') {
      this._prepareMonsterData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  _prepareCharacterData(context) {
    // Handle ability score localization for the loop in actor-character-sheet.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.KNAVE2E.abilities[k]) ?? k;
    }
  }

  _prepareItems(context) {
    // Sum the slots for every item to compare to slots.value
    const usedSlots = context.items.reduce((sum, { system: { itemSlots: { value = 0 } } }) => sum + value, 0);

    // Derive the dropped slots resulting from excess items or wounds
    let droppedSlots = usedSlots - context.system.slots.value;
    if (droppedSlots > 0) {
      let slotCounter = 0; // count up to droppedSlots to derive how many discrete items to drop
      for (let i = 0; i < Math.min(droppedSlots, context.items.length); i++) {
        const currentItem = context.items[i];
        currentItem.system.dropped.value = true;
        slotCounter = slotCounter + currentItem.system.itemSlots.value;
        if (slotCounter >= droppedSlots) {
          break;
        }
      }
    }
    this._prepareWeapons(context);
  }

  _prepareWeapons(context) {
    const melee = context.system.abilities.str.value;
    const ranged = context.system.abilities.wis.value;

    context.system.preparedWeapons = [{
        id: "p01",
        img: "icons/svg/item-bag.svg",
        name: "Punch",
        attackBonus: {
          type: melee,
          roll: `1d20 + ${melee}`
        },
        damage: "d2"
    }];
    for (let item of context.items) {
      if (item.type === "weapon" && item.system.dropped.value == false) {
        let derivedAttackValue = item.system.attackBonus === "str" ? melee : item.system.attackBonus === "wis" ? ranged : 0;

        context.system.preparedWeapons.push({
          id: item._id,
          img: item.img,
          name: item.name,
          attackBonus:{
            type: derivedAttackValue,
            roll: `1d20 + ${derivedAttackValue}`,
          },
          damage: item.system.damage.value
        });
      }
    }
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    if (!this.isEditable) return;

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    html.find('.rollable').click(this._onRoll.bind(this));

    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    delete itemData.system["type"];

    return await Item.create(itemData, { parent: this.actor });
  }


  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}