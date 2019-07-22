let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`



// ---------------------------------
// LEVEL
// ---------------------------------
class Level {
  constructor(plan) {
    let rows = plan.trim().split('\n').map(l => [...l])

    this.height = rows.length
    this.width = rows[0].length
    this.startActors = []

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch]
        if (typeof type === 'string') return type
        this.startActors.push(
          type.create(new Vec(x, y), ch))
        return 'empty'
      })
    })
  }

  touches(pos, size, type) {
    let xStart = Math.floor(pos.x)
    let xEnd = Math.ceil(pos.x + size.x)
    let yStart = Math.floor(pos.y)
    let yEnd = Math.ceil(pos.y + size.y)

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let isOutside = x < 0 || x >= this.width ||
          y < 0 || y >= this.height
        let here = isOutside ? 'wall' : this.rows[y][x]
        if (here == type) return true
      }
    }
    return false
  }
}

// ---------------------------------
// STATE
// ---------------------------------
class State {
  constructor(level, actors, status) {
    this.level = level
    this.actors = actors
    this.status = status

  }

  static start(level) {
    return new State(level, level.startActors, 'playing')
  }

  get player() {
    return this.actors.find(a => a.type == 'player')
  }

  update(time, keys) {
    let actors = this.actors.map(actor =>
      actor.update(time, this, keys))
    let newState = new State(this.level, actors, this.status)

    if (newState.status != 'playing') return newState

    let player = newState.player
    if (this.level.touches(player.pos, player.size, 'clock')) {
      return new State(this.level, actors, 'lost')
    }

    let player2 = newState.player
    if (this.level.touches(player.pos, player.size, 'coffee')) {
      return new State(this.level, actors, 'lost')
    }

    for (let actor of actors) {
      if (actor != player && overlap(actor, player)) {
        newState = actor.collide(newState)
      }
    }
    return newState
  }
}

// ---------------------------------
// VEC
// ---------------------------------
class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y
  }

  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y)
  }

  times(factor) {
    return new Vec(this.x * factor, this.y * factor)
  }
}

// ---------------------------------
// PLAYER
// ---------------------------------
class Player {
  constructor(pos, speed) {
    this.pos = pos
    this.speed = speed
  }

  get type() {
    return 'player'
  }

  static create(pos) {
    return new Player(pos.plus(new Vec(0, -0.5)),
      new Vec(0, 0))
  }

  update(time, state, keys) {
    // speed
    let xSpeed = 0
    if (keys.ArrowLeft) xSpeed -= playerXSpeed
    if (keys.ArrowRight) xSpeed += playerXSpeed

    // position (top left corner)
    let pos = this.pos
    let movedX = pos.plus(new Vec(xSpeed * time, 0))
    if (!state.level.touches(movedX, this.size, 'wall')) {
      pos = movedX
    }

    // gravity
    let ySpeed = this.speed.y + time * gravity
    let movedY = pos.plus(new Vec(0, ySpeed * time))

    if (!state.level.touches(movedY, this.size, 'wall')) {
      pos = movedY
    } else if (keys.ArrowUp && ySpeed > 0) {
      ySpeed = -jumpSpeed
    } else {
      ySpeed = 0
    }
    return new Player(pos, new Vec(xSpeed, ySpeed))
  }
}

// Player.prototype.size = new Vec(0.8, 1.5)
Player.prototype.size = new Vec(0.7, 1.5)

// ---------------------------------
// CLOCK
// ---------------------------------
class Clock {
  constructor(pos, speed, reset) {
    this.pos = pos
    this.speed = speed
    this.reset = reset
  }

  get type() {
    return 'clock'
  }

  static create(pos, ch) {
    if (ch == '=') {
      return new Clock(pos, new Vec(2, 0))
    } else if (ch == '|') {
      return new Clock(pos, new Vec(0, 2))
    } else if (ch == 'v') {
      return new Clock(pos, new Vec(0, 3), pos)
    }
  }

  collide(state) {
    return new State(state.level, state.actors, 'lost')
  }

  update(time, state) {
    let newPos = this.pos.plus(this.speed.times(time))

    if (!state.level.touches(newPos, this.size, 'wall')) {
      return new Clock(newPos, this.speed, this.reset)
    } else if (this.reset) {
      return new Clock(this.reset, this.speed, this.reset)
    } else {
      return new Clock(this.pos, this.speed.times(-1))
    }
  }
}

Clock.prototype.size = new Vec(1, 1)

// ---------------------------------
// COFFEE
// ---------------------------------
class Coffee {
  // constructor(pos, speed, reset) {
  //   this.pos = pos
  //   this.speed = speed
  //   this.reset = reset
  // }

  // get type() {
  //   return 'coffee'
  // }

  // static create(pos, ch) {
  //   if (ch == '~') {
  //     return new Coffee(pos, new Vec(2, 0))
  //   }
  // }

  // collide(state) {
  //   return new State(state.level, state.actors, 'lost')
  // }

  // update(time, state) {
  //   let newPos = this.pos.plus(this.speed.times(time))

  //   if (!state.level.touches(newPos, this.size, 'wall')) {
  //     return new Coffee(newPos, this.speed, this.reset)
  //   } else if (this.reset) {
  //     return new Coffee(this.reset, this.speed, this.reset)
  //   } else {
  //     return new Coffee(this.pos, this.speed.times(-1))
  //   }
  // }
}

// Coffee.prototype.size = new Vec(3, 3)

// ---------------------------------
// COMPUTER
// ---------------------------------
class Computer {
  constructor(pos, basePos, wobble) {
    this.pos = pos
    this.basePos = basePos
    this.wobble = wobble
  }

  get type() {
    return 'computer'
  }

  static create(pos) {
    let basePos = pos.plus(new Vec(0.2, 0.1))
    return new Computer(basePos, basePos,
      Math.random() * Math.PI * 2)
  }

  collide(state) {
    let filtered = state.actors.filter(a => a != this)
    let status = state.status
    if (!filtered.some(a => a.type == 'computer')) status = 'won'
    return new State(state.level, filtered, status)
  }

  update(time) {
    let wobble = this.wobble + time * wobbleSpeed
    let wobblePos = Math.sin(wobble) * wobbleDist
    return new Computer(this.basePos.plus(new Vec(0, wobblePos)),
      this.basePos, wobble)
  }
}

let wobbleSpeed = 8;
let wobbleDist = 0.07
// Computer.prototype.size = new Vec(0.6, 0.6)
Computer.prototype.size = new Vec(2, 2)

// ---------------------------------
// LEVEL  CHARS
// ---------------------------------
let levelChars = {
  '.': 'empty',
  '#': 'wall',
  '+': 'clock',
  '~': 'coffee',
  '@': Player,
  'o': Computer,
  '=': Clock,
  '|': Clock,
  'v': Clock,
  '&': Coffee
}

new Level(simpleLevelPlan)

// ---------------------------------
// ELT
// ---------------------------------
// helper function creates an element and gives it some attributes and child nodes
function elt(name, attrs, ...children) {
  let dom = document.createElement(name)

  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr])
  }
  for (let child of children) {
    dom.appendChild(child)
  }
  return dom
}

// ---------------------------------
// DOM DISPLAY
// ---------------------------------
// A display is created by giving it a parent element to which it should append itself and a level object.
class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt('div', { class: 'game' }, drawGrid(level))
    this.actorLayer = null
    parent.appendChild(this.dom)
  }

  clear() {
    this.dom.remove()
  }

  syncState(state) {
    if (this.actorLayer) this.actorLayer.remove()

    this.actorLayer = drawActors(state.actors)
    this.dom.appendChild(this.actorLayer)
    this.dom.className = `game ${state.status}`
    this.scrollPlayerIntoView(state)
  }

  scrollPlayerIntoView(state) {
    let width = this.dom.clientWidth
    let height = this.dom.clientHeight
    let margin = width / 3

    // The viewport
    let left = this.dom.scrollLeft; let right = left + width
    let top = this.dom.scrollTop; let bottom = top + height

    let player = state.player
    let center = player.pos.plus(player.size.times(0.5))
      .times(scale)

    if (center.x < left + margin) {
      this.dom.scrollLeft = center.x - margin
    } else if (center.x > right - margin) {
      this.dom.scrollLeft = center.x + margin - width
    }
    if (center.y < top + margin) {
      this.dom.scrollTop = center.y - margin
    } else if (center.y > bottom - margin) {
      this.dom.scrollTop = center.y + margin - height
    }
  }
}

// ---------------------------------
// SCALE
// ---------------------------------
let scale = 25

// ---------------------------------
// DRAW GRID
// ---------------------------------
function drawGrid(level) {
  return elt('table', {
    class: 'background',
    style: `width: ${level.width * scale}px`
  },

    ...level.rows.map(row =>
      elt('tr', { style: `height: ${scale}px` },

        ...row.map(type =>
          elt('td', { class: type })))
    ))
}

// ---------------------------------
// DRAW ACTORS
// ---------------------------------
function drawActors(actors) {
  return elt('div', {}, ...actors.map(actor => {
    let rect = elt('div', { class: `actor ${actor.type}` })

    rect.style.width = `${actor.size.x * scale}px`
    rect.style.height = `${actor.size.y * scale}px`
    rect.style.left = `${actor.pos.x * scale}px`
    rect.style.top = `${actor.pos.y * scale}px`

    return rect
  }))
}

// ---------------------------------
// OVERLAP
// ---------------------------------
function overlap(actor1, actor2) {
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y < actor2.pos.y + actor2.size.y
}

// ---------------------------------
// KEY EVENT
// ---------------------------------
function trackKeys(keys) {
  let down = Object.create(null)
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == 'keydown'
      event.preventDefault()
    }
  }
  window.addEventListener('keydown', track)
  window.addEventListener('keyup', track)
  return down
}

let arrowKeys =
  trackKeys(['ArrowLeft', 'ArrowRight', 'ArrowUp'])

function runAnimation(frameFunc) {
  let lastTime = null
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000
      if (frameFunc(timeStep) === false) return
    }
    lastTime = time
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

let playerXSpeed = 7
let gravity = 30
let jumpSpeed = 17

function runLevel(level, Display) {
  let display = new Display(document.body, level)
  let state = State.start(level)
  let ending = 1
  return new Promise(resolve => {
    runAnimation(time => {
      state = state.update(time, arrowKeys)
      display.syncState(state)
      if (state.status == 'playing') {
        return true
      } else if (ending > 0) {
        ending -= time
        return true
      } else {
        display.clear()
        resolve(state.status)
        return false
      }
    })
  })
}

// ---------------------------------
// WIN/LOSE
// ---------------------------------
async function runGame(plans, Display) {
  for (let level = 0; level < plans.length;) {
    let status = await runLevel(new Level(plans[level]),
      Display)
    if (status == 'won') level++
  }
  document.getElementById("title").innerHTML = "Congrats, you get to graduate!"
}
