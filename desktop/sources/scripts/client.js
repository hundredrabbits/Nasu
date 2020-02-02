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

    /// Load up default sprite sheet

    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'assets/mario.chr')
    xhr.responseType = 'arraybuffer'

    xhr.addEventListener('load', (e) => {
      this.tileEditor.parse(new Uint8Array(xhr.response))
    })

    xhr.send()
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
