import os
import urllib3

from selenium.webdriver.chrome.webdriver import WebDriver
from selenium import webdriver


def test_bad_proxy_doesnt_interfere():

    # these values should be ignored if ignore_local_proxy_environment_variables() is called.
    os.environ['https_proxy'] = 'bad'
    os.environ['http_proxy'] = 'bad'
    options = webdriver.ChromeOptions()

    options.ignore_local_proxy_environment_variables()

    chrome_kwargs = {'options': options, 'keep_alive': False}
    driver = webdriver.Chrome(**chrome_kwargs)

    assert hasattr(driver, 'command_executor')
    assert hasattr(driver.command_executor, '_proxy_url')
    assert type(driver.command_executor) == urllib3.PoolManager
    driver.quit()
