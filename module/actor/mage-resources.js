/* global ChatMessage, Roll, game */

const wheel_size = 10; // this used to be 20...

export function _assignToActorField (fields, value) {
  const actorData = duplicate(this.actor)
  const lastField = fields.pop()

  if (fields[0] === 'item') {
    var itemIndex = -1;

    actorData.items.find(function(item, i){
      if (item._id === fields[1]) {
        itemIndex = i
      }
    })

    actorData.items[itemIndex].data.value = value
  } else {
    fields.reduce((data, field) => data[field], actorData)[lastField] = value
  }

  // actorData.data[lastField] = value
  this.actor.update(actorData)
}

export function _onDotCounterEmpty (event) {
  event.preventDefault()
  const element = event.currentTarget
  const parent = $(element.parentNode)
  const fieldStrings = parent[0].dataset.name
  const fields = fieldStrings.split('.')
  const steps = parent.find('.resource-value-empty')

  steps.removeClass('active')
  this._assignToActorField(fields, 0)
}

export function _onSquareCounterChange (event) {
  event.preventDefault()
  const element = event.currentTarget
  const index = Number(element.dataset.index)
  const oldState = element.dataset.state || ''
  const parent = $(element.parentNode)
  const data = parent[0].dataset
  const states = parseCounterStates(data.states)
  const fields = data.name.split('.')
  var steps = parent.find('.resource-counter-step')
  const humanity = data.name === 'data.humanity'
  const fulls = Number(data[states['-']]) || 0
  const halfs = Number(data[states['/']]) || 0
  const crossed = Number(data[states.x]) || 0

  if (steps.length === 0) {
    steps = parent.find('.resource-counter2-step')
  }

  if (steps.length === 0) {
    steps = parent.find('.resource-counter3-step')
  }

  if (steps.length === 0) {
    steps = parent.find('.resource-vitality-step')
  }

  if (index < 0 || index > steps.length) {
    return
  }

  const allStates = ['', ...Object.keys(states)]
  const currentState = allStates.indexOf(oldState)
  if (currentState < 0) {
    return
  }

  const newState = allStates[(currentState + 1) % allStates.length]
  steps[index].dataset.state = newState

  if ((oldState !== '' && oldState !== '-') || (oldState !== '' && humanity)) {
    data[states[oldState]] = Number(data[states[oldState]]) - 1
  }

  // If the step was removed we also need to subtract from the maximum.
  if (oldState !== '' && newState === '' && !humanity) {
    data[states['-']] = Number(data[states['-']]) - 1
  }

  if (newState !== '') {
    data[states[newState]] = Number(data[states[newState]]) + Math.max(index + 1 - fulls - halfs - crossed, 1)
  }

  const newValue = Object.values(states).reduce(function (obj, k) {
    obj[k] = Number(data[k]) || 0

    return obj
  }, {})

  this._assignToActorField(fields, newValue)
}

export function _onSquareSybCounterChange (event) {
  event.preventDefault()
  const element = event.currentTarget
  const index = Number(element.dataset.index)
  const oldState = element.dataset.state || ''
  const parent = $(element.parentNode)
  const data = parent[0].dataset
  const states = parseCounterStates(data.states)
  const fields = data.name.split('.')
  var steps = parent.find('.resource-counter-syb-step')
  const halfs = Number(data[states['/']]) || 0
  const crossed = Number(data[states.x]) || 0

  if (index < 0 || index > steps.length) {
    return
  }

  const allStates = ['', ...Object.keys(states)]
  const currentState = allStates.indexOf(oldState)
  if (currentState < 0) {
    return
  }

  const newState = allStates[(currentState + 1) % allStates.length]
  steps[index].dataset.state = newState

  if ((oldState !== '' && oldState !== '-') || (oldState !== '')) {
    data[states[oldState]] = Number(data[states[oldState]]) - 1
  }

  // If the step was removed we also need to subtract from the maximum.
  if (oldState !== '' && newState === '') {
    data[states['-']] = Number(data[states['-']]) - 1
  }

  if (newState !== '') {
    data[states[newState]] = Number(data[states[newState]]) + Math.max(index + 1 - halfs - crossed, 1)
  }

  const newValue = Object.values(states).reduce(function (obj, k) {
    obj[k] = Number(data[k]) || 0
    return obj
  }, {})

  this._assignToActorField(fields, newValue)
}

