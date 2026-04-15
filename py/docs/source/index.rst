======================
Selenium Client Driver
======================

Introduction
============

Python language bindings for Selenium WebDriver.

The `selenium` package is used to automate web browser interaction from Python.

+-------------------+--------------------------------------------------------+
| **Home**:         | https://selenium.dev                                   |
+-------------------+--------------------------------------------------------+
| **GitHub**:       | https://github.com/SeleniumHQ/Selenium                 |
+-------------------+--------------------------------------------------------+
| **PyPI**:         | https://pypi.org/project/selenium                      |
+-------------------+--------------------------------------------------------+
| **IRC/Slack**:    | https://selenium.dev/support/#ChatRoom                 |
+-------------------+--------------------------------------------------------+
| **Docs**:         | https://selenium.dev/selenium/docs/api/py              |
+-------------------+--------------------------------------------------------+
| **API Reference**:| https://selenium.dev/selenium/docs/api/py/api.html     |
+-------------------+--------------------------------------------------------+

Updated documentation published with each commit is available at: `readthedocs.io <https://selenium-python-api-docs.readthedocs.io/en/latest>`_

----

Supported Python Versions
=========================

* Python 3.10+

Supported Browsers
==================

Several browsers are supported, as well as the Remote protocol:

* Chrome
* Edge
* Firefox
* Safari
* WebKitGTK
* WPEWebKit

Installing
==========

Install or upgrade the Python bindings with `pip <https://pip.pypa.io/>`.

Latest official release::

    pip install -U selenium

Nightly development release::

    pip install -U --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ selenium

Note: you should consider using a
`virtual environment <https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments>`_
to create an isolated Python environment for installation.

Drivers
=======

Selenium requires a driver to interface with the chosen browser (chromedriver, edgedriver, geckodriver, etc).

In older versions of Selenium, it was necessary to install and manage these drivers yourself. You had to make sure the
driver executable was available on your system `PATH`, or specified explicitly in code. Modern versions of Selenium
handle browser and driver installation for you with
`Selenium Manager <https://selenium.dev/documentation/selenium_manager>`_. You generally don't have to worry about
driver installation or configuration now that it's done for you when you instantiate a WebDriver. Selenium Manager works
with most supported platforms and browsers. If it doesn't meet your needs, you can still install and specify browsers
and drivers yourself.

Links to some of the more popular browser drivers:

+--------------+-----------------------------------------------------------------------+
| **Chrome**:  | https://developer.chrome.com/docs/chromedriver                        |
+--------------+-----------------------------------------------------------------------+
| **Edge**:    | https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver  |
+--------------+-----------------------------------------------------------------------+
| **Firefox**: | https://github.com/mozilla/geckodriver                                |
+--------------+-----------------------------------------------------------------------+
| **Safari**:  | https://webkit.org/blog/6900/webdriver-support-in-safari-10           |
+--------------+-----------------------------------------------------------------------+

Example 0:
==========

* launch a new Chrome browser
* load a web page
* close the browser

.. code-block:: python

    from selenium import webdriver


    driver = webdriver.Chrome()
    driver.get("https://selenium.dev")
    driver.quit()

Example 1:
==========

* launch a new Chrome browser
* load the Selenium documentation page
* find the "WebDriver" link
* click the "WebDriver" link
* close the browser

.. code-block:: python

    from selenium import webdriver
    from selenium.webdriver.common.by import By


    driver = webdriver.Chrome()

    driver.get("https://selenium.dev/documentation")
    assert "Selenium" in driver.title

    elem = driver.find_element(By.ID, "m-documentationwebdriver")
    elem.click()
    assert "WebDriver" in driver.title

    driver.quit()

Example 2:
==========

Selenium WebDriver is often used as a basis for testing web applications. Here is an example using Python's
standard `unittest <https://docs.python.org/3/library/unittest.html>`_ framework:

.. code-block:: python

    import unittest
    from selenium import webdriver


    class SeleniumTestCase(unittest.TestCase):

        def setUp(self):
            self.driver = webdriver.Chrome()
            self.addCleanup(self.driver.quit)

        def test_page_title(self):
            self.driver.get("https://selenium.dev")
            self.assertIn("Selenium", self.driver.title)

Example 3:
==========

Here is an example using `pytest <https://pytest.org>`_ framework:

.. code-block:: python

    import pytest
    from selenium import webdriver


    @pytest.fixture
    def driver():
        driver = webdriver.Chrome()
        yield driver
        driver.quit()


    def test_page_title(driver):
        driver.get("https://selenium.dev")
        assert "Selenium" in driver.title


Selenium Grid (optional)
========================

For local Selenium scripts, the Java server is not needed.

To use Selenium remotely, you need to also run a Selenium Grid. For information on running Selenium Grid:
https://selenium.dev/documentation/grid/getting_started/

To use Remote WebDriver see: https://selenium.dev/documentation/webdriver/drivers/remote_webdriver/?tab=python

Use The Source Luke!
====================

View source code online:

+---------------+-------------------------------------------------------+
| **Official**: | https://github.com/SeleniumHQ/selenium/tree/trunk/py  |
+---------------+-------------------------------------------------------+
