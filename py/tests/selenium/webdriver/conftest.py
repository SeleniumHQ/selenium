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

import platform
import socket
import time
import urllib
import subprocess

import pytest

from selenium import webdriver
from selenium.webdriver import DesiredCapabilities
from tests.webserver import SimpleWebServer
from tests.network import get_lan_ip


@pytest.yield_fixture(scope='function', params=[
    # 'BlackBerry',
    # 'Chrome',
    # 'Edge',
    'Firefox',
    # 'Ie',
    # 'Marionette',
    'PhantomJS',
    # 'Remote',
    # 'Safari'
])
def driver(request):
    kwargs = {}
    driver_class = request.param

    skip = request.node.get_marker('ignore_{0}'.format(driver_class.lower()))
    if skip is not None:
        reason = skip.kwargs.get('reason') or skip.name
        pytest.skip(reason)

    if driver_class == 'Edge' and platform.system() != 'Windows':
        pytest.skip('Microsoft Edge requires Microsoft Windows')
    if driver_class == 'Ie' and platform.system() != 'Windows':
        pytest.skip('Microsoft Internet Explorer requires Microsoft Windows')
    if driver_class == 'BlackBerry':
        kwargs.update({'device_password': 'password'})
    if driver_class == 'Marionette':
        driver_class = 'Firefox'
        kwargs.update({'capabilities': {'marionette': True}})
    if driver_class == 'Remote':
        # TODO start remote server
        # request.getfuncargvalue('server')
        kwargs.update({'desired_capabilities': DesiredCapabilities.FIREFOX})
    driver = getattr(webdriver, driver_class)(**kwargs)
    yield driver
    driver.quit()


@pytest.yield_fixture(autouse=True, scope='class')
def webserver():
    webserver = SimpleWebServer(host=get_lan_ip())
    webserver.start()
    yield webserver
    webserver.stop()


@pytest.fixture
def pages(driver, webserver):
    class Pages(object):
        def load(self, name):
            url = webserver.where_is('{0}.html'.format(name))
            driver.get(url)
    return Pages()


@pytest.fixture(scope='session')
def server():
    SERVER_ADDR = 'localhost'
    DEFAULT_PORT = 4444
    SERVER_PATH = '../build/java/server/src/org/openqa/grid/selenium/selenium-standalone.jar'

    _socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    url = 'http://{0}:{1}/wd/hub'.format(SERVER_ADDR, DEFAULT_PORT)
    try:
        _socket.connect((SERVER_ADDR, DEFAULT_PORT))
        print('The remote driver server is already running or something else'
              'is using port {0}, continuing...'.format(DEFAULT_PORT))
    except:
        print('Starting the remote driver server')
        subprocess.Popen(
            'java -jar {0}'.format(SERVER_PATH),
            shell=True)
        assert wait_for_server(url, 10), "can't connect"
        print('Server should be online')


def wait_for_server(url, timeout):
    start = time.time()
    while time.time() - start < timeout:
        try:
            urllib.urlopen(url)
            return 1
        except IOError:
            time.sleep(0.2)
    return 0
