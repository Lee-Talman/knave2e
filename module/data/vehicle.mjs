import Knave2eActorType from "./actor-type.mjs";
import { SYSTEM } from "../config/system.mjs";

export default class Knave2eVehicle extends Knave2eActorType {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.ammo = new fields.SchemaField({
      arrow: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      bullet: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
    });
    schema.coins = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.cost = new fields.NumberField({
      ...requiredInteger,
      initial: 30,
      min: 0,
    });
    schema.crew = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.slots = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 50, min: 0 }),
    });
    return schema;
  }

  prepareBaseData() {
    this._deriveSlots();
  }

  _deriveSlots() {
    const coinsPerSlot = game.settings.get("knave2e", "coinsPerSlot");
    const arrowsPerSlot = game.settings.get("knave2e", "arrowsPerSlot");
    const bulletsPerSlot = game.settings.get("knave2e", "slingBulletsPerSlot");

    // Sum coin slots
    const coinSlots = coinsPerSlot === 0 ? 0 : this.coins / coinsPerSlot;

    // Sum ammo slots
    const arrowSlots =
      arrowsPerSlot === 0 ? 0 : this.ammo.arrow / arrowsPerSlot;
    const bulletSlots =
      bulletsPerSlot === 0 ? 0 : this.ammo.bullet / bulletsPerSlot;
    const ammoSlots = arrowSlots + bulletSlots;

    const nonItemSlots = ammoSlots + coinSlots;
    this.slots.value = nonItemSlots;

    const itemSlots = this._deriveHeldItemSlots();
    this.slots.value += itemSlots;
    const remainder = itemSlots + nonItemSlots - this.slots.max;
    if (remainder > 0) {
      this._deriveDroppedItems(remainder);
    }
    if (game.settings.get("knave2e", "enforceIntegerSlots") === true) {
      this.slots.value = Math.ceil(this.slots.value);
      this.slots.max = Math.ceil(this.slots.max);
    } else {
      this.slots.value = Number(nonItemSlots).toPrecision(2);
    }
  }

  _deriveHeldItemSlots() {
    const modifiedItems = [];
    let itemSlots = 0;
    for (const item of this.parent.items.contents) {
      item.system.held = item.system.quantity;
      if (item.system.quantity > 0) {
        item.system.dropped = false;
      } else {
        item.system.held = 0;
        item.system.dropped = true;
      }
      modifiedItems.push(item);
      itemSlots += item.system.quantity * item.system.slots;
    }
    this.parent.updateEmbeddedDocuments("Item", modifiedItems);
    return itemSlots;
  }

  _deriveDroppedItems(remainder) {
    const modifiedItems = [];
    const sortedItems = this.parent.items.contents.sort(
      (a, b) => a.sort - b.sort,
    );
    iterateRemainder: while (remainder > 0 && sortedItems.length > 0) {
      for (const item of sortedItems) {
        for (let i = 0; i < item.system.quantity; i++) {
          if (item.system.dropped === false) {
            remainder -= item.system.slots;
            item.system.held -= 1;
            if (item.system.held <= 0) {
              item.system.dropped = true;
            }
            if (remainder <= 0) {
              item.system.progress =
                ((item.system.quantity - item.system.held) /
                  item.system.quantity) *
                100;
              modifiedItems.push(item);
              break iterateRemainder;
            }
          }
        }
        item.system.progress =
          ((item.system.quantity - item.system.held) / item.system.quantity) *
          100;
        modifiedItems.push(item);
      }
      break iterateRemainder;
    }
    this.parent.updateEmbeddedDocuments("Item", modifiedItems);
  }
}
