# CHANGELOG

## 0.3.1
- Fixed bug affecting automatic maximum wound calculation
- Simplified weapon/monster attack damage into a single user input
- Changed styling overrides for compatibility with Monk's Enhanced Journal mod

## 0.3.0
- Added options to disable automation and rule-enforcement features in system settings
- Added options to adjust consumable weights and base level XP in system settings
- PCs and recruits can only equip one armor piece of a given type at once
- Added quantity field to equipment item sheet
- Fixed equipment item slots not rounding to nearest integer by default
- Added dynamic inputs on actor sheets based on game settings
- Added icon to monster attacks on monster sheets
- Fixed maximum HP/wounds bar vertical rendering
- Standardized font weight and background color across static fields and user inputs

## 0.2.2
- All attacks roll their description (not just relics)
- Monster sheets display AP and can roll reverse AP
- New PCs and recruits have "Link Actor Data" selected by default
- Armor can be unequipped for AP calculations without being removed from inventory
- Clicking item names or icons in inventory sends their descriptions to chat (only when items have descriptions)
- Fix labels for toggleable buttons on items in actor inventory

## 0.2.1
- Added support for reverse AP rolls for PCs/recruits
- Reduced size of chat message header font

## 0.2.0
- Added support for Power Attacks, with automatic weapon breaking
- Visual update to character, recruit, and monster sheets
- Re-colored HP and Wounds to match default token attribute bars in Foundry
- Added in-line damage buttons to attack roll chat messages 
- Active relics automatically roll with their description, and can print spell effects directly from chat
- Reversed wound progression direction for more clear interaction with default token attribute bars
- Simplified "number appearing" fields to accept a single string of type Dng(Wild), (e.g. 1d6(3d6))
- Converted multiple notifications into single-user dialog popups to reduce chat spam

## 0.1.2
- Added automatic reminder for maneuevers on an attack roll >= 21

## 0.1.1
- Fixed bug affecting recruit spellcasting
- Updated system background image for Foundry UI
- Changed minor sheet formatting issues - only small changes now, as sheets will change drastically in a future release.

## 0.1.0
- Initial release
