export default class Knave2eActorType extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.armorClass = new fields.NumberField({
      ...requiredInteger,
      initial: 11,
      min: 1,
    });
    schema.description = new fields.StringField({ initial: "" });
    schema.hitPoints = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      progress: new fields.NumberField({
        ...requiredInteger,
        initial: 100,
        min: 0,
      }),
    });
    schema.level = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
    });
    schema.movement = new fields.NumberField({
      ...requiredInteger,
      initial: 40,
      min: 0,
    });

    return schema;
  }

  async rest() {
    const update = await this.getRestData();
    return this.parent.update(update);
  }

  async getRestData() {
    // Reset "cast" field on each owned spellbook
    let spellbookChanges = this.parent.items
      .filter((i) => i.type === "spellbook")
      .map((i) => ({ _id: i.id, "system.cast": false, "system.castQuantity" : 0}));
    this.parent.updateEmbeddedDocuments("Item", spellbookChanges);

    // Recover all HP on rest
    return {"system.hitPoints.value" : this.hitPoints.max}
  }
}
