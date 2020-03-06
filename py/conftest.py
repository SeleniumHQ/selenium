# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import os
import socket
import subprocess
import sys
import time

import pytest
from _pytest.skipping import MarkEvaluator

from selenium import webdriver
from selenium.webdriver import DesiredCapabilities
from test.selenium.webdriver.common.webserver import SimpleWebServer
from test.selenium.webdriver.common.network import get_lan_ip

if sys.version_info[0] == 3:
    from urllib.request import urlopen
else:
    from urllib import urlopen

drivers = (
    'BlackBerry',
    'Chrome',
    'Edge',
    'Firefox',
    'Ie',
    'Marionette',
    'Remote',
    'Safari',
    'WebKitGTK',
    'ChromiumEdge',
)


def pytest_addoption(parser):
    parser.addoption('--driver', action='append', choices=drivers, dest='drivers',
                     metavar='DRIVER',
                     help='driver to run tests against ({})'.format(', '.join(drivers)))
    parser.addoption('--browser-binary', action='store', dest='binary',
                     help='location of the browser binary')
    parser.addoption('--driver-binary', action='store', dest='executable',
                     help='location of the service executable binary')
    parser.addoption('--browser-args', action='store', dest='args',
                     help='arguments to start the browser with')


def pytest_ignore_collect(path, config):
    drivers_opt = config.getoption('drivers')
    _drivers = set(drivers).difference(drivers_opt or drivers)
    if drivers_opt:
        _drivers.add('unit')
    parts = path.dirname.split(os.path.sep)
    return len([d for d in _drivers if d.lower() in parts]) > 0


driver_instance = None


@pytest.fixture(scope='function')
def driver(request):
    kwargs = {}

    try:
        driver_class = request.param
    except AttributeError:
        raise Exception('This test requires a --driver to be specified.')

    # conditionally mark tests as expected to fail based on driver
    request.node._evalxfail = request.node._evalxfail or MarkEvaluator(
        request.node, 'xfail_{0}'.format(driver_class.lower()))
    if request.node._evalxfail.istrue():
        def fin():
            global driver_instance
            if driver_instance is not None:
                driver_instance.quit()
            driver_instance = None
        request.addfinalizer(fin)

    # skip driver instantiation if xfail(run=False)
    if not request.config.getoption('runxfail'):
        if request.node._evalxfail.istrue():
            if request.node._evalxfail.get('run') is False:
                yield
                return

    driver_path = request.config.option.executable
    options = None

    global driver_instance
    if driver_instance is None:
        if driver_class == 'BlackBerry':
            kwargs.update({'device_password': 'password'})
        if driver_class == 'Firefox':
            kwargs.update({'capabilities': {'marionette': False}})
            options = get_options(driver_class, request.config)
        if driver_class == 'Marionette':
            driver_class = 'Firefox'
            options = get_options(driver_class, request.config)
        if driver_class == 'Remote':
            capabilities = DesiredCapabilities.FIREFOX.copy()
            kwargs.update({'desired_capabilities': capabilities})
            options = get_options('Firefox', request.config)
        if driver_class == 'WebKitGTK':
            options = get_options(driver_class, request.config)
        if driver_class == 'ChromiumEdge':
            options = get_options(driver_class, request.config)
            kwargs.update({'is_legacy': False})
        if driver_path is not None:
            kwargs['executable_path'] = driver_path
        if options is not None:
            kwargs['options'] = options
        driver_instance = getattr(webdriver, driver_class)(**kwargs)
    yield driver_instance
    if MarkEvaluator(request.node, 'no_driver_after_test').istrue():
        driver_instance = None


def get_options(driver_class, config):
    browser_path = config.option.binary
    browser_args = config.option.args
    options = None

    if browser_path or browser_args:
        if driver_class == 'ChromiumEdge':
            options = getattr(webdriver, 'EdgeOptions')(False)
        else:
            options = getattr(webdriver, '{}Options'.format(driver_class))()
        if driver_class == 'WebKitGTK':
            options.overlay_scrollbars_enabled = False
        if browser_path is not None:
            options.binary_location = browser_path
        if browser_args is not None:
            for arg in browser_args.split():
                options.add_argument(arg)
    return options


@pytest.fixture(scope='session', autouse=True)
def stop_driver(request):
    def fin():
        global driver_instance
        if driver_instance is not None:
            driver_instance.quit()
        driver_instance = None
    request.addfinalizer(fin)


def pytest_exception_interact(node, call, report):
    if report.failed:
        global driver_instance
        if driver_instance is not None:
            driver_instance.quit()
        driver_instance = None


@pytest.fixture
def pages(driver, webserver):
    class Pages(object):
        def url(self, name):
            return webserver.where_is(name)

        def load(self, name):
            driver.get(self.url(name))
    return Pages()


@pytest.fixture(autouse=True, scope='session')
def server(request):
    drivers = request.config.getoption('drivers')
    if drivers is None or 'Remote' not in drivers:
        yield None
        return

    _host = 'localhost'
    _port = 4444
    _path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                         'bazel-bin/java/server/src/org/openqa/selenium/grid/selenium_server_deploy.jar')

    def wait_for_server(url, timeout):
        start = time.time()
        while time.time() - start < timeout:
            try:
                urlopen(url)
                return 1
            except IOError:
                time.sleep(0.2)
        return 0

    _socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    url = 'http://{}:{}/status'.format(_host, _port)
    try:
        _socket.connect((_host, _port))
        print('The remote driver server is already running or something else'
              'is using port {}, continuing...'.format(_port))
    except Exception:
        print('Starting the Selenium server')
        process = subprocess.Popen(['java', '-jar', _path, 'standalone', '--port', '4444'])
        print('Selenium server running as process: {}'.format(process.pid))
        assert wait_for_server(url, 10), 'Timed out waiting for Selenium server at {}'.format(url)
        print('Selenium server is ready')
        yield process
        process.terminate()
        process.wait()
        print('Selenium server has been terminated')


@pytest.fixture(autouse=True, scope='session')
def webserver():
    webserver = SimpleWebServer(host=get_lan_ip())
    webserver.start()
    yield webserver
    webserver.stop()