export function _onSquare2cfCounterChange (event) {
  event.preventDefault()
  const element = event.currentTarget
  const index = element.dataset.index
  const state = element.dataset.state

  let totalQ = this.actor.data.data.magika.quintessence
  let totalP = this.actor.data.data.magika.paradox
  const permP  = this.actor.data.data.magika.permparadox
  const maxQuintAllowed = wheel_size - permP;

  const stapOver = (totalQ + totalP) === wheel_size

  if (index === 'q') {
    if (state === '+') {
      // Add if quintessence < wheel_size
      (totalQ < maxQuintAllowed) && totalQ++;
      // Stap Over Paradox if necessary
      (stapOver) && totalP--;
    }else{
      // Remove if quintessence > 0
      (totalQ > 0) && totalQ--;
    }
  }else{
    if (state === '+') {
      (totalP < wheel_size) && totalP++;
      stapOver && totalQ && totalQ--;
    }else{
      (totalP > permP) && totalP--;
    }
  }
  totalP = Math.max(totalP, permP);
  // this._assignToActorField(['data', 'magika'], {
  //   paradox: totalP,
  //   quintessence: totalQ
  // })
  this.actor.update({
    'data.magika.quintessence': totalQ,
    'data.magika.paradox': totalP
  })
  console.log('actor updated with:', totalQ, totalP);
}

export function _onDotCounterChange (event) {
  event.preventDefault()
  const element = event.currentTarget
  const dataset = element.dataset
  const index = Number(dataset.index)
  const parent = $(element.parentNode)
  const fieldStrings = parent[0].dataset.name
  const fields = fieldStrings.split('.')
  const steps = parent.find('.resource-value-step')
  if (index < 0 || index > steps.length) {
    return
  }

  steps.removeClass('active')
  steps.each(function (i) {
    if (i <= index) {
      $(this).addClass('active')
    }
  })
  this._assignToActorField(fields, index + 1)
}

export function _setupDotCounters (html) {
  html.find('.resource-value').each(function () {
    const value = Number(this.dataset.value)
    $(this).find('.resource-value-step').each(function (i) {
      if (i + 1 <= value) {
        $(this).addClass('active')
      }
    })
  })
}

export function _setupSquareCounters (html) {
  html.find('.resource-counter').each(function () {
    const data = this.dataset
    const states = parseCounterStates(data.states)
    const humanity = data.name === 'data.humanity'

    const fulls = Number(data[states['-']]) || 0
    const halfs = Number(data[states['/']]) || 0
    const crossed = Number(data[states.x]) || 0

    const values = humanity ? new Array(fulls + halfs) : new Array(fulls)
    values.fill('-', 0, fulls)
    if (humanity) {
      values.fill('/', fulls, fulls + halfs)
    } else {
      values.fill('/', fulls - halfs - crossed, fulls - crossed)
      values.fill('x', fulls - crossed, fulls)
    }

    $(this).find('.resource-counter-step').each(function () {
      this.dataset.state = ''
      if (this.dataset.index < values.length) {
        this.dataset.state = values[this.dataset.index]
      }
    })

    $(this).find('.resource-counter2-step').each(function () {
      this.dataset.state = ''
      if (this.dataset.index < values.length) {
        this.dataset.state = values[this.dataset.index]
      }
    })

    $(this).find('.resource-counter3-step').each(function () {
      this.dataset.state = ''
      if (this.dataset.index < values.length) {
        this.dataset.state = values[this.dataset.index]
      }
    })

    $(this).find('.resource-vitality-step').each(function () {
      this.dataset.state = ''
      if (this.dataset.index < values.length) {
        this.dataset.state = values[this.dataset.index]
      }
    })
  })
}

export function _setupSquareCountersSyb (html) {
  html.find('.resource-counter-syb').each(function () {
    const data = this.dataset
    const states = parseCounterStates(data.states)

    const halfs = Number(data[states['/']]) || 0
    const crossed = Number(data[states.x]) || 0

    const values = new Array(halfs)
    values.fill('/', 0, halfs)
    values.fill('x', halfs - crossed, halfs)

    $(this).find('.resource-counter-syb-step').each(function () {
      this.dataset.state = ''
      if (this.dataset.index < values.length) {
        this.dataset.state = values[this.dataset.index]
      }
    })
  })
}

export function _setupSquareCounters2cf (html) {
  html.find('.resource-counter-2cf').each(function () {
    const data = this.dataset
    const states = parseCounterStates(data.states)

    const fulls = Number(data[states['-']]) || 0
    const halfs = Number(data[states['/']]) || 0

    const values = new Array(wheel_size)

    values.fill('-', 0, fulls)
    values.fill('/', wheel_size - halfs, wheel_size)

    $(this).find('.resource-counter-2cf-step').each(function () {
      this.dataset.state = ''
      if (this.dataset.index < values.length) {
        this.dataset.state = values[this.dataset.index]
      }
    })
  })
}

function parseCounterStates (states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}
