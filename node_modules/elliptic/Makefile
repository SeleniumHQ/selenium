BROWSERIFY ?= ./node_modules/.bin/browserify
UGLIFY ?= ./node_modules/.bin/uglifyjs
JSCS ?= ./node_modules/.bin/jscs
JSHINT ?= ./node_modules/.bin/jshint

SOURCES = lib/*.js lib/**/*.js lib/**/**/*.js

all: dist/elliptic.js dist/elliptic.min.js \
	   dist/elliptic-small.js dist/elliptic-small.min.js

dist/elliptic.js: lib/elliptic.js
	$(BROWSERIFY) --standalone ellipticjs $< -o $@

dist/elliptic-small.js: lib/elliptic.js
	$(BROWSERIFY) --standalone ellipticjs --exclude lib/elliptic/precomputed/* $< -o $@

%.min.js: %.js
	$(UGLIFY) --compress --mangle < $< > $@

lint: $(SOURCES)
	$(JSCS) $(SOURCES) && $(JSHINT) $(SOURCES)

.PHONY: all lint
