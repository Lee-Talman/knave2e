export default class Knave2eActor extends Actor {
  async _preCreate(data) {
    if (data.type === "character" || data.type === "recruit") {
      this.updateSource({ "prototypeToken.actorLink": true });
    }
    super._preCreate(data);
  }

  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {}

  prepareDerivedData() {
    const actorData = this;
    // const systemData = actorData.system;
    // const flags = actorData.flags.knave2e || {};

    this._prepareCharacterData(actorData);
    this._prepareRecruitData(actorData);
  }

  _prepareCharacterData(actorData) {
    if (actorData.type !== "character") return;

    const systemData = actorData.system;

    if (game.settings.get("knave2e", "automaticBlessings")) {
      systemData.blessings.max = systemData.abilities.charisma.value;
    }

    if (game.settings.get("knave2e", "automaticCompanions")) {
      systemData.companions.max = systemData.abilities.charisma.value;
    }

    if (game.settings.get("knave2e", "automaticSpells")) {
      systemData.spells.max = systemData.abilities.intelligence.value;
    }

    if (game.settings.get("knave2e", "automaticWounds")) {
      systemData.wounds.max = 10 + systemData.abilities.constitution.value;
    }
  }

  _prepareRecruitData(actorData) {
    if (actorData.type !== "recruit") return;

    const systemData = actorData.system;

    if (game.settings.get("knave2e", "automaticRecruits")) {
      if (
        actorData.system.category == "expert" &&
        actorData.system.rarity == "KNAVE2E.Rare"
      ) {
        systemData.spells.max = 1;
      } else {
        systemData.spells.max = 0;
      }
    }
  }

  _prepareVehicleData(actorData) {
    if (actorData.type !== "vehicle") return;

    const systemData = actorData.system;
  }

  _prepareMonsterData(actorData) {
    if (actorData.type !== "monster") return;

    const systemData = actorData.system;
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
    this._getVehicleRollData(data);

    return data;
  }

  _getCharacterRollData(data) {
    if (this.type !== "character") return;

    // Copy the ability score values to the top level, so that rolls can use formulas like `d20 + @strength`.
    for (let [k, v] of Object.entries(data.abilities)) {
      data[k] = foundry.utils.deepClone(v).value;
    }

    data.speaker = ChatMessage.getSpeaker({ actor: this });
    data.rollMode = game.settings.get("core", "rollMode");
  }

  _getRecruitRollData(data) {
    if (this.type !== "recruit") return;

    // Process additional Recruit data here.
  }

  _getMonsterRollData(data) {
    if (this.type !== "monster") return;

    // Process additional Monster data here.
  }

  _getVehicleRollData(data) {
    if (this.type !== "vehicle") return;

    // Process additional Vehicle data here.
  }

}
