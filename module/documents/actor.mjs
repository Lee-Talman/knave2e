export default class Knave2eActor extends Actor {

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
    // this._prepareRecruitData(actorData);

  }

  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;

    // Define Maximum Values
    systemData.armorClass = (systemData.armorPoints + 11);
    systemData.blessings.max = systemData.abilities.charisma.value;
    systemData.followers.max = systemData.abilities.charisma.value;
    systemData.spells.max = systemData.abilities.intelligence.value;
    systemData.slots.max, 
    systemData.wounds.max = (systemData.abilities.constitution.value + 10);
    
    // Define Slots after Wounds
    systemData.slots.value = (systemData.slots.max - systemData.wounds.value);

  }

  _prepareRecruitData(actorData) {
    if (actorData.type !== 'recruit') return;

    const systemData = actorData.system;
    systemData.hitPoints.max = 3;
    systemData.armorClass.value = 11;

    let subType = systemData.subType;
    switch (subType) {
      case "hireling":
        systemData.cost = 300;
        break;
      case "mercenary":
        systemData.cost = 600;
        systemData.morale = 8;
        systemData.hitPoints.max = 3;
        systemData.armorClass.value = 15;
        break;
      case "expertCommon":
        systemData.cost = 600;
        break;
      case "expertUncommon":
        systemData.cost = 1200;
        break;
      case "expertRare":
        systemData.cost = 2400;
        break;
    }
  }

    /**
   * Prepare Monster-type specific data.
   */
    _prepareMonsterData(actorData) {
      if (actorData.type !== 'monster') return;
  
      const systemData = actorData.system;

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
    //this._getRecruitRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use formulas like `d20 + @strength.value`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.level) {
      data.lvl = data.level.value ?? 0;
    }
  }

  /**
   * Prepare Recruit roll data.
   */
  _getRecruitRollData(data) {
    if (this.type !== 'recruit') return;

    // Process additional Recruit data here.
  }

}