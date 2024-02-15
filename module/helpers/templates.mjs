/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/knave2e/templates/actor/parts/actor-character-items.hbs",
    "systems/knave2e/templates/actor/parts/actor-recruit-items.hbs",
    "systems/knave2e/templates/actor/parts/actor-monster-items.hbs",
    "systems/knave2e/templates/actor/parts/actor-description.hbs",
  ]);
};
