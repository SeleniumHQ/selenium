
# Todo: Actual tests

def test_can_retrieve_webdriver_status(driver, pages):
    assert all(key in driver.status for key in ("ready", "message"))
