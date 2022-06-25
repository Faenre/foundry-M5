/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  console.log('Schrecknet : loading subroutines')
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    'systems/mta5e/templates/actor/parts/arete.html',
    'systems/mta5e/templates/actor/parts/exp.html',
    'systems/mta5e/templates/actor/parts/frenzy.html',
    'systems/mta5e/templates/actor/parts/health.html',
    'systems/mta5e/templates/actor/parts/humanity.html',
    'systems/mta5e/templates/actor/parts/hunger.html',
    'systems/mta5e/templates/actor/parts/paradox-backlash.html',
    'systems/mta5e/templates/actor/parts/paradox-permanent.html',
    'systems/mta5e/templates/actor/parts/paradox-risk.html',
    'systems/mta5e/templates/actor/parts/paradox.html',
    'systems/mta5e/templates/actor/parts/ongoing-spells.html',
    'systems/mta5e/templates/actor/parts/profile-img.html',
    'systems/mta5e/templates/actor/parts/quiet.html',
    'systems/mta5e/templates/actor/parts/rouse.html',
    'systems/mta5e/templates/actor/parts/tab-biography.html',
    'systems/mta5e/templates/actor/parts/tab-blood.html',
    'systems/mta5e/templates/actor/parts/tab-disciplines.html',
    'systems/mta5e/templates/actor/parts/tab-features.html',
    'systems/mta5e/templates/actor/parts/tab-mage-features.html',
    'systems/mta5e/templates/actor/parts/tab-options.html',
    'systems/mta5e/templates/actor/parts/tab-other.html',
    'systems/mta5e/templates/actor/parts/tab-spheres.html',
    'systems/mta5e/templates/actor/parts/tab-stats.html',
    'systems/mta5e/templates/actor/parts/willpower.html',

    // Item Sheet Partials
    'systems/mta5e/templates/item/parts/skills.html',
    'systems/mta5e/templates/item/parts/disciplines.html',
    'systems/mta5e/templates/item/parts/attributes.html',
    'systems/mta5e/templates/item/parts/spheres.html',

    // Dice Tray Partials
    'systems/mta5e/templates/ui/parts/select-character.html',
    'systems/mta5e/templates/ui/parts/pool1-select-attribute.html',
    'systems/mta5e/templates/ui/parts/pool1-select-skill.html',
    'systems/mta5e/templates/ui/parts/pool1-select-discipline.html',
    'systems/mta5e/templates/ui/parts/pool2-select-attribute.html',
    'systems/mta5e/templates/ui/parts/pool2-select-skill.html',
    'systems/mta5e/templates/ui/parts/pool2-select-discipline.html',
    'systems/mta5e/templates/ui/parts/pool2-nothing.html'
  ]

  /* Load the template parts
     That function is part of foundry, not founding it here is normal
  */
  return loadTemplates(templatePaths) // eslint-disable-line no-undef
}
