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
| **IRC/Slack**:    | https://www.selenium.dev/support/#ChatRoom             |
+-------------------+--------------------------------------------------------+
| **Docs**:         | https://www.selenium.dev/selenium/docs/api/py          |
+-------------------+--------------------------------------------------------+
| **API Reference**:| https://www.selenium.dev/selenium/docs/api/py/api.html |
+-------------------+--------------------------------------------------------+

----

Supported Python Versions
=========================

* Python 3.10+

Installing
==========

Install or upgrade the Python bindings with `pip <https://pip.pypa.io/>`.

Latest official release::

    pip install -U selenium

Nightly development release::

    pip install -U --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ selenium

Quick Start
===========

.. code-block:: python

    from selenium import webdriver

    driver = webdriver.Chrome()
    driver.get("https://www.selenium.dev")
    print(driver.title)
    driver.quit()

Selenium Manager automatically handles browser driver installation — no manual driver setup required.
See `Selenium Manager <https://www.selenium.dev/documentation/selenium_manager>`_ for details.

Documentation
=============

- `Getting Started <https://www.selenium.dev/documentation/webdriver/getting_started/>`_
- `Python API Docs <https://www.selenium.dev/selenium/docs/api/py/api.html>`_
- `Selenium Grid <https://www.selenium.dev/documentation/grid/>`_

Contributing
=============

Contributions are welcome via `GitHub <https://github.com/SeleniumHQ/selenium/>`_ pull requests.
See the `source code <https://github.com/SeleniumHQ/selenium/tree/trunk/py>`_ for this binding.

License
=======

Licensed under the `Apache License 2.0 <https://www.apache.org/licenses/LICENSE-2.0>`_.
