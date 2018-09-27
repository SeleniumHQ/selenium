REPORTER ?= dot
TESTS ?= $(shell find test -name "*-test.js")

all: \
	later.js \
	later.min.js \
	later-core.js \
	later-core.min.js \
	component.json \
	bower.json \
	package.json

.PHONY: clean all test test-cov

test: later.js
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) $(TESTS)

test-cov: later-cov.js
	@LATER_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

later-cov.js: later.js
	@rm -f $@
	@jscoverage --no-highlight src src-cov \
		--no-instrument=later.js \
		--no-instrument=later-core.js \
		--no-instrument=modifier/index.js \
		--no-instrument=array/index.js \
		--no-instrument=date/index.js \
		--no-instrument=constraint/index.js \
		--no-instrument=parse/index.js \
		--no-instrument=core/index.js \
		--no-instrument=compat/index.js \
		--no-instrument=start.js \
		--no-instrument=end.js \
		--no-instrument=component.js \
		--no-instrument=package.js
	node_modules/.bin/smash src-cov/later.js > later-cov.js
	@chmod a-w $@

benchmark: all
	@echo 'Constraints --------'
	@node benchmark/constraint/next-bench.js
	@echo 'Schedules --------'
	@node benchmark/core/schedule-bench.js

later.js: $(shell node_modules/.bin/smash --list src/later.js)
	@rm -f $@
	node_modules/.bin/smash src/later.js | node_modules/.bin/uglifyjs - -b indent-level=2 -o $@
	@chmod a-w $@

later.min.js: later.js
	@rm -f $@
	node_modules/.bin/uglifyjs $< -c -m -o $@

later-core.js: $(shell node_modules/.bin/smash --list src/later-core.js)
	@rm -f $@
	node_modules/.bin/smash src/later-core.js | node_modules/.bin/uglifyjs - -b indent-level=2 -o $@
	@chmod a-w $@

later-core.min.js: later-core.js
	@rm -f $@
	node_modules/.bin/uglifyjs $< -c -m -o $@

component.json: src/component.js later.js
	@rm -f $@
	node src/component.js > $@
	@chmod a-w $@

package.json: src/package.js later.js
	@rm -f $@
	node src/package.js > $@
	@chmod a-w $@

bower.json: src/bower.js later.js
	@rm -f $@
	node src/bower.js > $@
	@chmod a-w $@

clean:
	rm -f later*.js package.json component.json bower.json