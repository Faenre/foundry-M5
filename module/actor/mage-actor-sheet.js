/* global game, mergeObject */

import { MortalActorSheet } from './mortal-actor-sheet.js';
import { getBloodPotencyValues, getBloodPotencyText } from './blood-potency.js';
import { rollDice } from './roll-dice.js';
import {
  _assignToActorField,
  _onDotCounterEmpty,
  _onSquareCounterChange,
  _onSquareSybCounterChange,
  _onSquare2cfCounterChange,
  _onDotCounterChange,
  _setupDotCounters,
  _setupSquareCounters,
  _setupSquareCountersSyb,
  _setupSquareCounters2cf,
} from './mage-resources.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {GhoulActorSheet}
 */

export class MageActorSheet extends MortalActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'mta5e', 'sheet', 'actor', 'mage']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('mta5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/mta5e/templates/actor/mage-sheet.html',
      width: 800,
      height: 700,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'stats'
      }]
    })
  }

  constructor (actor, options) {
    super(actor, options);
    this.hunger = false;
    this.quiet = true;
    this.imageSet = 'mage';
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/mta5e/templates/actor/limited-sheet.html'
    return 'systems/mta5e/templates/actor/mage-sheet.html'
  }

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // merge the m20 counter systems into m5
    this._setupSquareCounters2cf = _setupSquareCounters2cf;
    this._setupSquareCounters2cf(html)

    this._onSquare2cfCounterChange = _onSquare2cfCounterChange;
    html.find('.qp-wheel').click(this._onSquare2cfCounterChange.bind(this));

    // magick rolling
    html.find('.mrollable').click(this._onMagickRollDialogue.bind(this));
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    const data = super.getData()

    data.sheetType = `${game.i18n.localize('MTA5E.Mage')}`

    // Prepare items.
    if (this.actor.data.type === 'mage' ||
    this.actor.data.type === 'character'
    ) {
      this._prepareItems(data)
    }

    return data
  }

  /**
     * set Blood Potency for Vampire sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  _prepareItems (sheetData) {
    super._prepareItems(sheetData);

    const actorData = sheetData.actor;
    actorData.spheres_list = {
      correspondence: [],
      entropy: [],
      forces: [],
      life: [],
      matter: [],
      mind: [],
      prime: [],
      spirit: [],
      time: [],
    };
    actorData.avatar = {
      arete: 0,
      essence: '',
    };
    actorData.quiet = {
      value: 1
    };
    actorData.imageSet = 'mage';
  }
    /**
   * Handle clickable magick sphere rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onMagickRollDialogue (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    // let areteText = this.actor.data.data.options.technocrat.value ? 'Arete' : 'Enlightenment';
    // let options = `<option value="arete">${game.i18n.localize('MTA5E.' + areteText}</option>`;

    // for (const [key, value] of Object.entries(this.actor.data.data.spheres)) {
    //   options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    // }
    const areteText = this.actor.data.data.options.technocracy.value ?  'Enlightenment' : 'Arete';

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.Modifier')}</label>
              <input type="text" id="inputMod" value="0">
          </div>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.Difficulty')}</label>
              <input type="text" min="0" id="inputDif" value="0">
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Roll'),
        callback: async (html) => {
          const modifier = parseInt(html.find('#inputMod')[0].value || 0)
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0)
          const areteVal = this.actor.data.data.avatar.arete
          const areteName = game.i18n.localize('MTA5E.' + areteText)
          const numDice = areteVal + parseInt(dataset.roll) + modifier
          rollDice(numDice, this.actor, `${dataset.label} + ${areteName}`, difficulty,
          {
            useHunger: this.hunger,
            useQuiet: this.quiet,
            imageSet: this.imageSet
            });
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.Rolling') + ` ${dataset.label}...`,
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  /** @override */
  _onMagickRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const item = this.actor.items.get(dataset.id)

    const sphere = this.actor.data.data.spheres[item.data.data.sphere].value;
    const arete = this.actor.data.data.avatar.arete;
    const ongoingPenalty = 0;
    const dicePool = sphere + arete - ongoingPenalty;

    rollDice(dicePool, this.actor, `${item.data.name}`, 0,
      {
        useHunger: this.hunger,
        useQuiet: this.quiet,
        imageSet: this.imageSet
      });
  }

}
