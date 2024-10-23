import pytest

from selenium import webdriver
from selenium.webdriver.common.bidi.network import Network


def url_for(page):
    return webserver.where_is(page)

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

@pytest.fixture
def network(driver):
    return Network(driver)

def test_add_intercept(driver, network):
    network.add_intercept(phases=[Network.PHASES['before_request']])

def test_remove_intercept(driver, network):
    intercept = network.add_intercept(phases=[Network.PHASES['before_request']])
    network.remove_intercept(intercept)

def test_continue_response(driver, network):
    network.add_intercept(phases=[Network.PHASES['before_request']])
    network.on('before_request', lambda event: network.continue_response(event['requestId'], 200))
    
    driver.get(url_for("basicAuth"))
    assert driver.find_element_by_tag_name('h1').text == 'authorized'

def test_continue_request(driver, network):
    network.add_intercept(phases=[Network.PHASES['before_request']])
    network.on('before_request', lambda event: network.continue_request(event['requestId'], url=url_for("basicAuth")))
    
    driver.get(url_for("basicAuth"))
    assert driver.find_element_by_tag_name('h1').text == 'authorized'

def test_continue_with_auth(driver, network):
    username = 'your_username'
    password = 'your_password'
    
    network.add_intercept(phases=[Network.PHASES['auth_required']])
    network.on('auth_required', lambda event: network.continue_with_auth(event['requestId'], username, password))
    
    driver.get(url_for("basicAuth"))
    assert driver.find_element_by_tag_name('h1').text == 'authorized'
