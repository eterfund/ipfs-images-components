#!/bin/bash

find ./components/ -type f -name "*.js" -print0 | xargs -0 ./node_modules/.bin/jsdoc2md > DOCS.md
cat DESC.md DOCS.md > README.md
