export async function checkDialog(data) {
  let attackBonus = await Dialog.wait({
    title: "Check",
    content: `${game.i18n.localize(
      "KNAVE2E.CheckDialog"
    )}<br>${game.i18n.localize("KNAVE2E.SkipDialog")}<br>`,
    buttons: {
      standard: {
        label: `${game.i18n.localize("KNAVE2E.Level")} (${data.level})`,
        callback: () => {
          return data.level;
        },
      },
      half: {
        label: `${game.i18n.localize("KNAVE2E.HalfLevel")} (${Math.floor(
          data.level / 2
        )})`,
        callback: () => {
          return Math.floor(data.level / 2);
        },
      },
      zero: {
        label: game.i18n.localize("KNAVE2E.None"),
        callback: () => {
          return "";
        },
      },
    },
    default: "standard",
  });

  return attackBonus;
}

export async function damageDialog() {
  let powerAttack = await Dialog.wait({
    title: `${game.i18n.localize("KNAVE2E.Damage")}`,
    content: `${game.i18n.localize(
      "KNAVE2E.DamageDialog"
    )}<br/>${game.i18n.localize("KNAVE2E.SkipDialog")}<br/>`,
    buttons: {
      standard: {
        label: game.i18n.localize("KNAVE2E.Standard"),
        callback: async () => {
          return false;
        },
      },
      power: {
        label: game.i18n.localize("KNAVE2E.PowerAttack"),
        callback: async () => {
          return true;
        },
      },
    },
    default: "standard",
  });

  return powerAttack;
}

export async function onCast(event) {
  event.preventDefault();
  const a = event.currentTarget;

  const li = a.closest("li");
  const item = li.dataset.itemId
    ? this.actor.items.get(li.dataset.itemId)
    : null;
  const itemData = item.system;
  const systemData = this.actor.system;

  if (game.settings.get("knave2e", "automaticSpells")) {
    // Reminder if actor cannot cast spells
    if (systemData.spells.max <= 0) {
      Dialog.prompt({
        title: `${game.i18n.localize("KNAVE2E.CastDialogTitle")}`,
        content: `${this.actor.name} ${game.i18n.localize(
          "KNAVE2E.CastDialogContentMax"
        )}`,
        label: "OK",
        callback: (html) => {
          return;
        },
      });
      return;
    } else if (systemData.spells.value >= systemData.spells.max) {
      Dialog.prompt({
        title: `${game.i18n.localize("KNAVE2E.CastDialogTitle")}`,
        content: `${this.actor.name} ${game.i18n.localize(
          "KNAVE2E.CastDialogContentValue"
        )}`,
        label: "OK",
        callback: (html) => {
          return;
        },
      });
      return;
    } else if (itemData.cast === true) {
      Dialog.prompt({
        title: `${game.i18n.localize("KNAVE2E.CastDialogTitle")}`,
        content: `${this.actor.name} ${game.i18n.localize(
          "KNAVE2E.CastDialogContentUsed"
        )}`,
        label: "OK",
        callback: (html) => {
          return;
        },
      });
      return;
    } else {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        // flavor: `${this.actor.name} ${game.i18n.localize("KNAVE2E.Casts")}`,
        content: `<br><h3>${item.name}</h3>${itemData.description}`,
        rollMode: game.settings.get("core", "rollMode"),
      });

      // Cast spell and increment actor's used spells
      if (game.settings.get("knave2e", "enforceSpells")) {
        item.update({
          "system.cast": true,
        });
      }
      this.actor.update({
        "system.spells.value": systemData.spells.value + 1,
      });
    }
  } else {
    if (game.settings.get("knave2e", "enforceSpells")) {
      if (itemData.cast === true) {
        Dialog.prompt({
          title: `${game.i18n.localize("KNAVE2E.CastDialogTitle")}`,
          content: `${this.actor.name} ${game.i18n.localize(
            "KNAVE2E.CastDialogContentUsed"
          )}`,
          label: "OK",
          callback: (html) => {
            return;
          },
        });
        return;
      } else {
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          // flavor: `${this.actor.name} ${game.i18n.localize("KNAVE2E.Casts")}`,
          content: `<br><h3>${item.name}</h3>${itemData.description}`,
          rollMode: game.settings.get("core", "rollMode"),
        });

        item.update({
          "system.cast": true,
        });

        this.actor.update({
          "system.spells.value": systemData.spells.value + 1,
        });
      }
    } else {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        // flavor: `${this.actor.name} ${game.i18n.localize("KNAVE2E.Casts")}`,
        content: `<br><h3>${item.name}</h3>${itemData.description}`,
        rollMode: game.settings.get("core", "rollMode"),
      });

      this.actor.update({
        "system.spells.value": systemData.spells.value + 1,
      });
    }
  }
}

