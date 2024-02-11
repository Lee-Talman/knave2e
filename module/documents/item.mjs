export default class Knave2eItem extends Item {

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags.knave2e || {};

    this._prepareWeaponData(itemData);
    // this._prepareArmorData(itemData);
    this._prepareSpellbookData(itemData);
    this._prepareEquipmentData(itemData);
    // this._prepareAmmoData(itemData);
    // this._prepareCoinData(itemData);
  }

  _prepareWeaponData(itemData) {
    if (itemData.type !== 'weapon') return;

    const systemData = itemData.system;
    this._prepareDamageRoll();

  }

  _prepareDamageRoll() {
    let damageRoll = "d6";

    if (this.damageDiceBonus > 0) {
      damageRoll = `${this.damageDiceAmount}${this.damageDiceSize}+${this.damageDiceBonus}`;
    }
    else if (this.damageDiceBonus === 0) {
      damageRoll = `${this.damageDiceAmount}${this.damageDiceSize}`;
    }
    else {
      damageRoll = `${this.damageDiceAmount}${this.damageDiceSize}-${this.damageDiceBonus}`;
    }

    this.damageRoll = damageRoll;

  }

  _prepareArmorData(itemData) {
    if (itemData.type !== 'armor') return;

    const systemData = itemData.system;

  }

  _prepareSpellbookData(itemData) {
    if (itemData.type !== 'spellbook') return;

    const systemData = itemData.system;

  }

  _prepareEquipmentData(itemData) {
    if (itemData.type !== 'spellbook') return;

    const systemData = itemData.system;

  }

  _prepareAmmoData(itemData) { }
  _prepareCoinData(itemData) { }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) return null;
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
    if (!this.system.damageRoll) {
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
      const roll = new Roll(rollData.item.damageRoll, rollData);
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
