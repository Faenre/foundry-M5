/* global game, mergeObject */

import { GhoulActorSheet } from './ghoul-actor-sheet.js'
import { getBloodPotencyValues, getBloodPotencyText } from './blood-potency.js'
import { rollDice } from './roll-dice.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {GhoulActorSheet}
 */

export class MageActorSheet extends GhoulActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'sheet', 'actor', 'mage']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/mta5e/templates/actor/vampire-sheet.html',
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
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/mta5e/templates/actor/limited-sheet.html'
    return 'systems/mta5e/templates/actor/mage-sheet.html'
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
      data: [],
      entropy: [],
      forces: [],
      life: [],
      matter: [],
      mind: [],
      prime: [],
      primal: [],
      spirit: [],
      dimensionalscience: [],
      time: [],
    };
    actorData.avatar = {
      arete: 0,
      essence: '',
    };
  }

  /** @override */
  _onMagickRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const item = this.actor.items.get(dataset.id)

    const dice1 = this.actor.data.data.sphere[item.data.data.sphere].value;
    const dice2 = this.avatar.arete;
    const dicePool = dice1 + dice2;

    rollDice(dicePool, this.actor, `${item.data.name}`, 0, useHunger=this.hunger, useQuiet=this.quiet, imageSet='mage');
  }

  /** @override */
  _onVampireRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const item = this.actor.items.get(dataset.id)
    let disciplineValue = 0
    if (item.data.data.discipline === 'rituals') {
      disciplineValue = this.actor.data.data.disciplines.sorcery.value
    } else if (item.data.data.discipline === 'ceremonies') {
      disciplineValue = this.actor.data.data.disciplines.oblivion.value
    } else {
      disciplineValue = this.actor.data.data.disciplines[item.data.data.discipline].value
    }
    disciplineValue += this.actor.bloodPotency.power // Blood potency power adds dices to discipline rolls only

    const dice1 = item.data.data.dice1 === 'discipline' ? disciplineValue : this.actor.data.data.abilities[item.data.data.dice1].value

    let dice2 = this.actor.avatar.arete;

    const dicePool = dice1 + dice2
    rollDice(dicePool, this.actor, `${item.data.name}`, 0, this.hunger, useQuiet=true, imageSet='mage');
  }
}
