export default class Knave2eBaseActorData extends foundry.abstract.TypeDataModel{
    
    static defineSchema(){
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};
        return{
            armorClass: new fields.NumberField({...requiredInteger, initial: 11, min: 1}),
            description: new fields.StringField(),
            hitPoints: new fields.NumberField({...requiredInteger, initial: 1, min: 0}),
            level: new fields.NumberField({...requiredInteger, initial: 1, min: 1}),
            movement: new fields.NumberField({...requiredInteger, initial: 40, min: 0}),
        }
    }

    prepareBaseData(){

    }
    _prepareDerivedData(){

    }
}