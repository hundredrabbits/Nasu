'use strict'

/* globals SPRITESHEET, COLORS, Editor, client */

function SpriteEditor (screen = { w: 32, h: 32 }) {
  Editor.call(this, 1)

  this.brush = 1

  this._wrapper.id = 'sprite_editor'
  this._color1Button = document.createElement('a')
  this._color2Button = document.createElement('a')
  this._color3Button = document.createElement('a')
  this._color4Button = document.createElement('a')

  this.installInterface = (host) => {
    this._color1Button.innerHTML = 'c1'
    this._color2Button.innerHTML = 'c2'
    this._color3Button.innerHTML = 'c3'
    this._color4Button.innerHTML = 'c4'
    host.appendChild(this._color1Button)
    host.appendChild(this._color2Button)
    host.appendChild(this._color3Button)
    host.appendChild(this._color4Button)
    this._color1Button.onclick = (e) => { this.selectColor(0) }
    this._color2Button.onclick = (e) => { this.selectColor(1) }
    this._color3Button.onclick = (e) => { this.selectColor(2) }
    this._color4Button.onclick = (e) => { this.selectColor(3) }

    this.selectColor(0)
  }

  this.whenMouseDown = (pos) => {
    this.paint(pos, this.brush)
    this.select(pos)
  }

  this.whenMouseMove = (pos) => {
    this.paint(pos, this.brush)
    this.select(pos)
  }

  this.whenMouseUp = (pos) => {
    client.tileEditor.update()
    client.nametableEditor.update()
  }

  this.paint = (pos, value) => {
    const relPos = relativePosition(pos)
    const relId = (relPos.tile * 64) + ((relPos.y * 8) + relPos.x) + (client.tileEditor.offset * 1024)
    if (SPRITESHEET[relId] === value) { return }
    SPRITESHEET[relId] = value
    this.update()
  }

  this.select = (pos) => {
    this.selection = { x: Math.floor(pos.x / 8), y: Math.floor(pos.y / 8) }
    this.update()
  }

  this.modSelect = (mod) => {
    this.selection = { x: clamp(this.selection.x + mod.x, 0, 3), y: clamp(this.selection.y - mod.y, 0, 3) }
    this.update()
  }

  this.erase = () => {
    const tileOffset = this.selection.x + (this.selection.y * 4)
    const pixelOffset = tileOffset * 64
    const sheetOffset = (client.tileEditor.offset * 1024) + pixelOffset
    for (let i = 0; i < 64; i++) {
      SPRITESHEET[sheetOffset + i] = 0
    }
    client.update()
  }

  this.drawTiles = () => {
    // Cluster us 4x4 tiles
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const tile = (x + (y * 4))
        this.drawTile(tile, { x, y })
      }
    }
  }

  this.drawTile = (tile, offset) => {
    // Tile is 8x8 pixels
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const id = (client.tileEditor.offset * 1024) + (tile * 64) + (x + (y * 8))
        if (SPRITESHEET[id] < 1) { continue }
        const pos = { x: ((offset.x * 8) + x) * 8, y: ((offset.y * 8) + y) * 8 }
        this.drawPixel(pos, 8, COLORS[SPRITESHEET[id]])
      }
    }
  }

  this.selectColor = (id) => {
    this._color1Button.className = id === 0 ? 'active' : ''
    this._color2Button.className = id === 1 ? 'active' : ''
    this._color3Button.className = id === 2 ? 'active' : ''
    this._color4Button.className = id === 3 ? 'active' : ''
    this.brush = id
  }

  // Helpers

  function relativePosition (pos) {
    const offset = { x: pos.x % 8, y: pos.y % 8 }
    const tile = Math.floor(pos.x / 8) + (Math.floor(pos.y / 8) * 4)
    return { x: offset.x, y: offset.y, tile: tile }
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
