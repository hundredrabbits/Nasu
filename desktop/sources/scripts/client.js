'use strict'

/* globals Source, Theme, Acels, SPRITESHEET, NAMETABLE, SpriteEditor, TileEditor, NametableEditor, XMLHttpRequest */

function Client () {
  this.source = new Source()
  this.theme = new Theme()
  this.acels = new Acels()

  this.spriteEditor = new SpriteEditor()
  this.tileEditor = new TileEditor()
  this.nametableEditor = new NametableEditor()

  this.el = document.createElement('div')

  this.guides = true

  this.install = (host) => {
    host.appendChild(this.el)
    this.theme.install(host)

    this.spriteEditor.install(this.el)
    this.tileEditor.install(this.el)
    this.nametableEditor.install(this.el)

    document.body.appendChild(this.el)

    this.theme.default = { background: '#000000', f_high: '#ffffff', f_med: '#777777', f_low: '#444444', f_inv: '#000000', b_high: '#eeeeee', b_med: '#72dec2', b_low: '#444444', b_inv: '#ffb545' }

    this.acels.set('File', 'New', 'CmdOrCtrl+N', () => { this.reset() })
    this.acels.set('File', 'Import Spritesheet(.chr)', 'CmdOrCtrl+O', () => { this.tileEditor.import() })
    this.acels.set('File', 'Import Nametable(.asm)', 'CmdOrCtrl+Shift+L', () => { this.nametableEditor.import() })
    this.acels.set('File', 'Export Spritesheet(.chr)', 'CmdOrCtrl+S', () => { this.tileEditor.export() })
    this.acels.set('File', 'Export Nametable(.asm)', 'CmdOrCtrl+Shift+S', () => { this.nametableEditor.export() })

    this.acels.set('Sprite', 'Move Up', 'W', () => { this.spriteEditor.modSelect({ x: 0, y: 1 }) })
    this.acels.set('Sprite', 'Move Right', 'D', () => { this.spriteEditor.modSelect({ x: 1, y: 0 }) })
    this.acels.set('Sprite', 'Move Down', 'S', () => { this.spriteEditor.modSelect({ x: 0, y: -1 }) })
    this.acels.set('Sprite', 'Move Left', 'A', () => { this.spriteEditor.modSelect({ x: -1, y: 0 }) })
    this.acels.set('Sprite', 'Select Color1', '1', () => { this.spriteEditor.selectColor(0) })
    this.acels.set('Sprite', 'Select Color2', '2', () => { this.spriteEditor.selectColor(1) })
    this.acels.set('Sprite', 'Select Color3', '3', () => { this.spriteEditor.selectColor(2) })
    this.acels.set('Sprite', 'Select Color4', '4', () => { this.spriteEditor.selectColor(3) })
    this.acels.set('Sprite', 'Erase', 'Backspace', () => { this.spriteEditor.erase() })

    this.acels.set('Tile', 'Move Up', 'ArrowUp', () => { this.tileEditor.modSelect({ x: 0, y: 1 }) })
    this.acels.set('Tile', 'Move Right', 'ArrowRight', () => { this.tileEditor.modSelect({ x: 1, y: 0 }) })
    this.acels.set('Tile', 'Move Down', 'ArrowDown', () => { this.tileEditor.modSelect({ x: 0, y: -1 }) })
    this.acels.set('Tile', 'Move Left', 'ArrowLeft', () => { this.tileEditor.modSelect({ x: -1, y: 0 }) })
    this.acels.set('Tile', 'Erase', 'Shift+Backspace', () => { this.tileEditor.erase() })
    this.acels.set('View', 'Toggle Guides', 'Tab', () => { this.toggleGuides() })

    this.acels.install(window)
    this.acels.pipe(this.commander)
  }

  this.start = () => {
    console.info('Client', 'Starting..')
    console.info(`${this.acels}`)
    this.theme.start()

    this.spriteEditor.start()
    this.tileEditor.start()
    this.nametableEditor.start()
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

  this.update = () => {
    this.spriteEditor.update()
    this.tileEditor.update()
    this.nametableEditor.update()
  }
}
