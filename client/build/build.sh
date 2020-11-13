#!/bin/bash

r.js -o client/build/app.build.js
cd dist
rm -rf build build.txt js/render js/modules examples

