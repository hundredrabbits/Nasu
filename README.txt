NASU

---------------

Nasu is a spritesheet and nametable editor created to help us design and assemble the assets of our famicon games. It can import and export both .chr spritesheets and .asm nametables. To change the palette color, use the theme ecosystem files.

The application was initially created for internal use, but was later made available as a free and open source software. 

## FAQs

A few design decisions rely on the target platform and its limitations, here are a few explanations.

> Why can't I draw on the lower 2 rows?

They are restricted, the NES can only display up to 32x30 sprites, the data located at that location in memory is used to store the background attributes. 

Extras

- Themes: https://github.com/hundredrabbits/Themes
- Support: https://patreon.com/100
- Pull Requests are welcome!