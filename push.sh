#!/bin/bash

node scripts/lib/build
rm -r release
mkdir release
cp index.html release/index.html
cp README.txt release/README.txt
~/Applications/butler push ~/Repositories/Hundredrabbits/Nasu/release hundredrabbits/nasu:main
~/Applications/butler status hundredrabbits/nasu
rm -r release