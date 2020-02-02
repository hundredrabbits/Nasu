'use strict'

/* globals SPRITESHEET, COLORS, Editor, client, FileReader, Blob */

function TileEditor (screen = { w: 16, h: 16 }) {
  Editor.call(this, 1)

  this.page = 0
  this.offset = 0

  this._wrapper.id = 'tile_editor'
  this._page1Button = document.createElement('a')
  this._page2Button = document.createElement('a')
  this._importButton = document.createElement('a')
  this._exportButton = document.createElement('a')

  this.installInterface = (host) => {
    this._page1Button.innerHTML = 'p1'
    this._page2Button.innerHTML = 'p2'
    this._exportButton.innerHTML = '.chr'
    host.appendChild(this._page1Button)
    host.appendChild(this._page2Button)
    host.appendChild(this._exportButton)
    host.appendChild(this._importButton)

    this._page1Button.onclick = (e) => { this.selectPage(0) }
    this._page2Button.onclick = (e) => { this.selectPage(1) }
    this.selectPage(0)

    this._importButton.onclick = this.import
    this._exportButton.onclick = this.export
  }

  this.whenMouseDown = (pos) => {
    this.select(pos, this.brush)
  }

  this.whenMouseMove = (pos) => {
    this.select(pos, this.brush)
  }

  this.whenMouseUp = (pos) => {
    client.spriteEditor.update()
  }

  this.select = (pos) => {
    this.selection = { x: Math.floor(pos.x / 8), y: Math.floor(pos.y / 8) }
    client.spriteEditor.selection = { x: Math.floor(pos.x / 2) % 4, y: Math.floor(pos.y / 2) % 4 }
    this.offset = Math.floor(pos.x / 8) + (Math.floor(pos.y / 8) * 4) + (this.page * 16)
    this.update()
  }

  this.modSelect = (mod) => {
    this.selection = { x: clamp(this.selection.x + mod.x, 0, 3), y: clamp(this.selection.y - mod.y, 0, 3) }
    this.offset = this.selection.x + (this.selection.y * 4) + (this.page * 16)
    client.spriteEditor.update()
    this.update()
  }

  this.erase = () => {
    const sheetOffset = (client.tileEditor.offset * 1024)
    for (let i = 0; i < 1024; i++) {
      SPRITESHEET[sheetOffset + i] = 0
    }
    client.update()
  }

  this.drawTiles = () => {
    // Group us 4x4 clusters
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const id = ((x + (y * 4)) * 4 * 16)
        const pos = { x: x * 8 * 8, y: y * 8 * 8 }
        this.drawCluster(id, pos)
      }
    }
  }

  this.drawCluster = (group, offset) => {
    // Cluster us 4x4 tiles
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const id = group + ((x + (y * 4)) * 4)
        const pos = { x: offset.x + (x * 2 * 8), y: offset.y + (y * 2 * 8) }
        this.drawTile(id, pos)
      }
    }
  }

  this.drawTile = (cluster, offset) => {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const id = (cluster * 16) + (x + (y * 8)) + (this.page * 256 * 64)
        if (SPRITESHEET[id] < 1) { continue }
        const pos = { x: offset.x + (x * 2), y: offset.y + (y * 2) }
        this.drawPixel(pos, 2, COLORS[SPRITESHEET[id]])
      }
    }
  }

  // IO

  this.open = (file) => {
    if (!file) { return }
    const start = 0
    const stop = file.size - 1
    const reader = new FileReader()
    reader.onloadend = (e) => {
      if (e.target.readyState === FileReader.DONE) {
        this.parse(new Uint8Array(e.target.result))
      }
    }
    const blob = file.slice(start, stop + 1)
    reader.readAsArrayBuffer(blob)
  }

  this.import = () => {
    client.source.open('chr', this.open)
  }

  this.export = () => {
    const byteBuffer = []
    for (let i = 0; i < 512; i++) {
      byteBuffer.push(tuples2bin(tile2Tuples(this.getTile(i))))
    }
    const byteArray = new Uint8Array(512 * 16)
    for (let i = 0; i < 512; i++) {
      for (let b = 0; b < 16; b++) {
        const id = b + (i * 16)
        byteArray[id] = byteBuffer[i][b]
      }
    }
    download('sprite.chr', byteArray, 'octect/stream')
  }

  this.parse = (byteArray) => {
    // every sprite is 16 bytes, 1 byte is 8 pixels, byte n and byte n+8 control the color of that pixel (0,0) background (1,0) color 1 (0,1) color 2 (1,1) color 3
    let id = 0
    for (let b = 0; b < byteArray.length; b += 16) {
      for (let i = 0; i < 8; i++) {
        for (let j = 7; j >= 0; j--) {
          const mask = 0x1
          const channel1 = byteArray[b + i]
          const channel2 = byteArray[b + i + 8]
          const color = ((channel1 >>> j) & mask) + (((channel2 >>> j) & mask) << 1)
          SPRITESHEET[id] = color
          id++
        }
      }
    }
    client.update()
  }

  this.selectPage = (id) => {
    this._page1Button.className = id === 0 ? 'active' : ''
    this._page2Button.className = id === 1 ? 'active' : ''
    this.page = id
    this.select({ x: 0, y: 0 })
  }

  this.getTile = (id) => {
    return SPRITESHEET.slice(id * 64, (id * 64) + 64)
  }

  function tile2Tuples (tile) {
    const buff = new Array(64)
    for (let i = 0; i < 64; i++) {
      buff[i] = color2Tuple(tile[i])
    }
    return buff
  }

  function color2Tuple (color) {
    return color === 0 ? [0x0, 0x0] : color === 1 ? [0x1, 0x0] : color === 2 ? [0x0, 0x1] : [0x1, 0x1]
  }

  function tuples2bin (tuples) {
    const byteArray = new Uint8Array(16)
    for (let y = 0; y < 8; y++) {
      let byteChannel1 = 0x00
      let byteChannel2 = 0x00
      for (let x = 0; x < 8; x++) {
        const id = x + (y * 8)
        const tup = tuples[id]
        byteChannel1 = (byteChannel1 << 1 | tup[0])
        byteChannel2 = (byteChannel2 << 1 | tup[1])
      }
      byteArray[y] = byteChannel1
      byteArray[y + 8] = byteChannel2
    }
    return byteArray
  }

  function download (filename, byteArray, type) {
    const blob = new Blob([byteArray], { type: type })
    const url = type === 'octect/stream' ? window.URL.createObjectURL(blob) : byteArray
    const pom = document.createElement('a')
    pom.setAttribute('href', url)
    pom.setAttribute('download', filename)
    if (document.createEvent) {
      const event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      pom.dispatchEvent(event)
    } else {
      pom.click()
    }
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
