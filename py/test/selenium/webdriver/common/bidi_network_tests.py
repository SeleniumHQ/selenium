import pytest
from selenium import webdriver
from selenium.webdriver.common.bidi.session import BiDiSession
from selenium.webdriver.common.bidi.network import Network

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--remote-debugging-port=9222')
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

@pytest.fixture
def bidi_session(driver):
    return BiDiSession(driver)

@pytest.fixture
def network(bidi_session):
    return Network(bidi_session)

def test_add_intercept(driver, network):
    intercept = network.add_intercept(phases=[Network.PHASES['before_request']])
    assert intercept is not None

def test_remove_intercept(driver, network):
    intercept = network.add_intercept(phases=[Network.PHASES['before_request']])
    assert network.remove_intercept(intercept['intercept']) == []

def test_continue_with_auth(driver, network):
    username = 'your_username'
    password = 'your_password'
    
    network.add_intercept(phases=[Network.PHASES['auth_required']])
    network.on('auth_required', lambda event: network.continue_with_auth(event['requestId'], username, password))
    
    driver.get('http://your_basic_auth_url')
    assert driver.find_element_by_tag_name('h1').text == 'authorized'

def test_add_auth_handler(driver, network):
    username = 'your_username'
    password = 'your_password'
    network.add_auth_handler(username, password)
    assert len(Network.AUTH_CALLBACKS) == 1

def test_remove_auth_handler(driver, network):
    username = 'your_username'
    password = 'your_password'
    handler_id = network.add_auth_handler(username, password)
    network.remove_auth_handler(handler_id)
    assert len(Network.AUTH_CALLBACKS) == 0

def test_clear_auth_handlers(driver, network):
    username = 'your_username'
    password = 'your_password'
    network.add_auth_handler(username, password)
    network.add_auth_handler(username, password)
    network.clear_auth_handlers()
    assert len(Network.AUTH_CALLBACKS) == 0

