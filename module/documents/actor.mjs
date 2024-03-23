export default class Knave2eActor extends Actor {

  async _preCreate(data) {
    if (data.type === 'character' || data.type === 'recruit') {
      this.updateSource({"prototypeToken.actorLink" : true});
    }
    super._preCreate(data)
}

  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {
  }

  prepareDerivedData() {
    const actorData = this;
    // const systemData = actorData.system;
    // const flags = actorData.flags.knave2e || {};

    this._prepareCharacterData(actorData);
    this._prepareRecruitData(actorData);

  }

  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;

    // Define Maximum Values
    
    if (game.settings.get('knave2e', 'automaticBlessings')){
      systemData.blessings.max = systemData.abilities.charisma.value;
    }
    
    
    if (game.settings.get('knave2e', 'automaticCompanions')){
      systemData.companions.max = systemData.abilities.charisma.value;
    }
    
    
    if (game.settings.get('knave2e', 'automaticSpells')){
      systemData.spells.max = systemData.abilities.intelligence.value;
    }
    

    if (game.settings.get('knave2e', 'automaticArmor')) {
      systemData.wounds.max = (systemData.abilities.constitution.value + 10);
    }
    systemData.slots.max 
    

  }

  _prepareRecruitData(actorData) {
    if (actorData.type !== 'recruit') return;

    const systemData = actorData.system;

    if (game.settings.get('knave2e', 'automaticSpells')) {
      if (actorData.system.category == 'expert' && actorData.system.rarity == 'KNAVE2E.Rare'){
        systemData.spells.max = 1;
      }
      else {
        systemData.spells.max = 0;
      }
    }
  }

    /**
   * Prepare Monster-type specific data.
   */
    _prepareMonsterData(actorData) {
      if (actorData.type !== 'monster') return;
  
      const systemData = actorData.system;

      if (game.settings.get('knave2e', 'automaticArmor')){
        systemData.armorPoints = systemData.armorClass - 11;
      }
      }

  /**
 * Prepare Vehicle-type specific data.
 */
  _prepareVehicleData(actorData) {
    if (actorData.type !== 'vehicle') return;

    const systemData = actorData.system;

    let subType = systemData.subType;
    switch (subType) {
      case "mule":
        systemData.cost = 30;
        systemData.slots = 50;
        systemData.crew = 0;
        break;
      case "ridingHorse":
        systemData.cost = 200;
        systemData.slots = 80;
        systemData.crew = 0;
        break;
      case "warHorse":
        systemData.cost = 10000;
        systemData.slots = 80;
        systemData.crew = 0;
        break;
      case "cart":
        systemData.cost = 50;
        systemData.slots = 200;
        systemData.crew = 0;
        break;
      case "carriage":
        systemData.cost = 320;
        systemData.slots = 200;
        systemData.crew = 0;
        break;
      case "wagon":
        systemData.cost = 120;
        systemData.slots = 800;
        systemData.crew = 0;
        break;
      case "rowboat":
        systemData.cost = 50;
        systemData.slots = 320;
        systemData.crew = 0;
        break;
      case "fishingBoat":
        systemData.cost = 500;
        systemData.slots = 2000;
        systemData.crew = 2;
        break;
      case "sloop":
        systemData.cost = 5000;
        systemData.slots = 8000;
        systemData.crew = 10;
        break;
      case "caravel":
        systemData.cost = 25000;
        systemData.slots = 40000;
        systemData.crew = 50;
        break;
      case "galleon":
        systemData.cost = 125000;
        systemData.slots = 200000;
        systemData.crew = 200;
        break;
    }
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getRecruitRollData(data);
    this._getMonsterRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability score values to the top level, so that rolls can use formulas like `d20 + @strength`.
    for (let [k, v] of Object.entries(data.abilities)) {
      data[k] = foundry.utils.deepClone(v).value;
    }

    data.speaker = ChatMessage.getSpeaker({ actor: this });
    data.rollMode = game.settings.get('core', 'rollMode');
  }

  /**
   * Prepare Recruit roll data.
   */
  _getRecruitRollData(data) {
    if (this.type !== 'recruit') return;

    // Process additional Recruit data here.
  }

  _getMonsterRollData(data) {
    if (this.type !== 'monster') return;

    // Process additional Monster data here.
  }

}