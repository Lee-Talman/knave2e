export class Knave2eActor extends Actor {

  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.knave2e || {};

    // Make separate methods for each Actor type (character, recruit, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareRecruitData(actorData);

  }

  /**
   * Prepare Character-type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;

    systemData.armorClass.value = (systemData.armorPoints.value + 11);
    systemData.wounds.max, systemData.slots.max = (systemData.abilities.con.value + 10);
    systemData.slots.value = (systemData.slots.max - systemData.wounds.value);

  }

  /**
   * Prepare Recruit-type specific data.
   */
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
    this._getRecruitRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
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