'use strict'

/* globals SPRITESHEET, Editor, client */

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

  this.whenMouseDown = (pos, special) => {
    if (special !== true) {
      this.paint(pos, this.brush)
    }
    const tileOffset = Math.floor(client.selection / 16)
    const id = (tileOffset * 16) + Math.floor(pos.x / 8) + (Math.floor(pos.y / 8) * 4)
    client.select(id)
    this.update()
  }

  this.whenMouseMove = (pos, special) => {
    if (special !== true) {
      this.paint(pos, this.brush)
    }
    const tileOffset = Math.floor(client.selection / 16)
    const id = (tileOffset * 16) + Math.floor(pos.x / 8) + (Math.floor(pos.y / 8) * 4)
    client.select(id)
    this.update()
  }

  this.whenMouseUp = (pos, special) => {
    client.update()
  }

  this.paint = (pos, value) => {
    const tileOffset = Math.floor(client.selection / 16)
    const relPos = relativePosition(pos)
    const relId = (relPos.tile * 64) + ((relPos.y * 8) + relPos.x) + (tileOffset * 1024)
    if (SPRITESHEET[relId] === value) { return }
    SPRITESHEET[relId] = value
  }

  this.erase = () => {
    const tileOffset = Math.floor(client.selection / 16)
    const pixelOffset = client.selection * 64
    const sheetOffset = (tileOffset * 1024) + pixelOffset
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
    const tileOffset = Math.floor(client.selection / 16)
    // Tile is 8x8 pixels
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const id = (tileOffset * 1024) + (tile * 64) + (x + (y * 8))
        if (SPRITESHEET[id] < 1) { continue }
        const pos = { x: ((offset.x * 8) + x) * 8, y: ((offset.y * 8) + y) * 8 }
        this.drawPixel(pos, 8, client.getColor(SPRITESHEET[id]))
      }
    }
  }

  this.drawGuides = () => {
    if (client.guides !== true || client.selection === null) { return }
    const rect = { x: (client.selection % 4) * 64, y: (Math.floor(client.selection / 4) % 4) * 64, w: 64, h: 64 }
    this.drawRect(rect, client.theme.active.b_inv)
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
}
