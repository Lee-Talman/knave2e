export default class Knave2eItemType extends foundry.abstract.TypeDataModel{
    
    static defineSchema(){
        const fields = foundry.data.fields;
        return{
            category: new fields.StringField({required: true, blank: false, initial: this.DEFAULT_CATEGORY}),
            quantity: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 0}),
            slots: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 0}),
            cost: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
            dropped: new fields.BooleanField({initial: false}),
            relic: new fields.BooleanField({initial: false}),
            active: new fields.BooleanField({initial: false}),
            description: new fields.StringField(),
        }
    }

    static DEFAULT_CATEGORY = "";
}