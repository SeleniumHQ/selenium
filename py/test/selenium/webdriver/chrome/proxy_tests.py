import os
import urllib3

from selenium import webdriver


def test_bad_proxy_doesnt_interfere():

    # these values should be ignored if ignore_local_proxy_environment_variables() is called.
    os.environ['https_proxy'] = 'bad'
    os.environ['http_proxy'] = 'bad'
    options = webdriver.ChromeOptions()

    options.ignore_local_proxy_environment_variables()

    chrome_kwargs = {'options': options}
    driver = webdriver.Chrome(**chrome_kwargs)

    assert hasattr(driver, 'command_executor')
    assert hasattr(driver.command_executor, '_proxy_url')
    assert type(driver.command_executor._conn) == urllib3.PoolManager
    os.environ.pop('https_proxy')
    os.environ.pop('http_proxy')
    driver.quit()
