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

import pytest

from selenium import webdriver
from selenium.webdriver import DesiredCapabilities

drivers = (
    'BlackBerry',
    'Chrome',
    'Edge',
    'Firefox',
    'Ie',
    'Marionette',
    'PhantomJS',
    'Remote',
    'Safari',
)


def pytest_addoption(parser):
    parser.addoption(
        '--driver',
        action='append',
        choices=drivers,
        dest='drivers',
        metavar='DRIVER',
        help='driver to run tests against ({0})'.format(', '.join(drivers)))


def pytest_ignore_collect(path, config):
    _drivers = set(drivers).difference(config.getoption('drivers') or drivers)
    return len([d for d in _drivers if d.lower() in str(path)]) > 0


@pytest.fixture(scope='function')
def driver(request):
    kwargs = {}

    try:
        driver_class = request.param
    except AttributeError:
        raise Exception('This test requires a --driver to be specified.')

    skip = request.node.get_marker('ignore_{0}'.format(driver_class.lower()))
    if skip is not None:
        reason = skip.kwargs.get('reason') or skip.name
        pytest.skip(reason)

    if driver_class == 'BlackBerry':
        kwargs.update({'device_password': 'password'})
    if driver_class == 'Firefox':
        kwargs.update({'capabilities': {'marionette': False}})
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
