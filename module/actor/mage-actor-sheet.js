/* global game, mergeObject */

import { MortalActorSheet } from './mortal-actor-sheet.js';
import { getBloodPotencyValues, getBloodPotencyText } from './blood-potency.js';
import { rollDice } from './roll-dice.js';
import {
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
    this.hunger = actor.data.data.options.hunger.value;
    this.quiet = actor.data.data.quiet.value;
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

    // m20 "superficial, lethal, aggravated" health efforts
    // (not presently functional...)
    // this.setupSquareCounters = _setupSquareCounters;
    // this.setupSquareCounters();
    // html.find('.healthbar > .resource-counter-step').click(this._onSquareCounter3StepChange.bind(this));

    html.find('.paradox-risk').click(this._onParadoxRiskRoll.bind(this));
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
    const areteText = this.actor.data.data.options.technocracy.value ?  'Enlightenment' : 'Arete';

    let spellSteps = parseInt(this.actor.data.data.options.ongoingspells, 10) || 1;
    if (spellSteps < 1) spellSteps = 1;
    const spellsActive = parseInt(this.actor.data.data.magika.ongoingspells, 10) || 0;
    const defaultModifier = (spellsActive > 0) ? '-' + Math.ceil(spellsActive / spellSteps) : ''

    const defaultDifficulty = 2;

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('MTA5E.CustomRollLabel')}</label>
              <input type="text" id="inputLabel" value="${dataset.label}">
          </div>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.Modifier')}</label>
              <input type="text" id="inputMod" value="0">
          </div>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.Difficulty')}</label>
              <input type="text" min="0" id="inputDif" value="0">
          </div>
          <div class="form-group">
              <label>${game.i18n.localize('MTA5E.UseMessyDice')}</label>
              <input type="checkbox" id="inputMessyDice" checked>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Roll'),
        callback: async (html) => {
          const label = html.find('#inputLabel')[0].value
          const modifier = parseInt(html.find('#inputMod')[0].value || 0)
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0)
          const areteVal = this.actor.data.data.avatar.arete
          const areteName = game.i18n.localize('MTA5E.' + areteText)
          const numDice = areteVal + parseInt(dataset.roll) + modifier
          const useMessyDice = html.find('#inputMessyDice')[0].checked
          rollDice(numDice, this.actor, label, difficulty,
          {
            useHunger: useMessyDice && this.hunger,
            useQuiet: useMessyDice && this.quiet,
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
    useHunger = this.actor.data.data.options.hunger.value

    const sphere = this.actor.data.data.spheres[item.data.data.sphere].value;
    const arete = this.actor.data.data.avatar.arete;
    const ongoingPenalty = 0;
    const dicePool = sphere + arete - ongoingPenalty;

    rollDice(dicePool, this.actor, `${item.data.name}`, 0,
      {
        useHunger: useHunger,
        useQuiet: this.quiet,
        imageSet: this.imageSet
      });
  }

  _onParadoxRiskRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('MTA5E.ParadoxRisk')}</label>
              <input type="text" id="paradoxRisk" value="">
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Roll'),
        callback: async (html) => {
          const numDice = parseInt(html.find('#paradoxRisk')[0].value, 10) || 0
          rollDice(numDice, this.actor, game.i18n.localize('MTA5E.ParadoxRisk'), 0,
          {
            useHunger: false,
            useQuiet: false,
            imageSet: 'quiet'
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

  /**
   * Used for the Quintessence-Paradox wheel
   */
  _onSquareCounter3StepChange (event) {
    event.preventDefault()

    const parseCounterStates = (states) => {
      return states.split(',').reduce((obj, state) => {
        const [k, v] = state.split(':')
        obj[k] = v
        return obj
      }, {})
    }

    const element = event.currentTarget
    const index = Number(element.dataset.index)
    const oldState = element.dataset.state || ''
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    console.log(data);
    const states = parseCounterStates(data.states)
    const fields = data.name.split('.')
    var steps = parent.find('.resource-counter-step')

    const fulls = Number(data[states['-']]) || 0
    const halfs = Number(data[states['/']]) || 0
    const crossed = Number(data[states.x]) || 0
    if (steps.length === 0) {
      steps = parent.find('.resource-vitality-step')
    }

    // ensure index is in bounds
    if (index < 0 || index > steps.length) {
      return
    }

    // Find what the current state is ('', '-', '/', 'x')
    const allStates = ['', ...Object.keys(states)]
    const currentState = allStates.indexOf(oldState)
    if (currentState < 0) {
      return
    }

    const newState = allStates[(currentState + 1) % allStates.length]
    steps[index].dataset.state = newState

    if (oldState !== '' && oldState !== '-') {
      data[states[oldState]] = Number(data[states[oldState]]) - 1
    }

    // If the step was removed we also need to subtract from the maximum.
    if (oldState !== '' && newState === '') {
      data[states['-']] = Number(data[states['-']]) - 1
    }

    if (newState !== '') {
      data[states[newState]] = Number(data[states[newState]]) + Math.max(index + 1 - fulls - halfs - crossed, 1)
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = Number(data[k]) || 0

      return obj
    }, {})

    // const newValues = {
    //   'data.health.superficial': data[states['-']] || 0,
    //   'data.health.lethal': data[states['/']] || 0,
    //   'data.health.aggravated': data[states['x']]|| 0,
    // };
    // this.actor.update(newValues);
    // console.log(newValues);
    // console.log(this.actor.data.data.health);
    this._assignToActorField(fields, newValue)
  }
}

