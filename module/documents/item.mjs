/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export default class Knave2eItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  prepareDerivedData(){
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags.knave2e || {};

    // Make separate methods for each Item type (weapon, armor, etc.) to keep
    // things organized.
    this._prepareWeaponData(itemData);
    this._prepareArmorData(itemData);
    this._prepareSpellbookData(itemData);
    this._prepareEquipmentData(itemData);
    this._prepareAmmoData(itemData);
    this._prepareCoinData(itemData);
  }

  _prepareWeaponData(itemData){
    if (itemData.type !== 'weapon') return;

    const systemData = itemData.system;

      systemData.subTypeOptions = {
        melee: "Melee",
        ranged: "Ranged"
      };

      systemData.damageOptions = {
        d2: "d2",
        d4: "d4",
        d6: "d6",
        d8: "d8",
        d10: "d10",
        d12: "d12"
      };

      systemData.ammoTypeOptions = {
        none: "None",
        sling: "Sling",
        bow: "Bow"
      };

      if (systemData.subType.value == "melee") {
        systemData.attackBonus = "str";
      }
      else {
        systemData.attackBonus = "wis";
      };

  }

  _prepareArmorData(itemData){
    if (itemData.type !== 'armor') return;

    const systemData = itemData.system;
  }
  _prepareSpellbookData(itemData){}
  _prepareSpellbookData(itemData){}
  _prepareEquipmentData(itemData){}
  _prepareAmmoData(itemData){}
  _prepareCoinData(itemData){}

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
