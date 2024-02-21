import {onDamageFromChat} from '../helpers/items.mjs'

export default class Knave2eChatMessage extends ChatMessage {

    async getHTML() {
        const html = await super.getHTML();

        html.on('click', '.item-button.damage.chat', onDamageFromChat.bind(this));

        return html
    }
}