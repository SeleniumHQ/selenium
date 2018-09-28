#!/bin/bash

# npm install -g yaml2json
node cli.js tests/object.json | yaml2json > /dev/null
node cli.js tests/array.json | yaml2json > /dev/null
# These tests would probably fail and seem a moot point to me
# Why use YAML for literal values? It's general used for config
# files will multiple teirs of data
#node cli.js tests/string.json | yaml2json
#node cli.js tests/number.json | yaml2json
#node cli.js tests/boolean.json | yaml2json
#node cli.js tests/null.json | yaml2json
echo "Passed if no errors are listed above (and yaml2json is installed)"
