import * as ABILITIES from "./abilities.mjs"
import * as AMMO from "./ammo.mjs"
import * as ARMOR from "./armor.mjs"
import * as COIN from "./coin.mjs"
import * as EQUIPMENT from "./equipment.mjs"
import * as SPELLBOOK from "./spellbook.mjs"
import * as WEAPON from "./weapon.mjs"

export const SYSTEM_ID = "knave2e"

export const DAMAGE_DIE_SIZES = {
    d2: "d2",
    d4: "d4",
    d6: "d6",
    d8: "d8",
    d10: "d10",
    d12: "d12",
}

export const SYSTEM = {
    id: SYSTEM_ID,
    ABILITIES,
    AMMO,
    ARMOR,
    COIN,
    DAMAGE_DICE,
    EQUIPMENT,
    SPELLBOOK,
    WEAPON
}