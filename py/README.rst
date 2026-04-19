======================
Selenium Client Driver
======================

Python language bindings for `Selenium WebDriver <https://www.selenium.dev>`_.
Selenium automates browsers for testing and web-based task automation.

Supported Python Versions
=========================

* Python 3.10+

Installing
==========

Install or upgrade the Python bindings with `pip <https://pip.pypa.io/>`_.

Latest official release::

    pip install -U selenium

Quick Start
===========

.. code-block:: python

    from selenium import webdriver

    driver = webdriver.Chrome()
    driver.get("https://www.selenium.dev")
    print(driver.title)
    driver.quit()

Selenium Manager automatically handles browser driver installation — no manual driver setup required.

Documentation
=============

- `Getting Started <https://www.selenium.dev/documentation/webdriver/getting_started/>`_
- `Python API Docs <https://www.selenium.dev/selenium/docs/api/py/api.html>`_
- `Selenium Manager <https://www.selenium.dev/documentation/selenium_manager/>`_
- `Selenium Grid <https://www.selenium.dev/documentation/grid/>`_

Support
=======

- `Selenium Chat <https://www.selenium.dev/support/#ChatRoom>`_
- `GitHub Issues <https://github.com/SeleniumHQ/selenium/issues>`_

Contributing
============

Contributions are welcome via `GitHub <https://github.com/SeleniumHQ/selenium/>`_ pull requests.
See the `source code <https://github.com/SeleniumHQ/selenium/tree/trunk/py>`_ for this binding.

Links
=====

- `PyPI <https://pypi.org/project/selenium>`_
- `Documentation <https://www.selenium.dev/documentation/?tab=python>`_

License
=======

Licensed under the `Apache License 2.0 <https://www.apache.org/licenses/LICENSE-2.0>`_.
