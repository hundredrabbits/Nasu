'use strict'

/* globals client */

function Editor (scale = 1, screen = { w: 32, h: 32 }) {
  this.selection = { x: 0, y: 0 }

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

    this.installInterface(this._interface)
  }

  this.installInterface = (host) => {

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
    for (var x = 1; x < 32; x++) {
      this.drawLine({ x: x * 8 * scale, y: 0 }, { x: x * 8 * scale, y: 256 * scale }, 0.5, x % 8 === 0 ? client.theme.active.b_high : x % 4 === 0 ? client.theme.active.b_med : client.theme.active.b_low)
    }
    for (var y = 1; y < 32; y++) {
      this.drawLine({ x: 0, y: y * 8 * scale }, { x: 256 * scale, y: y * 8 * scale }, 0.5, y % 8 === 0 ? client.theme.active.b_high : y % 4 === 0 ? client.theme.active.b_med : client.theme.active.b_low)
    }
  }

  this.drawGuides = () => {
    if (client.guides !== true) { return }
    const rect = { x: this.selection.x * 8 * 8, y: this.selection.y * 8 * 8, w: 8 * 8, h: 8 * 8 }
    this.context.beginPath()
    this.context.rect(rect.x + 0.5, rect.y + 0.5, rect.w, rect.h)
    this.context.strokeStyle = client.theme.active.b_inv
    this.context.stroke()
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

  // Mouse

  this.isMouseDown = false
  this.mouseLastPos = null

  this.onMouseDown = (e) => {
    this.isMouseDown = true
    const tilepos = tilePosition({ x: e.layerX, y: e.layerY }, this.scale)
    this.whenMouseDown(tilepos)
    this.mouseLastPos = tilepos
  }

  this.onMouseMove = (e) => {
    if (!this.isMouseDown) { return }
    const tilepos = tilePosition({ x: e.layerX, y: e.layerY }, this.scale)
    if (positionsEqual(tilepos, this.mouseLastPos)) { return }
    this.whenMouseMove(tilepos)
    this.mouseLastPos = tilepos
  }

  this.onMouseUp = (e) => {
    this.isMouseDown = false
    const tilepos = tilePosition({ x: e.layerX, y: e.layerY }, this.scale)
    this.whenMouseUp(tilepos)
    this.mouseLastPos = null
  }

  // Mouse Overrides

  this.whenMouseDown = (pos) => { }
  this.whenMouseMove = (pos) => { }
  this.whenMouseUp = (pos) => { }

  // Helpers

  function tilePosition (pos, scale) {
    return { x: Math.floor(pos.x / 8 / scale) * scale, y: Math.floor(pos.y / 8 / scale) * scale }
  }

  function positionsEqual (a, b) {
    return a.x === b.x && a.y === b.y
  }
}
