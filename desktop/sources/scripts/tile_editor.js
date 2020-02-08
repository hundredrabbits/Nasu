'use strict'

/* globals SPRITESHEET, Editor, client, FileReader, Blob, tuples2bin, tile2Tuples */

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
    client.select(this.posToId(pos))
    this.update()
    client.spriteEditor.update()
  }

  this.whenMouseMove = (pos) => {
    client.select(this.posToId(pos))
    this.update()
    client.spriteEditor.update()
  }

  this.whenMouseUp = (pos) => {
    client.update()
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
        this.drawPixel(pos, 2, client.getColor(SPRITESHEET[id]))
      }
    }
  }

  this.drawGuides = () => {
    if (client.guides !== true || client.selection === null) { return }
    const blockId = Math.floor(client.selection / 16)
    const blockRect = { x: (blockId % 4) * 64, y: Math.floor(blockId / 4) * 64, w: 64, h: 64 }
    this.drawRect(blockRect, client.theme.active.b_inv)
    const tileRect = { x: blockRect.x + (client.selection % 4) * 16, y: blockRect.y + (Math.floor(client.selection / 4) * 16) % 64, w: 16, h: 16 }
    this.drawRect(tileRect, client.theme.active.b_inv)
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
    // every sprite is 16 bytes, 
    // 1 byte is 8 pixels, 
    // byte n and byte n+8 control the color of that pixel (0,0) background (1,0) color 1 (0,1) color 2 (1,1) color 3
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
    client.update()
  }

  this.getTile = (id) => {
    return SPRITESHEET.slice(id * 64, (id * 64) + 64)
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
}
