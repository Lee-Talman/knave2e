export default class Knave2eItemType extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = {};

        schema.category = new fields.StringField({
            required: true,
            blank: false,
            initial: this.DEFAULT_CATEGORY,
        });
        schema.description = new fields.StringField({ initial: '' });
        schema.slots = new fields.NumberField({
            required: true,
            nullable: false,
            integer: false,
            initial: 1,
            min: 0,
        });
        schema.cost = new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: 0,
        });
        schema.dropped = new fields.BooleanField({ initial: false });
        schema.held = new fields.NumberField({
            ...requiredInteger,
            initial: 1,
            min: 0,
        });
        schema.progress = new fields.NumberField({ initial: 0, min: 0, max: 100 });
        schema.relic = new fields.SchemaField({
            isRelic: new fields.BooleanField({ initial: false }),
            isActive: new fields.BooleanField({ initial: false }),
        });
        schema.quantityPerSlot = new fields.NumberField({
            required: true,
            nullable: false,
            integer: false,
            initial: 1,
            min: 1,
        });
        schema.quantity = new fields.NumberField({
            ...requiredInteger,
            initial: 1,
            min: 0,
        });

        return schema;
    }

    static DEFAULT_CATEGORY = '';

    //prepareDerivedData() {
    //    if (this.dropped || this.quantity === 0 || this.held === 0) {
    //        this.progress = 100;
    //    } else {
    //        this.progress = Math.floor(((this.quantity - this.held) / this.quantity) * 100);
    //    }
    //}
}
