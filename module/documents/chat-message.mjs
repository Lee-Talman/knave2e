import {onDamage} from '../helpers/items.mjs'

export default class Knave2eChatMessage extends ChatMessage {

    async getHTML() {
        const html = await super.getHTML();

        html.on('click', '.item-button.damage.chat', onDamage.bind(this));

        return html
    }
}

    // _prepareChatRoll(event, action) {
    //     event.preventDefault();
    //     const a = event.currentTarget;
    //     const actor = game.actors.get(this.speaker.actor);



    //     return { actor, item, action }
    // }

    // async _onRollDamageFromChat(event) {

    //     // Prepare item, action, dialog for onDamage
    //     event.preventDefault();
    //     let dialog = event.shiftKey;
    //     const a = event.currentTarget;
    //     const actor = game.actors.get(this.speaker.actor);

    //     // Find closest <div> element containing a "data-item-id" attribute
    //     const div = a.closest("div");
    //     const item = div.dataset.itemId ? actor.items.get(div.dataset.itemId) : null;
    //     const action = div.dataset.action;

    //     // Prepare dialog
    //     onDamage(item, action, dialog, actor);
    // }

// activateListeners(html) {
//     html.find("[data-action], [data-workflow-action]").on("click", this._onClickControl.bind(this));
//     html.find("[data-action]").on("change", this._onChangeInput.bind(this));
//   };