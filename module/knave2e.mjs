// Import document classes.
//import { Knave2eActor } from "./documents/actor.mjs";
//import { Knave2eItem } from "./documents/item.mjs";
// Import sheet classes.
//import { Knave2eActorSheet } from "./sheets/actor-sheet.mjs";
//import { Knave2eItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
// Import DataModel classes.

import { Knave2eCharacter, Knave2eWeapon } from "./data/_module.mjs"
import { Knave2eActor, Knave2eItem } from "./documents/_module.mjs";
import { Knave2eActorSheet, Knave2eItemSheet } from "./sheets/_module.mjs";
import { SYSTEM } from "./config/system.mjs";
// globalThis.SYSTEM = SYSTEM;


/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.on("init", () => {
  CONFIG.Actor.dataModels.character = Knave2eCharacter;
  CONFIG.Item.dataModels.weapon = Knave2eWeapon;
});

Hooks.once("init", () => {
  CONFIG.SYSTEM = SYSTEM;
});

Hooks.once("i18nInit", function() {

  // Apply localizations
  const toLocalize = [
    "ABILITIES", "AMMO", "ARMOR", "COIN", "EQUIPMENT", "SPELLBOOK", "WEAPON"];
  for ( let c of toLocalize ) {
    const conf = foundry.utils.getProperty(SYSTEM, c);
    for ( let [k, v] of Object.entries(conf) ) {
      if ( v.label ) v.label = game.i18n.localize(v.label);
      if ( v.abbreviation) v.abbreviation = game.i18n.localize(v.abbreviation);
      if ( typeof v === "string" ) conf[k] = game.i18n.localize(v);
    }
  }
});

Hooks.once('init', function () {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.knave2e = {
    Knave2eActor,
    Knave2eItem,
    rollItemMacro
  };

  // globalThis.knave2e = game.system;
  // game.system.CONST = SYSTEM;

  CONFIG.Combat.initiative = {
    formula: "1d20 + @abilities.charisma.value",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = Knave2eActor;
  CONFIG.Item.documentClass = Knave2eItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("knave2e", Knave2eActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("knave2e", Knave2eItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function () {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.knave2e.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "knave2e.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}