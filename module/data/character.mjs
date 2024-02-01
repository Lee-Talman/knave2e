import Knave2eBaseActorData from "./base-actor.mjs";
import {SYSTEM} from "../config/system.mjs";

export default class Knave2eActor extends Knave2eBaseActorData(){

    

    static defineSchema(){
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};

        return {
            abilities: new fields.SchemaField({
                strength: new fields.SchemaField({
                    value: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
                }),
                dexterity: new fields.SchemaField({
                    value: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
                }),
                constitution: new fields.SchemaField({
                    value: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
                }),
                intelligence: new fields.SchemaField({
                    value: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
                }),
                wisdom: new fields.SchemaField({
                    value: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
                }),
                charisma: new fields.SchemaField({
                    value: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
                }),
            }),
            armorPoints: new fields.NumberField({...requiredInteger, initial: 0, min: 0, max: 7}),
            blessings: new fields.SchemaField({
                current: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                max: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
            }),
            companions: new fields.SchemaField({
                current: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                max: new fields.NumberField({...requiredInteger, initial: 0, min: 0})
            }),
            slots: new fields.SchemaField({
                current: new fields.NumberField({...requiredInteger, initial: 10, min: 0}),
                max: new fields.NumberField({...requiredInteger, initial: 10, min: 0})
            }),
            wounds: new fields.SchemaField({
                current: new fields.NumberField({...requiredInteger, initial: 0, min: 0}),
                max: new fields.NumberField({...requiredInteger, initial: 10, min: 0})
            }),
            xp: new fields.NumberField({...requiredInteger, initial: 0, min: 0, max: 500000})
        }
    }

    prepareBaseData(){
        for (const key in abilities){
            if (abilities.hasOwnProperty(key)){
                abilities[key].label = SYSTEM.ABILITIES[key].label;
                abilities[key].abbreviation = SYSTEM.ABILITIES[key].abbreviation;
            }
        }
    }

    _prepareDerivedData(){
        this.blessings.max = this.abilities.charisma.value;
        this.followers.max = this.abilities.charisma.value;
        this.slots.current = this.abilities.constitution.value - this.wounds.current;
        this.level = _calculateLevel(this.xp);
    }

    _calculateLevel(xp){
        let currentLevel;

        switch(true)
    }

}