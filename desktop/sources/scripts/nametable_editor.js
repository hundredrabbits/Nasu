'use strict'

/* globals SPRITESHEET, NAMETABLE, Editor, client */

function NametableEditor (screen = { w: 32, h: 32 }) {
  Editor.call(this, 2)

  this.selection = null
  this._wrapper.id = 'nametable_editor'
  this._importButton = document.createElement('a')
  this._exportButton = document.createElement('a')

  this.installInterface = (host) => {
    host.appendChild(this._exportButton)
    host.appendChild(this._importButton)
    this._importButton.onclick = this.import
    this._exportButton.onclick = this.export
  }

  this.whenMouseDown = (pos, special) => {
    if (special !== true) {
      this.paint(pos, this.brush)
      this.unselect()
    } else {
      const size = { x: pos.x / 8, y: pos.y / 8 }
      this.selection = { x: size.x, y: size.y, w: 2, h: 2, special: true }
      this.update()
    }
  }

  this.whenMouseMove = (pos, special) => {
    if (!this.selection || this.selection.special !== true) {
      this.paint(pos, this.brush)
    } else {
      const size = { x: pos.x / 8, y: pos.y / 8 }
      this.selection.w = clamp((((pos.x / 8) + 0.25) - this.selection.x) * 8, 2, 20)
      this.selection.h = clamp((((pos.y / 8) + 0.25) - this.selection.y) * 8, 2, 20)
      this.update()
    }
  }

  this.whenMouseUp = (pos, special) => {
    if (!this.selection || this.selection.special !== true) {
      return
    }
    this.selection.special = false
  }

  this.paint = (pos, value) => {
    const id = (pos.x / 2) + ((pos.y / 2) * 32)
    const tile = (client.tileEditor.offset * 16) + (client.spriteEditor.selection.x + (4 * client.spriteEditor.selection.y))
    NAMETABLE[id] = tile % 256
    this.update()
  }

  this.select = (pos) => {
    this.selection = { x: Math.floor(pos.x / 8), y: Math.floor(pos.y / 8), special: false }
    this.update()
  }

  this.unselect = () => {
    this.selection = null
    this.update()
  }

  this.drawTiles = () => {
    // Screen 32x30
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 30; y++) {
        const id = x + (y * 32)
        this.drawTile({ x: x * 16, y: y * 16 }, NAMETABLE[id])
      }
    }
  }

  this.drawTile = (offset, tile) => {
    // Tile 8x8
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const id = (tile * 64) + (y * 8) + x + (client.tileEditor.page * 16384)
        const pos = { x: ((offset.x) + (x * 2)), y: ((offset.y) + (y * 2)) }
        if (SPRITESHEET[id] < 1) { continue }
        this.drawPixel(pos, this.scale, client.getColor(SPRITESHEET[id]))
      }
    }
  }

  this.toString = () => {
    let txt = 'background:\n'
    for (let y = 0; y < 30; y++) {
      txt += '  .db '
      for (let x = 0; x < 32; x++) {
        const id = x + (y * 32)
        txt += `${toHex(NAMETABLE[id])}${(x < 32 - 1 ? ',' : '')}`
      }
      txt += '\n'
    }
    return txt
  }

  this.toStringSelection = (size) => {
    let txt = 'selection:\n'
    for (let y = size.y; y < size.h + size.y; y++) {
      txt += '  .db '
      for (let x = size.x; x < size.w + size.x; x++) {
        const id = x + (y * 32)
        txt += `${toHex(NAMETABLE[id])}${(x < 32 - 1 ? ',' : '')}`
      }
      txt += '\n'
    }
    return txt
  }

  this.parse = (file, data) => {
    const lines = data.split('\n').filter((item) => { return item.indexOf('.db ') > -1 })
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().replace('.db ', '')
      const tiles = line.split(',')
      for (const tileId in tiles) {
        const id = (i * tiles.length) + parseInt(tileId)
        const value = tiles[tileId]
        NAMETABLE[id] = parseInt(value.substr(1), 16)
      }
    }
    client.update()
  }

  this.import = () => {
    client.source.open('asm', this.parse)
  }

  this.export = () => {
    if (this.selection) {
      const size = { x: this.selection.x * 4, y: this.selection.y * 4, w: this.selection.w / 2, h: this.selection.h / 2 }
      client.source.write('selection', 'asm', `${this.toStringSelection(size)}`, 'text/plain')
    } else {
      client.source.write('background', 'asm', `${this}`, 'text/plain')
    }
  }

  // Helpers

  function toHex (int) {
    return '$' + (int % 128 || 0).toString(16).padStart(2, '0')
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
