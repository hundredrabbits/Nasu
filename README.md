# 🍆

<img src="https://raw.githubusercontent.com/hundredrabbits/100r.co/master/media/content/characters/nasu.hello.png" width="300"/>

Nasu is a spritesheet and nametable editor created to help us design and assemble the assets of our famicon games. It can import and export both .chr spritesheets and .asm nametables. To change the palette color, use the [theme ecosystem files](https://github.com/hundredrabbits/Themes).

The application was initially created for internal use, but was later made available as a free and open source software. You can use this application directly in your [browser](https://hundredrabbits.github.io/Nasu).

<img src='https://raw.githubusercontent.com/hundredrabbits/Nasu/master/PREVIEW.jpg' width="600"/>

## Electron Build

```
cd desktop
npm install
npm start
```

## FAQs

A few design decisions rely on the target platform and its limitations, here are a few explanations.

> Why can't I draw on the lower 2 rows?

They are restricted, the NES can only display up to 32x30 sprites, the data located at that location in memory is used to store the background attributes. 

## Extras

- This application supports the [Ecosystem Theme](https://github.com/hundredrabbits/Themes).
- Support this project through [Patreon](https://patreon.com/100).
- See the [License](LICENSE.md) file for license rights and limitations (MIT).
- Pull Requests are welcome!
