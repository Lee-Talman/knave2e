import { onAttack, onDamageFromSheet, onCast } from "../helpers/items.mjs";

export default class Knave2eActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["knave2e", "sheet", "actor"],
      width: 640,
      height: 670,
      dragDrop: [
        { dragSelector: ".item-list .item", dropSelector: null },
        { dragSelector: ".knave-item", dropSelector: null },
      ],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "character",
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
    if (actorData.type == "character") {
      this._prepareCharacterData(context);
    }

    if (actorData.type == "recruit") {
      this._prepareRecruitData(context);
    }

    if (actorData.type == "monster") {
      this._prepareMonsterData(context);
    }

    if (actorData.type == "vehicle") {
      this._prepareVehicleData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Add enriched HTML for text editors
    context.system.enrichedHTML = await TextEditor.enrichHTML(
      context.system.description
    );

    // Add global knave2e settings for sheet logic
    context.system.settings = {};

    for (let [key, value] of game.settings.settings) {
      if (key.includes("knave2e")) {
        let filteredKey = key.replace("knave2e.", "");
        let filteredValue = game.settings.get("knave2e", filteredKey);
        context.system.settings[filteredKey] = filteredValue;
      }
    }

    return context;
  }

  _prepareCharacterData(context) {
    const systemData = context.system;

    // Handle Armor
    if (game.settings.get("knave2e", "automaticArmor")) {
      const { armorPoints, armorClass } = this._updateArmor(context);
      systemData.armorPoints = armorPoints;
      systemData.armorClass = armorClass;
    }

    // Handle Blessings
    systemData.blessings.value = this._updateBlessings(context);

    // Handle Companions
    if (game.settings.get("knave2e", "enforceCompanions")) {
      if (systemData.companions.value > systemData.companions.max) {
        systemData.companions.value = Math.min(
          systemData.companions.value,
          systemData.companions.max
        );
      }
    }

    // Handle HP & Wounds
    const { hitPointsProgress, woundsProgress } = this._updateHealth(context);
    systemData.hitPoints.progress = hitPointsProgress;
    systemData.wounds.progress = woundsProgress;

    // Handle Level/XP
    if (game.settings.get("knave2e", "automaticLevel")) {
      const { currentLevel, progress } = this._updateLevelAndXP(
        systemData.xp.value
      );
      systemData.level = currentLevel;
      systemData.xp.progress = progress;
    } else {
      systemData.xp.progress = 0;
    }

    // Handle Light
    if (game.settings.get("knave2e", "automaticLight")) {
      this._updateLight(context);
    }

    // Handle Slots
    if (game.settings.get("knave2e", "automaticSlots")) {
      const { maxSlots, usedSlots } = this._updateTotalSlots(context);
      systemData.slots.max = maxSlots;
      systemData.slots.value = usedSlots;
    } else {
      systemData.slots.value = this._updateUsedSlots(context);
    }

    if (game.settings.get("knave2e", "enforceIntegerSlots")) {
      systemData.slots.value = Math.ceil(systemData.slots.value);
      systemData.slots.max = Math.ceil(systemData.slots.max);
    } else {
      systemData.slots.value = Number(systemData.slots.value.toPrecision(2));
      systemData.slots.max = Number(systemData.slots.max.toPrecision(2));
    }
  }

  _prepareRecruitData(context) {
    context.recruitCategories = this._labelOptions(
      CONFIG.SYSTEM.RECRUIT.CATEGORIES
    );
    context.rarityCategories = {
      "KNAVE2E.Common": "KNAVE2E.Common",
      "KNAVE2E.Uncommon": "KNAVE2E.Uncommon",
      "KNAVE2E.Rare": "KNAVE2E.Rare",
    };

    const systemData = context.system;

    // Handle Recruit Details
    if (game.settings.get("knave2e", "automaticRecruits")) {
      this._updateRecruitCategoryDetails(context);
    }

    // Handle Armor
    if (game.settings.get("knave2e", "automaticArmor")) {
      const { armorPoints, armorClass } = this._updateArmor(context);
      systemData.armorPoints = armorPoints;
      systemData.armorClass = armorClass;
    }

    // Handle HP
    systemData.hitPoints.progress = this._updateHealth(context);

    // Handle Light
    if (game.settings.get("knave2e", "automaticLight")) {
      this._updateLight(context);
    }

    // Handle Slots
    if (game.settings.get("knave2e", "automaticRecruits")) {
      const { maxSlots, usedSlots } = this._updateTotalSlots(context);
      systemData.slots.max = maxSlots;
      systemData.slots.value = usedSlots;
    } else {
      systemData.slots.value = this._updateUsedSlots(context);
    }

    if (game.settings.get("knave2e", "enforceIntegerSlots")) {
      systemData.slots.value = Math.ceil(systemData.slots.value);
      systemData.slots.max = Math.ceil(systemData.slots.max);
    } else {
      systemData.slots.value = Number(systemData.slots.value.toPrecision(2));
      systemData.slots.max = Number(systemData.slots.max.toPrecision(2));
    }
  }

  _prepareMonsterData(context) {
    const systemData = context.system;

    systemData.hitPoints.progress = this._updateHealth(context);

    // Automatic AC, AP, and Armor Types
    if (game.settings.get("knave2e", "automaticArmor")) {
      systemData.armorPoints = systemData.armorClass - 11;
    }
    
  }

  _prepareVehicleData(context) {
    const systemData = context.system;
    systemData.slots.value = this._updateUsedSlots(context);
    
    if (game.settings.get("knave2e", "enforceIntegerSlots")) {
      systemData.slots.value = Math.ceil(systemData.slots.value);
      systemData.slots.max = Math.ceil(systemData.slots.max);
    } else {
      systemData.slots.value = Number(systemData.slots.value.toPrecision(2));
      systemData.slots.max = Number(systemData.slots.max.toPrecision(2));
    }

    systemData.crew = Math.ceil(systemData.crew)
    systemData.cost = Math.ceil(systemData.cost)
  }

  _updateTotalSlots(context) {
    const systemData = context.system;
    let maxSlots;

    // Check max slots
    if (game.settings.get("knave2e", "automaticSlots")) {
      if (this.actor.type === "character") {
        maxSlots =
          10 +
          systemData.abilities["constitution"].value -
          (systemData.wounds.max - systemData.wounds.value);
      } else if (this.actor.type === "recruit") {
        maxSlots = 10;
      }
    } else {
      maxSlots = systemData.slots.max;
    }

    const usedSlots = this._updateUsedSlots(context);

    if (game.settings.get("knave2e", "enforceDrop")) {
      // If slots > max, start dropping items...
      if (usedSlots > maxSlots) {
        const overflowSlots = usedSlots - maxSlots;
        let slotCounter = 0; // count up to systemData.slots.value to derive how many discrete items to drop
        for (
          let i = 0;
          i < Math.min(overflowSlots, context.items.length);
          i++
        ) {
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

    return { maxSlots, usedSlots };
  }

  _updateUsedSlots(context) {
    const systemData = context.system;
    // Sum item slots...
    const itemSlots = context.items.reduce((total, item) => {
      return total + item.system.slots;
    }, 0);

    const coinsPerSlot = game.settings.get("knave2e", "coinsPerSlot");
    const arrowsPerSlot = game.settings.get("knave2e", "arrowsPerSlot");
    const bulletsPerSlot = game.settings.get("knave2e", "slingBulletsPerSlot");

    // Sum coin slots
    const coinSlots = coinsPerSlot === 0 ? 0 : systemData.coins / coinsPerSlot;

    // Sum ammo slots
    const arrowSlots =
      arrowsPerSlot === 0 ? 0 : systemData.ammo.arrow / arrowsPerSlot;
    const bulletSlots =
      bulletsPerSlot === 0 ? 0 : systemData.ammo.bullet / bulletsPerSlot;
    const ammoSlots = arrowSlots + bulletSlots;

    // Add up used slots
    const usedSlots = itemSlots + coinSlots + ammoSlots;

    return usedSlots;
  }

  _updateArmor(context) {
    const armorPieces = context.items.filter(
      (i) =>
        i.type === "armor" &&
        i.system.dropped === false &&
        i.system.equipped === true
    );
    let armorPoints = 0;
    let armorClass = 11;

    if (game.settings.get("knave2e", "enforceArmor")) {
      const uniqueCategories = [];
      armorPoints = 0;

      const uniqueArmorPieces = armorPieces.filter((i) => {
        if (!uniqueCategories.some((cat) => cat === i.system.category)) {
          uniqueCategories.push(i.system.category);
          armorPoints = Math.max(armorPoints + i.system.armorPoints, 0);
          return true;
        }
        const item = this.actor.items.get(i._id);
        item.update({ "system.equipped": false });
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

  _updateHealth(context) {
    const systemData = context.system;
    const hitPointsProgress = Math.floor(
      (systemData.hitPoints.value / systemData.hitPoints.max) * 100
    );

    if (this.actor.type === "recruit" || this.actor.type === "monster") {
      systemData.hitPoints.value = Math.min(
        systemData.hitPoints.value,
        systemData.hitPoints.max
      );
      return hitPointsProgress;
    } else if (this.actor.type === "character") {
      systemData.hitPoints.value = Math.min(
        systemData.hitPoints.value,
        systemData.hitPoints.max
      );
      systemData.wounds.value = Math.min(
        systemData.wounds.value,
        systemData.wounds.max
      );
      const woundsProgress = Math.floor(
        (systemData.wounds.value / systemData.wounds.max) * 100
      );

      return { hitPointsProgress, woundsProgress };
    }
  }

  _updateBlessings(context) {
    const activeBlessings = context.items.filter(
      (i) =>
        i.system.relic && i.system.relic.isActive && i.system.dropped === false
    );

    return activeBlessings.length;
  }

  _updateLight(context) {
    const litItems = context.items.filter(
      (i) =>
        i.type === "lightSource" &&
        i.system.lit === true &&
        i.system.dropped === false
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
              type: "torch",
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
              type: "none",
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

    if (
      systemData.category === "hireling" ||
      systemData.category === "mercenary"
    ) {
      systemData.costPerMonth = category.costPerMonth;
      systemData.morale = category.morale;
      systemData.rarity = "KNAVE2E.Common";
      systemData.spells.max = 0;
    } else if (systemData.category === "expert") {
      switch (systemData.rarity) {
        case "KNAVE2E.Common":
          systemData.costPerMonth = 600;
          systemData.morale = category.morale;
          systemData.rarity = "KNAVE2E.Common";
          systemData.spells.max = 0;
          break;
        case "KNAVE2E.Uncommon":
          systemData.costPerMonth = 1200;
          systemData.morale = category.morale;
          systemData.rarity = "KNAVE2E.Uncommon";
          systemData.spells.max = 0;
          break;
        case "KNAVE2E.Rare":
          systemData.costPerMonth = 2400;
          systemData.morale = category.morale;
          systemData.rarity = "KNAVE2E.Rare";
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
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".knave-item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Return if sheet is not editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".knave-item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    // Rollable elements (e.g. Abilities)
    html.on("click", ".rollable", this._onRollable.bind(this));

    // Item Description to chat
    html.on("click", ".item-name", this._onItemName.bind(this));

    // Toggle Item Icons
    html.on("click", ".item-toggle", this._onItemToggle.bind(this));

    /* -------------------------------------------- */
    /*  Item Rolls                                  */
    /* -------------------------------------------- */

    // Attack Roll
    html.on("click", ".item-button.attack", onAttack.bind(this));

    // Sheet Damage/Direct rolls (chat button rolls handled in './documents/chat-message.mjs')
    html.on("click", ".item-button.damage.sheet", onDamageFromSheet.bind(this));

    // Cast Spell
    html.on("click", ".item-button.cast", onCast.bind(this));

    /* -------------------------------------------- */
    /*  Sheet Buttons                               */
    /* -------------------------------------------- */

    // Checks & Abilities.
    html.on("click", ".actor-button.check", this._onCheck.bind(this));

    // Armor Points for Player-Facing Rolls
    html.on("click", ".actor-button.ap", this._onAP.bind(this));

    // Resting
    html.on("click", ".actor-button.rest", this._onRest.bind(this));

    // Morale
    html.on("click", ".actor-button.morale", this._onMorale.bind(this));

    // Number Appearing
    html.on(
      "click",
      ".actor-button.numberAppearing",
      this._onNumberAppearing.bind(this)
    );

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

    const li = a.closest("li");
    const item = li.dataset.itemId
      ? this.actor.items.get(li.dataset.itemId)
      : null;

    if (item.system.description !== "") {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${item.name}`,
        content: `${item.system.description}`,
        rollMode: game.settings.get("core", "rollMode"),
      });
    }
  }

  async _onItemToggle(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const systemData = this.actor.system;

    // Find closest <li> element containing a "data-item-id" attribute
    const li = a.closest("li");
    const item = li.dataset.itemId
      ? this.actor.items.get(li.dataset.itemId)
      : null;

    switch (a.dataset.action) {
      case "break":
        return item.update({ "system.broken": !item.system.broken });
      case "cast":
        return item.update({ "system.cast": !item.system.cast });
      case "equip":
        return item.update({ "system.equipped": !item.system.equipped });
      case "blessing":
        if (game.settings.get("knave2e", "enforceBlessings")) {
          if (item.system.relic.isActive) {
            this.actor.update({
              "system.blessings.value": systemData.blessings.value - 1,
            });
            return item.update({ "system.relic.isActive": false });
          } else if (systemData.blessings.value < systemData.blessings.max) {
            this.actor.update({
              "system.blessings.value": systemData.blessings.value + 1,
            });
            return item.update({
              "system.relic.isActive": !item.system.relic.isActive,
            });
          } else if (systemData.blessings.value >= systemData.blessings.max) {
            Dialog.prompt({
              title: `${game.i18n.localize("KNAVE2E.BlessingDialogTitle")}`,
              content: `${this.actor.name} ${game.i18n.localize(
                "KNAVE2E.BlessingDialogContentMax"
              )}`,
              label: "OK",
              callback: (html) => {
                return;
              },
            });
            return;
          }
        } else {
          return item.update({
            "system.relic.isActive": !item.system.relic.isActive,
          });
        }
      case "light":
        return item.update({ "system.lit": !item.system.lit });
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
    const rollMode = game.settings.get("core", "rollMode");

    rollMod = await Dialog.wait({
      title: "Check",
      content: "Add a bonus to this Check?", //todo: localize
      buttons: {
        standard: {
          label: game.i18n.localize("KNAVE2E.Level"),
          callback: () => {
            return systemData.level;
          },
        },
        half: {
          label: game.i18n.localize("KNAVE2E.HalfLevel"),
          callback: () => {
            return Math.floor(systemData.level / 2);
          },
        },
        zero: {
          label: game.i18n.localize("KNAVE2E.None"),
          callback: () => {
            return 0;
          },
        },
      },
      default: "standard",
      // close: () => { reject() },
    });

    r = new Roll("1d20 + @mod", { mod: rollMod });
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

    let r = new Roll("d20+@ap", { ap: context.system.armorPoints });

    r.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `[Reverse AP] ${this.actor.name}: `,
      rollMode: game.settings.get("core", "rollMode"),
    });
  }

  async _onNumberAppearing(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const systemData = this.actor.system;

    let formula;
    let rollFlavor;

    let type = await Dialog.wait({
      title: `${game.i18n.localize("KNAVE2E.NumberAppearingDialogTitle")}`,
      buttons: {
        dungeon: {
          label: `${game.i18n.localize("KNAVE2E.NumberAppearingDungeon")} (${
            systemData.numberAppearing.dungeon
          })`,
          callback: () => {
            return "dungeon";
          },
        },
        wilderness: {
          label: `${game.i18n.localize("KNAVE2E.NumberAppearingWilderness")} (${
            systemData.numberAppearing.wilderness
          })`,
          callback: () => {
            return "wilderness";
          },
        },
        cancel: {
          label: game.i18n.localize("KNAVE2E.Cancel"),
          callback: () => {
            return;
          },
        },
      },
      default: "dungeon",
    });

    if (type) {
      formula =
        type === "dungeon"
          ? systemData.numberAppearing.dungeon
          : type === "wilderness"
          ? systemData.numberAppearing.wilderness
          : null;
      rollFlavor =
        type === "dungeon"
          ? "KNAVE2E.AppearInDungeon"
          : type === "wilderness"
          ? "KNAVE2E.AppearInWilderness"
          : null;
    }

    if (formula) {
      let r = await new Roll(formula);
      r.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${this.actor.name}${game.i18n.localize(rollFlavor)}`,
        rollMode: game.settings.get("core", "rollMode"),
      });
    }
  }

  async _onItemCreate(event) {
    event.preventDefault();

    let itemType;

    if (this.actor.type === "monster") {
      itemType = "monsterAttack";
    } else {
      // Get the type of item to create.
      itemType = await Dialog.wait({
        title: `${game.i18n.localize("KNAVE2E.CreateItemDialogHeader")}`,
        content: `${game.i18n.localize("KNAVE2E.CreateItemDialogContent")}`,
        buttons: {
          armor: {
            label: game.i18n.localize("KNAVE2E.Armor"),
            callback: () => {
              return "armor";
            },
          },
          equipment: {
            label: game.i18n.localize("KNAVE2E.Equipment"),
            callback: () => {
              return "equipment";
            },
          },
          lightSource: {
            label: game.i18n.localize("KNAVE2E.LightSource"),
            callback: () => {
              return "lightSource";
            },
          },
          spellbook: {
            label: game.i18n.localize("KNAVE2E.Spellbook"),
            callback: () => {
              return "spellbook";
            },
          },
          weapon: {
            label: game.i18n.localize("KNAVE2E.Weapon"),
            callback: () => {
              return "weapon";
            },
          },
        },
        default: "weapon",
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
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  async _onMorale(event) {
    event.preventDefault();
    const systemData = this.actor.system;

    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");

    let r = new Roll("2d6");
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
    const systemData = this.actor.system;

    let spellbookChanges = this.actor.items
      .filter((i) => i.type === "spellbook")
      .map((i) => ({ _id: i.id, "system.cast": false }));
    this.actor.updateEmbeddedDocuments("Item", spellbookChanges);

    // Recruits have no wounds to recover
    if (this.actor.type === "recruit") {
      return this.actor.update({
        "system.hitPoints.value": systemData.hitPoints.max,
        "system.spells.value": 0,
      });
    } else {
      const restType = await Dialog.wait({
        title: `${game.i18n.localize("KNAVE2E.RestDialogTitle")}`,
        content: `${game.i18n.localize("KNAVE2E.RestDialogContent")}`,
        buttons: {
          standard: {
            label: game.i18n.localize("KNAVE2E.Standard"),
            callback: () => {
              return "standard";
            },
          },
          safe: {
            label: game.i18n.localize("KNAVE2E.SafeHaven"),
            callback: () => {
              return "safe";
            },
          },
        },
        default: "standard",
        // close: () => { reject() },
      });

      if (restType === "standard") {
        return this.actor.update({
          "system.hitPoints.value": systemData.hitPoints.max,
          "system.spells.value": 0,
        });
      } else if (restType === "safe") {
        return this.actor.update({
          "system.hitPoints.value": systemData.hitPoints.max,
          "system.wounds.value": Math.min(
            systemData.wounds.value + 1,
            systemData.wounds.max
          ),
          "system.spells.value": 0,
        });
      }
    }
  }

  async _onRollable(event) {
    // event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.dataType) {
      if (dataset.dataType == "item") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle plain-text roll formulas
    if (dataset.roll) {
      let label = dataset.label
        ? `[${game.i18n.localize("KNAVE2E.Check")}]
                  ${game.i18n.localize(dataset.label)}`
        : "";
      let r = await new Roll(dataset.roll, this.actor.getRollData());

      r.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: game.i18n.localize(label),
        rollMode: game.settings.get("core", "rollMode"),
      });

      return r;
    }
  }

  _updateLevelAndXP(xp) {
    let currentLevel = 1;
    let progress = 0;
    const base = game.settings.get("knave2e", "baseLevelXP");

    switch (true) {
      case xp >= 0 && xp < base:
        currentLevel = 1;
        progress = Math.floor((xp / base) * 100);
        break;
      case xp >= base && xp < base * 2:
        currentLevel = 2;
        progress = Math.floor(((xp - base) / base) * 100);
        break;
      case xp >= base * 2 && xp < base * 4:
        currentLevel = 3;
        progress = Math.floor(((xp - base * 2) / (base * 2)) * 100);
        break;
      case xp >= base * 4 && xp < base * 8:
        currentLevel = 4;
        progress = Math.floor(((xp - base * 4) / (base * 4)) * 100);
        break;
      case xp >= base * 8 && xp < base * 16:
        currentLevel = 5;
        progress = Math.floor(((xp - base * 8) / (base * 8)) * 100);
        break;
      case xp >= base * 16 && xp < base * 32:
        currentLevel = 6;
        progress = Math.floor(((xp - base * 16) / (base * 16)) * 100);
        break;
      case xp >= base * 32 && xp < base * 62.5:
        currentLevel = 7;
        progress = Math.floor(((xp - base * 32) / (base * 32)) * 100);
        break;
      case xp >= base * 62.5 && xp < base * 125:
        currentLevel = 8;
        progress = Math.floor(((xp - base * 62.5) / (base * 62.5)) * 100);
        break;
      case xp >= base * 125 && xp < base * 250:
        currentLevel = 9;
        progress = Math.floor(((xp - base * 125) / (base * 125)) * 100);
        break;
      case xp >= base * 250:
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
}
