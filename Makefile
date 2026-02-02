.PHONY: test

test:
	HEADLESS=true python -m pytest -q
