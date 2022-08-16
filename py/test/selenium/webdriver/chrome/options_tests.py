import pytest

from selenium import webdriver


def test_w3c_true():
    options = webdriver.ChromeOptions()
    options.add_experimental_option("w3c", True)

    chrome_kwargs = {'options': options}

    with pytest.warns(DeprecationWarning, match="Setting 'w3c: True' is redundant"):
        driver = webdriver.Chrome(**chrome_kwargs)

    driver.quit()


def test_w3c_false():
    options = webdriver.ChromeOptions()
    options.add_experimental_option("w3c", False)

    chrome_kwargs = {'options': options}

    with pytest.raises(AttributeError):
        webdriver.Chrome(**chrome_kwargs)
