export async function checkDialog(data) {
    await Dialog.wait({
        title: "Check",
        content: `${game.i18n.localize("KNAVE2E.CheckDialog")}`,
        buttons: {
            standard: {
                label: game.i18n.localize("KNAVE2E.Level"),
                callback: () => { return (data.level).toString() }
            },
            half: {
                label: game.i18n.localize("KNAVE2E.HalfLevel"),
                callback: () => { return (Math.floor(data.level / 2)).toString() }
            },
            zero: {
                label: game.i18n.localize("KNAVE2E.None"),
                callback: () => { return '' }
            },
        },
        default: 'standard',
    })
}

export async function damageDialog(itemData, r) {
    // Only characters can power attack
    if (this.actor.type !== 'character') {
        return itemData.damageRoll;
    }

    await Dialog.wait({
        title: `${game.i18n.localize("KNAVE2E.Damage")}`,
        content: `${game.i18n.localize("KNAVE2E.DamageDialog")}`,
        buttons: {
            standard: {
                label: game.i18n.localize("KNAVE2E.Standard"),
                callback: async () => { return itemData.damageRoll }
            },
            power: {
                label: game.i18n.localize("KNAVE2E.PowerAttack"),
                callback: async () => { return r.terms[0].number * 2 }
            }
        },
        default: 'standard',
    })
}

export async function onAttack(event) {
    event.preventDefault();
    const a = event.currentTarget;

    // Find closest <li> element containing a "data-item-id" attribute
    const li = a.closest("li");
    const item = li.dataset.itemId ? this.actor.items.get(li.dataset.itemId) : null;

    const systemData = this.actor.system;
    const itemData = item.system;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode')

    let flavor = `${game.i18n.localize("KNAVE2E.AttackRoll")} ${game.i18n.localize("KNAVE2E.With")} ${item.name}`;

    // Override base roll function to deliver to ChatMessage
    let messageData = {
        data: {},
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        from: game.user._id,
        sound: 'sounds/dice.wav',
        speaker: speaker,
        rollMode: rollMode
    }

    // Pass item info for clickable Damage & Direct buttons in-chat. Will update item/buttons/flavor in-method
    const rollData = {
        data: {
            item: {
                _id: item._id,
                amount: itemData.damageDiceAmount,
                size: itemData.damageDiceSize,
                bonus: itemData.damageDiceBonus
            },
            buttons: true
        },
        flavor: flavor,
        rolls: []
    }

    // Return early if a ranged weapon is out of ammo
    if (!hasAmmo(item, this.actor)) {
        ChatMessage.create({
            speaker: speaker,
            flavor: flavor,
            content: `${this.actor.name} ${game.i18n.localize("KNAVE2E.OutOfAmmo")} ${item.name}!`,
            rollMode: rollMode
        });
        return
    }

    // Build the roll formula piecemeal
    const die = "1d20";
    let attackRollFormula;
    let attackRollBonus;

    /* -------------------------------------------- */
    /*  Attack Bonus                                */
    /* -------------------------------------------- */

    // Roll with level for recruits & monsters
    if (this.actor.type !== 'character') {
        // Skip dialog window on shift + click, default to system level
        if (!event.shiftKey) {
            attackRollBonus = systemData.level;
        }
        else {
            // get attack roll bonus from options
            attackRollBonus = checkDialog(systemData);
            rollData.flavor = `${flavor} ${game.i18n.localize("KNAVE2E.SkipDialog")}`;
        }
    }

    // Roll with abilities for characters
    else {
        attackRollBonus = itemData.category === 'melee' ? (systemData.abilities.strength.value).toString() : (systemData.abilities.wisdom.value).toString();
    }

    /* -------------------------------------------- */
    /*  Attack Formula                              */
    /* -------------------------------------------- */

    // Evaluate a roll and determine post-roll effects
    attackRollFormula = `${die} + ${attackRollBonus}`;
    let r = new Roll(attackRollFormula, {data: rollData});
    await r.evaluate();

    // Weapons from characters or recruits can break
    if (item.type === 'weapon') {

        // Check for weapon break
        if (r.result[0] === 1) {
            rollData.flavor = `${item.name} ${game.i18n.localize("KNAVE2E.Breaks")}!`

            item.update({
                "system.broken": true
            });

            // Turn off buttons for broken weapons
            rollData.data.buttons = false;
        }
    }

    // Attack from characters get free maneuvers
    if (this.actor.type === 'character') {
        if (r.total >= 21) {
            rollData.flavor = `${this.actor.name} ${game.i18n.localize("KNAVE2E.ManeuverSuccess")}`
        }
    }

    /* -------------------------------------------- */
    /*  Attack Roll                                 */
    /* -------------------------------------------- */

    // Push roll to rolls[] array for Dice So Nice
    rollData.rolls.push(r);

    // Merge and push to chat message
    messageData = mergeObject(messageData, rollData);
    messageData.content = await renderTemplate('systems/knave2e/templates/item/item-chat-message.hbs', rollData);
    ChatMessage.create(messageData);

    // Check for ammo and decrement ammo counter
    function hasAmmo(item, actor) {
        const systemData = actor.system;

        // Reject monster and melee weapon attacks
        if (item.type !== 'weapon' || item.system.category !== 'ranged') {
            return true
        }

        const ammoType = item.system.ammoType;

        if (ammoType === "arrow" && systemData.ammo[ammoType] >= 1) {
            actor.update({
                "system.ammo.arrow": systemData.ammo.arrow - 1
            });
            return true
        }
        else if (ammoType === "bullet" && systemData.ammo[ammoType] >= 1) {
            actor.update({
                "system.ammo.bullet": systemData.ammo.bullet - 1
            });
            return true
        }
        else if (ammoType === "none") {
            return true
        }
        else {
            return false
        }
    }
}

export async function onDamage(event) {
}

// export async function onDamage(item, action, dialog, speaker) {
//     // onDamage only gets param "speaker" when called from chat-message:
//     let speaker = (typeof speaker !== 'undefined') ? speaker : ChatMessage.getSpeaker({ actor: this.actor });

//     const itemData = item.system;
//     const damageFlavor = game.i18n.localize("KNAVE2E.DamageRoll");
//     const directFlavor = game.i18n.localize("KNAVE2E.DirectRoll");
//     let powerAttack = '';

//     // Modify damage and roll flavor text based on weapon's data-action string
//     const damageMod = action === "direct" ? 3 : 1;
//     const flavorType = action === "direct" ? directFlavor : damageFlavor;

//     const flavor = `${powerAttack} ${flavorType} ${game.i18n.localize("KNAVE2E.With")} ${item.name}`
//     const rollMode = game.settings.get('core', 'rollMode');

//     let r = new Roll("@mod * (@damage)", { mod: damageMod, damage: itemData.damageRoll });

//     if (!dialog) {
//         await r.evaluate();
//         r.toMessage({
//             speaker: speaker,
//             flavor: flavor,
//             rollMode: rollMode
//         });
//     }
//     else {
//         powerAttack = game.i18n.localize("KNAVE2E.PowerAttackFlavor");
//         r.formula = await this.damageDialog(itemData);
//         await r.evaluate();
//         r.toMessage({
//             speaker: speaker,
//             flavor: flavor,
//             rollMode: rollMode
//         });

//         // Power attack break weapon
//         itemData.update({
//             "system.broken": true
//         });
//     }
// }
