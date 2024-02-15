# Knave Second Edition (Unofficial) - Game System for Foundry Virtual Tabletop
![Foundry Virtual Tabletop](https://img.shields.io/badge/foundry-v11-green)

This game system for [Foundry Virtual Tabletop](https://foundryvtt.com/) provides character sheets and rule automation for [Knave Second Edition](https://www.kickstarter.com/projects/questingbeast/knave-rpg-second-edition) by [Ben Milton and Questing Beast LLC](https://questingbeast.substack.com/). 

Knave Second Edition for FoundryVTT is an independent production of Lee Talman and is not affiliated with Questing Beast LLC. The game system is currently an early beta and is subject to change. Once approved by the FoundryVTT team, you will be able to find the official package page [hosted by FoundryVTT here](https://foundryvtt.com/packages/knave2e).

## Installation
1. In your Foundry UI, select "Install System" under "Game Systems".
2. Copy and paste the following link into the "Manifest URL field", then click "Install":
`https://raw.githubusercontent.com/Lee-Talman/knave2e/main/system.json`


## Features
Knave Second Edition for FoundryVTT provides sheets for player characters, monster, recruits (hireling, mercenaries, and experts), and items (weapons, armor, light sources, spellbooks, and general equipment). 

In addition, the game system automates many of the Knave Second Edition rules, with more features to come:

### Rolls:
- [x] Ability Checks
- [x] Attack, Damage, and Direct Damage
- [x] Checks adding Level, half Level, or zero
- [x] Monster and Recruit Morale
- [x] Weapons break on a natural 1
- [x] Monsters roll number appearing in both wilderness and dungeons
- [ ] Spell effects scale with INT

### Slots:
- [x] Characters gain slots with CON
- [x] Characters lose slots from Wounds, starting with the first slot
- [x] Stacking items (coins, ammo) calculate total slot encumberance
- [x] Items in wounded/overencumbered slots cannot be used
- [x] Item order can be rearranged
- [ ] Characters can assign coins/ammo to numbered slots to determine drop order

### Items:

- [x] Items can be labeled as "Relics"
- [x] Relics can be active or inactive, and add to total Active Blessings
- [x] Characters gain maximum Active Blessings with CHA
- [x] Spellbooks can only be cast once per rest
- [x] Characters can only cast a number of spells based on INT
- [x] Only certain recruits can cast spells
- [x] Light sources can be customized and activated from a character's inventory
- [x] Characters can perform a standard or "safe haven" rest to restore Wounds
- [ ] GMs can perform a rest on all characters at once
- [ ] Items can be assigned to macro bars for quick use
- [ ] Items can be labeled as potions and given alchemical effects
- [ ] Chaos spellbooks gain random effects

### System:

- [ ] Characters/Recruits/Monsters can be randomly generated at any level
- [ ] Support for Vehicles and Containers
- [ ] Add modifiers and items based on Careers
- [ ] Configuration settings avaiable in Foundry system menu
- [ ] Assign custom icons to Recruits & Monsters
- [ ] Spell/Potion builder

## Bug Reporting
Knave Second Edition for FoundryVTT is still in a beta stage, and is likely to have many missing features, bugs, and edge cases. Report any issues (preferably with `F12 > Inspect Editor` screenshots) in the [Issues](https://github.com/Lee-Talman/knave2e/issues) page.

## Special Thanks
This system would not have been possible without the following people:
1. Ben Milton and Questing Beast LLC. Thank you for a fantastic follow-up to Knave First Edition, and thank you for the permission to distribute this system to other fans!

2. The FoundryVTT Boilerplate System developer `asacolips`, who is responsible for indirectly birthing more FoundryVTT game systems than anyone.

3. `mxzf`, `chaosOS`, `Ethaks`, and the rest of the incredible FoundryVTT development gurus in the FoundryVTT Discord server. Partially for their wisdom, but mostly for their patience.


