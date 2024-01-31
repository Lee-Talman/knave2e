/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class Knave2eItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["knave2e", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/knave2e/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Prepare weapon data and items.
    if (itemData.type == "weapon") {
      this._prepareWeaponData(context);
    }

    // Prepare armor data and items.
    if (itemData.type == "armor") {
      this._prepareArmorData(context);
    }

    // Prepare spellbook data and items.
    if (itemData.type == "spellbook") {
      this._prepareSpellbookData(context);
    }

    // Prepare equipment data (no items).
    if (itemData.type == "equipment") {
      this._prepareEquipmentData(context);
    }

    // Prepare ammo data and items.
    if (itemData.type == "ammo") {
      this._prepareAmmoData(context);
    }

    // Prepare coin data (no items).
    if (itemData.type == "coin") {
      this._prepareCoinData(context);
    }

    return context;
  }

  _prepareWeaponData(context) {
    
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
