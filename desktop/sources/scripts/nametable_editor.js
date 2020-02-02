'use strict'

/* globals SPRITESHEET, COLORS, NAMETABLE, Editor, client */

function NametableEditor (screen = { w: 32, h: 32 }) {
  Editor.call(this, 2)

  this._wrapper.id = 'nametable_editor'
  this._importButton = document.createElement('a')
  this._exportButton = document.createElement('a')

  this.installInterface = (host) => {
    host.appendChild(this._exportButton)
    host.appendChild(this._importButton)
    this._importButton.onclick = this.import
    this._exportButton.onclick = this.export
  }

  this.whenMouseDown = (pos) => {
    this.paint(pos, this.brush)
    this.select(pos)
  }

  this.whenMouseMove = (pos) => {
    this.paint(pos, this.brush)
    this.select(pos)
  }

  this.paint = (pos, value) => {
    const id = (pos.x / 2) + ((pos.y / 2) * 32)
    const tile = (client.tileEditor.offset * 16) + (client.spriteEditor.selection.x + (4 * client.spriteEditor.selection.y))
    NAMETABLE[id] = tile
    this.update()
  }

  this.select = (pos) => {
    this.selection = { x: Math.floor(pos.x / 8), y: Math.floor(pos.y / 8) }
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
        const id = (tile * 64) + (y * 8) + x
        const pos = { x: ((offset.x) + (x * 2)), y: ((offset.y) + (y * 2)) }
        if (SPRITESHEET[id] < 1) { continue }
        this.drawPixel(pos, this.scale, COLORS[SPRITESHEET[id]])
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
    client.source.write('background', 'asm', `${this}`, 'text/plain')
  }

  // Helpers

  function toHex (int) {
    return '$' + (int % 128 || 0).toString(16).padStart(2, '0')
  }
}
