# selenium-py-starter

A minimal Selenium + pytest starter using Chrome in headless mode and webdriver-manager for driver management.

## Quickstart

1. Create and activate a virtual environment (recommended):

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run tests (headless by default):

```bash
# Run all tests
scripts/run_tests.sh

# Or via pytest directly
HEADLESS=true python -m pytest -q
```

To run with a visible browser, set `HEADLESS=false`.

## CI

A GitHub Actions workflow is included at `.github/workflows/ci.yml` that installs Chrome and runs the test suite on push / pull requests.

## Notes
- The `browser` fixture in `conftest.py` uses `webdriver-manager` to install the chromedriver.
- You can change the HEADLESS behavior with the `HEADLESS` environment variable.
- Starter contributed by INSANERIUk.
