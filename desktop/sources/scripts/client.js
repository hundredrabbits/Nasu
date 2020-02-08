'use strict'

/* globals Source, Theme, Acels, SPRITESHEET, NAMETABLE, SpriteEditor, TileEditor, NametableEditor */

function Client () {
  this.source = new Source()
  this.theme = new Theme()
  this.acels = new Acels()

  this.spriteEditor = new SpriteEditor()
  this.tileEditor = new TileEditor()
  this.nametableEditor = new NametableEditor()

  this.el = document.createElement('div')

  this.guides = true
  this.selection = 0

  this.install = (host) => {
    host.appendChild(this.el)
    this.theme.install(host)

    this.spriteEditor.install(this.el)
    this.tileEditor.install(this.el)
    this.nametableEditor.install(this.el)

    document.body.appendChild(this.el)

    this.theme.default = { background: '#000000', f_high: '#9b72de', f_med: '#72dec2', f_low: '#fff', f_inv: '#ffffff', b_high: '#555555', b_med: '#444444', b_low: '#222222', b_inv: '#ffb545' }

    this.acels.set('File', 'New', 'CmdOrCtrl+N', () => { this.reset() })
    this.acels.set('File', 'Import Spritesheet(.chr)', 'CmdOrCtrl+O', () => { this.tileEditor.import() })
    this.acels.set('File', 'Import Nametable(.asm)', 'CmdOrCtrl+Shift+L', () => { this.nametableEditor.import() })
    this.acels.set('File', 'Export Spritesheet(.chr)', 'CmdOrCtrl+S', () => { this.tileEditor.export() })
    this.acels.set('File', 'Export Nametable(.asm)', 'CmdOrCtrl+Shift+S', () => { this.nametableEditor.export() })

    this.acels.add('Edit', 'cut')
    this.acels.add('Edit', 'copy')
    this.acels.add('Edit', 'paste')

    this.acels.set('Sprite', 'Move Up', 'W', () => { this.modSelect({ x: 0, y: 2 }) })
    this.acels.set('Sprite', 'Move Right', 'D', () => { this.modSelect({ x: 2, y: 0 }) })
    this.acels.set('Sprite', 'Move Down', 'S', () => { this.modSelect({ x: 0, y: -2 }) })
    this.acels.set('Sprite', 'Move Left', 'A', () => { this.modSelect({ x: -2, y: 0 }) })
    this.acels.set('Sprite', 'Select Color1', '1', () => { this.spriteEditor.selectColor(0) })
    this.acels.set('Sprite', 'Select Color2', '2', () => { this.spriteEditor.selectColor(1) })
    this.acels.set('Sprite', 'Select Color3', '3', () => { this.spriteEditor.selectColor(2) })
    this.acels.set('Sprite', 'Select Color4', '4', () => { this.spriteEditor.selectColor(3) })
    this.acels.set('Sprite', 'Erase', 'Backspace', () => { this.spriteEditor.erase() })

    this.acels.set('Tile', 'Move Up', 'ArrowUp', () => { this.modSelect({ x: 0, y: 1 }) })
    this.acels.set('Tile', 'Move Right', 'ArrowRight', () => { this.modSelect({ x: 1, y: 0 }) })
    this.acels.set('Tile', 'Move Down', 'ArrowDown', () => { this.modSelect({ x: 0, y: -1 }) })
    this.acels.set('Tile', 'Move Left', 'ArrowLeft', () => { this.modSelect({ x: -1, y: 0 }) })
    this.acels.set('Tile', 'Erase', 'Shift+Backspace', () => { this.tileEditor.erase() })
    this.acels.set('Tile', 'Toggle Page', 'Tab', () => { this.tileEditor.selectPage(this.tileEditor.page === 1 ? 0 : 1) })
    this.acels.set('View', 'Toggle Guides', 'H', () => { this.toggleGuides() })

    this.acels.install(window)
    this.acels.pipe(this.commander)
  }

  this.start = () => {
    console.info('Client', 'Starting..')
    console.info(`${this.acels}`)
    this.theme.start()
    this.theme.onLoad = () => { this.update() }

    this.spriteEditor.start()
    this.tileEditor.start()
    this.nametableEditor.start()
  }

  this.select = (id) => {
    this.selection = id
  }

  this.modSelect = (mod) => {
    const pos = this.tileEditor.idToPos(this.selection)
    const dest = { x: clamp(pos.x + mod.x, 0, 31), y: clamp(pos.y - mod.y, 0, 31) }
    this.selection = this.tileEditor.posToId(dest)
    this.spriteEditor.update()
    this.tileEditor.update()
  }

  this.reset = () => {
    for (let i = 0; i < 512 * 16 * 8; i++) {
      SPRITESHEET[i] = 0
    }

    for (let i = 0; i < 32 * 30; i++) {
      NAMETABLE[i] = 0
    }
    this.update()
  }

  this.toggleGuides = () => {
    this.guides = !this.guides
    this.update()
  }

  this.getColor = (id) => {
    if (id === 0) { return this.theme.active.background }
    if (id === 1) { return this.theme.active.f_high }
    if (id === 2) { return this.theme.active.f_med }
    if (id === 3) { return this.theme.active.f_low }
  }

  this.update = () => {
    this.spriteEditor.update()
    this.tileEditor.update()
    this.nametableEditor.update()
  }

  // Events

  window.addEventListener('dragover', (e) => {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  })

  window.addEventListener('drop', (e) => {
    e.preventDefault()
    e.stopPropagation()
    for (const file of e.dataTransfer.files) {
      console.log(file.name)
      if (file.name.indexOf('.chr') > -1) { this.tileEditor.open(file) }
      if (file.name.indexOf('.asm') > -1) { this.source.read(file, this.nametableEditor.parse) }
    }
  })

  document.oncopy = (e) => {
    const tileData = this.tileEditor.getTile(this.selection)
    const tileBin = tuples2bin(tile2Tuples(tileData))
    console.log(tileBin)
  }

  document.oncut = (e) => {

  }

  document.onpaste = (e) => {

  }
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

function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
