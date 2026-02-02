import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture(scope="session")
def browser():
    """Create a Chrome WebDriver. Controlled by the HEADLESS env var (default: true)."""
    headless = os.environ.get("HEADLESS", "true").lower() in ("1", "true", "yes")
    options = Options()
    if headless:
        # Use the new headless mode if available
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    yield driver
    driver.quit()
