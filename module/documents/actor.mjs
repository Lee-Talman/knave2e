export default class Knave2eActor extends Actor {
    async _preCreate(data) {
        if ((await super._preCreate(data)) === false) return false;
        if (data.type === 'character' || data.type === 'recruit') {
            this.updateSource({ 'prototypeToken.actorLink': true });
        }
        if (data.type === 'character') {
            if (game.settings.get('knave2e', 'automaticVision')) {
                this.updateSource({ 'prototypeToken.sight.enabled': true });
            }
        }
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

    async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
        if (attribute !== 'hitPoints' || this.type !== 'character' || isDelta === false || value >= 0) {
            return await super.modifyTokenAttribute(attribute, value, isDelta, isBar);
        }

        // Characters take damage differently than recruits/monsters, since they have wounds
        const attr = foundry.utils.getProperty(this.system, attribute);
        const current = isBar ? attr.value : attr;
        const update = isDelta ? current + value : value;
        if (update === current) return this;

        // Determine the HP overflow into wounds
        let updates;
        if (isBar) updates = { [`system.${attribute}.value`]: Math.clamp(update, 0, attr.max) };
        else updates = { [`system.${attribute}`]: update };

        if (update <= 0) {
            const wounds = this.system.wounds
            if (isBar) updates = {
                ...updates,
                [`system.wounds.value`]: Math.clamp(wounds.value - Math.abs(update), 0, wounds.max),
            };
            else updates = {
                ...updates,
                [`system.wounds`]: Math.clamp(wounds.value - Math.abs(update), 0, wounds.max)
            }
        }

        // Allow a hook to override these changes
        const allowed = Hooks.call('modifyTokenAttribute', { attribute, value, isDelta, isBar }, updates);
        return allowed !== false ? this.update(updates) : this;
    }

    _prepareCharacterData(actorData) {
        if (actorData.type !== 'character') return;

        const systemData = actorData.system;
    }

    _prepareRecruitData(actorData) {
        if (actorData.type !== 'recruit') return;

        const systemData = actorData.system;

        if (game.settings.get('knave2e', 'automaticRecruits')) {
            if (actorData.system.category == 'expert' && actorData.system.rarity == 'KNAVE2E.Rare') {
                systemData.spells.max = 1;
            } else {
                systemData.spells.max = 0;
            }
        }
    }

    _prepareVehicleData(actorData) {
        if (actorData.type !== 'vehicle') return;

        const systemData = actorData.system;
    }

    _prepareMonsterData(actorData) {
        if (actorData.type !== 'monster') return;

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
        if (this.type !== 'character') return;

        // Copy the ability score values to the top level, so that rolls can use formulas like `d20 + @strength`.
        for (let [k, v] of Object.entries(data.abilities)) {
            data[k] = foundry.utils.deepClone(v).value;
        }

        data.speaker = ChatMessage.getSpeaker({ actor: this });
        data.rollMode = game.settings.get('core', 'rollMode');
    }

    _getRecruitRollData(data) {
        if (this.type !== 'recruit') return;

        // Process additional Recruit data here.
    }

    _getMonsterRollData(data) {
        if (this.type !== 'monster') return;

        // Process additional Monster data here.
    }

    _getVehicleRollData(data) {
        if (this.type !== 'vehicle') return;

        // Process additional Vehicle data here.
    }
}
