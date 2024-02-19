export async function dialogCheck(data) {
    await Dialog.wait({
        title: "Check",
        content: `${game.i18n.localize("KNAVE2E.CheckDialog")}`,
        buttons: {
            standard: {
                label: game.i18n.localize("KNAVE2E.Level"),
                callback: () => { return data.level }
            },
            half: {
                label: game.i18n.localize("KNAVE2E.HalfLevel"),
                callback: () => { return Math.floor(data.level / 2) }
            },
            zero: {
                label: game.i18n.localize("KNAVE2E.None"),
                callback: () => { return 0 }
            },
        },
        default: 'standard',
    })
}

export async function dialogItemCreate() {
    await Dialog.wait({
        title: `${game.i18n.localize("KNAVE2E.CreateItemDialogHeader")}`,
        content: `${game.i18n.localize("KNAVE2E.CreateItemDialogContent")}`,
        buttons: {
            armor: {
                label: game.i18n.localize("KNAVE2E.Armor"),
                callback: () => { return "armor" }
            },
            equipment: {
                label: game.i18n.localize("KNAVE2E.Equipment"),
                callback: () => { return "equipment" }
            },
            lightSource: {
                label: game.i18n.localize("KNAVE2E.LightSource"),
                callback: () => { return "lightSource" }
            },
            spellbook: {
                label: game.i18n.localize("KNAVE2E.Spellbook"),
                callback: () => { return "spellbook" }
            },
            weapon: {
                label: game.i18n.localize("KNAVE2E.Weapon"),
                callback: () => { return "weapon" }
            },
        },
        default: 'weapon',
    });
}