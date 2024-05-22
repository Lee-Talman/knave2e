import { onDamageFromChat, onLinkFromChat } from "../helpers/items.mjs";

export default class Knave2eChatMessage extends ChatMessage {
  async getHTML() {
    const html = await super.getHTML();

    html.on("click", ".item-button.damage.chat", onDamageFromChat.bind(this));
    html.on("click", ".content-link", onLinkFromChat.bind(this));

    return html;
  }
}