export async function onAttack(event) {
  event.preventDefault();
  const a = event.currentTarget;

  const li = a.closest("li");
  const item = li.dataset.itemId
    ? this.actor.items.get(li.dataset.itemId)
    : null;
  const itemData = item.system;
  const hasDescription = itemData.description === "" ? false : true;
  const systemData = this.actor.system;

  // Return if the weapon is broken
  if (
    item.type === "weapon" &&
    itemData.broken === true &&
    game.settings.get("knave2e", "enforceBreaks")
  ) {
    Dialog.prompt({
      title: `${game.i18n.localize("KNAVE2E.Item")} ${game.i18n.localize(
        "KNAVE2E.Broken"
      )}`,
      content: `${item.name} ${game.i18n.localize("KNAVE2E.IsBroken")}!`,
      label: "OK",
      callback: (html) => {
        return;
      },
    });

    return;
  }

  const speaker = ChatMessage.getSpeaker({ actor: this.actor });
  const rollMode = game.settings.get("core", "rollMode");
  let flavor = `${game.i18n.localize(
    "KNAVE2E.AttackRoll"
  )} ${game.i18n.localize("KNAVE2E.With")} ${item.name}`;

  // Override base roll function to deliver to ChatMessage
  let messageData = {
    data: {},
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    from: game.user._id,
    sound: "sounds/dice.wav",
    speaker: speaker,
    rollMode: rollMode,
  };

  // Pass item info for clickable Damage & Direct buttons in-chat. Will update item/buttons/flavor in-method
  const rollData = {
    data: {
      item: item._id,
      actor: this.actor._id,
      buttons: true,
      character: true,
      description: itemData.description,
      hasDescription: hasDescription,
    },
    flavor: flavor,
    rolls: [],
  };

  // Return early if a ranged weapon is out of ammo
  if (
    !hasAmmo(item, this.actor) &&
    game.settings.get("knave2e", "enforceAmmo")
  ) {
    Dialog.prompt({
      title: `${game.i18n.localize("KNAVE2E.OutOfAmmoTitleDialog")}`,
      content: `${this.actor.name} ${game.i18n.localize(
        "KNAVE2E.OutOfAmmoContentDialog"
      )} ${item.name}!`,
      label: "OK",
      callback: (html) => {
        return;
      },
    });

    return;
  }

  // Build the roll formula piecemeal
  const die = "1d20";
  let attackRollFormula;
  let attackRollBonus;

  /* -------------------------------------------- */
  /*  Attack Bonus                                */
  /* -------------------------------------------- */

  // Roll with level for recruits & monsters
  if (this.actor.type !== "character") {
    // Skip dialog window on shift + click, default to system level
    if (event.shiftKey === true) {
      attackRollBonus = systemData.level;
    } else {
      // get attack roll bonus from options
      attackRollBonus = await checkDialog(systemData);
    }
  }

  // Roll with abilities for characters
  else {
    attackRollBonus =
      itemData.category === "melee"
        ? systemData.abilities.strength.value.toString()
        : systemData.abilities.wisdom.value.toString();
  }

  /* -------------------------------------------- */
  /*  Attack Formula                              */
  /* -------------------------------------------- */

  // Evaluate a roll and determine post-roll effects
  attackRollFormula = `${die} + ${attackRollBonus}`;

  let r = new Roll(attackRollFormula, { data: rollData });
  await r.evaluate();

  // Weapons from characters or recruits can break
  if (item.type === "weapon") {
    if (game.settings.get("knave2e", "enforceBreaks")) {
      // Check for weapon break on natural 1
      if (r.terms[0].results[0].result === 1) {
        rollData.flavor = `${item.name} ${game.i18n.localize(
          "KNAVE2E.Breaks"
        )}!`;

        item.update({
          "system.broken": true,
        });

        // Turn off buttons for broken weapons
        rollData.data.buttons = false;
      }
    }
  }

  // Attack from characters get free maneuvers
  if (this.actor.type === "character") {
    if (r.total >= 21) {
      rollData.flavor = `${this.actor.name} ${game.i18n.localize(
        "KNAVE2E.ManeuverSuccess"
      )}`;
    }
  }

  // Remove direct damage button option for monsters
  else if (this.actor.type === "monster") {
    rollData.data.character = false;
  }

  /* -------------------------------------------- */
  /*  Attack Roll                                 */
  /* -------------------------------------------- */

  // Push roll to rolls[] array for Dice So Nice
  r.toolTip = await r.getTooltip();
  rollData.rolls.push(r);

  // Merge and push to chat message
  messageData = foundry.utils.mergeObject(messageData, rollData);
  messageData.content = await renderTemplate(
    "systems/knave2e/templates/item/item-chat-message.hbs",
    rollData
  );
  ChatMessage.create(messageData);
  // Check for ammo and decrement ammo counter
  function hasAmmo(item, actor) {
    const systemData = actor.system;

    // Reject monster and melee weapon attacks
    if (actor.type == "monster" || item.type !== "weapon" || item.system.category !== "ranged") {
      return true;
    }

    const ammoType = item.system.ammoType;

    if (game.settings.get("knave2e", "enforceAmmo")) {
      if (ammoType === "arrow" && systemData.ammo[ammoType] >= 1) {
        actor.update({
          "system.ammo.arrow": systemData.ammo.arrow - 1,
        });
        return true;
      } else if (ammoType === "bullet" && systemData.ammo[ammoType] >= 1) {
        actor.update({
          "system.ammo.bullet": systemData.ammo.bullet - 1,
        });
        return true;
      } else if (ammoType === "none") {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}

export async function onDamageFromChat(event) {
  event.preventDefault();
  const a = event.currentTarget;

  const button = a.closest("button");
  const actor = button.dataset.actorId
    ? game.actors.get(button.dataset.actorId)
    : null;
  const item = button.dataset.itemId
    ? actor.items.get(button.dataset.itemId)
    : null;

  _rollDamage(a, actor, item);
}

export async function onDamageFromSheet(event) {
  event.preventDefault();
  const a = event.currentTarget;

  // Find closest <li> element containing a "data-item-id" attribute
  const li = a.closest("li");
  const actor = this.actor;
  const item = li.dataset.itemId
    ? this.actor.items.get(li.dataset.itemId)
    : null;

  _rollDamage(a, actor, item);
}

async function _rollDamage(a, actor, item) {
  const systemData = actor.system;
  const itemData = item.system;

  const speaker = ChatMessage.getSpeaker({ actor: actor });
  const rollMode = game.settings.get("core", "rollMode");

  // Return if the weapon is broken
  if (
    item.type === "weapon" &&
    itemData.broken === true &&
    game.settings.get("knave2e", "enforceBreaks")
  ) {
    Dialog.prompt({
      title: `${game.i18n.localize("KNAVE2E.Item")} ${game.i18n.localize(
        "KNAVE2E.Broken"
      )}`,
      content: `${item.name} ${game.i18n.localize("KNAVE2E.IsBroken")}!`,
      label: "OK",
      callback: (html) => {
        return;
      },
    });

    return;
  }

  // Change rollFlavor depending on Damage/Direct/Power
  let rollFlavor = `${game.i18n.localize(
    "KNAVE2E.DamageRoll"
  )} ${game.i18n.localize("KNAVE2E.With")} ${item.name}`;

  let formula = `@amount@size+@bonus`;
  let amount = itemData.damageDiceAmount;
  const size = itemData.damageDiceSize;
  const bonus = itemData.damageDiceBonus;

  // Only characters can power attack
  if (actor.type === "character") {
    if (event.shiftKey === false) {
      const powerAttack = await damageDialog();
      if (powerAttack) {
        amount = amount * 2; // double dice on power attack

        if (game.settings.get("knave2e", "enforceBreaks")) {
          item.update({
            // power attacks break item
            "system.broken": true,
          });
          rollFlavor =
            rollFlavor +
            `. ${game.i18n.localize(
              "KNAVE2E.PowerAttack"
            )} ${game.i18n.localize("KNAVE2E.Breaks")} ${item.name}!`;
        }
      }
    }
  }

  if (a.dataset.action === "direct") {
    formula = `3*(@amount@size+@bonus)`;
  }

  const r = await new Roll(formula, {
    amount: amount,
    size: size,
    bonus: bonus,
  });

  r.toMessage({
    speaker: speaker,
    flavor: rollFlavor,
    rollMode: rollMode,
  });
}

export async function onLinkFromChat(event) {
  event.preventDefault();
  const a = event.currentTarget;

  const link = a.closest("a");
  const item = game.items.get(link.dataset.id);

  ChatMessage.create({
    flavor: `${item.name}`,
    content: `${item.system.description}`,
  });
}
