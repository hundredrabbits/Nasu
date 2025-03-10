'use strict'

/* globals client */

function Editor (scale = 1, screen = { w: 32, h: 32 }) {
  this.scale = scale
  this._wrapper = document.createElement('div')
  this._wrapper.className = 'wrapper'
  this._interface = document.createElement('div')
  this._interface.className = 'interface'
  this._canvas = document.createElement('canvas')
  this.context = this._canvas.getContext('2d')

  this.data = new Array(screen.w * screen.h)

  this.install = (host) => {
    this._wrapper.appendChild(this._canvas)
    this._wrapper.appendChild(this._interface)
    host.appendChild(this._wrapper)

    this._canvas.width = (scale * screen.w * 8) + 1
    this._canvas.height = (scale * screen.h * 8) + 1

    this._canvas.onmousedown = this.onMouseDown
    this._canvas.onmousemove = this.onMouseMove
    this._canvas.onmouseup = this.onMouseUp
    this._canvas.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation() }
  }

  this.start = () => {
    this.update()
  }

  this.update = () => {
    this.clear()
    this.drawGrid()
    this.drawTiles()
    this.drawGuides()
  }

  this.clear = () => {
    this.context.clearRect(0, 0, this._canvas.width, this._canvas.height)
  }

  this.drawGrid = () => {
    if (client.guides !== true) { return }
    for (var x = 1; x < 32 * scale; x++) {
      const color = x % 8 === 0 ? client.theme.active.b_high : x % 4 === 0 ? client.theme.active.b_med : client.theme.active.b_low
      this.drawLine({ x: x * 8, y: 0 }, { x: x * 8, y: 256 * scale }, 0.5, color)
    }
    for (var y = 1; y < 32 * scale; y++) {
      const color = y % 8 === 0 ? client.theme.active.b_high : y % 4 === 0 ? client.theme.active.b_med : client.theme.active.b_low
      this.drawLine({ x: 0, y: y * 8 }, { x: 256 * scale, y: y * 8 }, 0.5, color)
    }
  }

  this.drawPixel = (pos, size = 1, color = 'red') => {
    this.context.beginPath()
    this.context.rect(pos.x, pos.y, size, size)
    this.context.fillStyle = color
    this.context.fill()
  }

  this.drawLine = (a, b, size, color) => {
    this.context.beginPath()
    this.context.moveTo(a.x + 0.5, a.y + 0.5)
    this.context.lineTo(b.x + 0.5, b.y + 0.5)
    this.context.strokeStyle = color
    this.context.stroke()
  }

  this.drawRect = (rect, color) => {
    this.context.beginPath()
    this.context.rect(rect.x + 0.5, rect.y + 0.5, rect.w, rect.h)
    this.context.strokeStyle = color
    this.context.stroke()
  }

  // Mouse

  this.isMouseDown = false
  this.mouseLastPos = null

  this.onMouseDown = (e) => {
    this.isMouseDown = true
    const tilepos = tilePosition({ x: e.layerX, y: e.layerY }, this.scale)
    this.whenMouseDown(tilepos, e.button !== 0 || e.which !== 1)
    this.mouseLastPos = tilepos
  }

  this.onMouseMove = (e) => {
    if (!this.isMouseDown) { return }
    const tilepos = tilePosition({ x: e.layerX, y: e.layerY }, this.scale)
    if (positionsEqual(tilepos, this.mouseLastPos)) { return }
    this.whenMouseMove(tilepos, e.button !== 0 || e.which !== 1)
    this.mouseLastPos = tilepos
  }

  this.onMouseUp = (e) => {
    this.isMouseDown = false
    const tilepos = tilePosition({ x: e.layerX, y: e.layerY }, this.scale)
    this.whenMouseUp(tilepos, e.button !== 0 || e.which !== 1)
    this.mouseLastPos = null
  }

  // Mouse Overrides

  this.whenMouseDown = (pos, special) => { }
  this.whenMouseMove = (pos, special) => { }
  this.whenMouseUp = (pos, special) => { }

  // Helpers

  this.posToId = (pos) => {
    const blockId = Math.floor(pos.x / 8) + (Math.floor(pos.y / 8) * 4)
    const tileId = (Math.floor(pos.x / 2) % 4) + ((Math.floor(pos.y / 2) % 4) * 4)
    return (blockId * 16) + tileId
  }

  this.idToPos = (id) => {
    const blockId = Math.floor(id / 16)
    const blockRect = { x: (blockId % 4) * 64, y: Math.floor(blockId / 4) * 64 }
    const tileRect = { x: blockRect.x + (client.selection % 4) * 16, y: blockRect.y + (Math.floor(id / 4) * 16) % 64 }
    return { x: 2 * Math.floor(tileRect.x / 16), y: 2 * Math.floor(tileRect.y / 16) }
  }

  function tilePosition (pos, scale) {
    return { x: Math.floor(pos.x / 8 / scale) * scale, y: Math.floor(pos.y / 8 / scale) * scale }
  }

  function positionsEqual (a, b) {
    return a.x === b.x && a.y === b.y
  }
}
