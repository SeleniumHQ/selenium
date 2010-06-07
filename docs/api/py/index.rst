============
Introduction
============
:Author: Miki Tebeka <miki@saucelabs.com>

Selenium Python Client Driver is a Python language binding for Selenium Remote
Control (version 1.0 and 2.0).

Currently only the remote protocol for Selenium 2.0 is supported, as are the
Selenium 1.0 bindings. As work will progresses we'll add more "native" drivers.

See here_ for more information.

.. _here: http://code.google.com/p/selenium/

Installing
==========

Python Client
-------------
::

    pip install -U selenium

Java Server
-----------

Download the server from http://selenium.googlecode.com/files/selenium-server-standalone-2.0a4.jar
::

    java -jar selenium-server-standalone-2.0a4.jar

Example
=======
::

    from selenium.remote import connect
    from selenium import FIREFOX
    from selenium.common.exceptions import NoSuchElementException
    from time import sleep

    browser = connect(FIREFOX) # Get local session of firefox
    browser.get("http://www.yahoo.com") # Load page
    assert browser.get_title() == "Yahoo!"
    elem = browser.find_element_by_name("p") # Find the query box
    elem.send_keys("selenium\n")
    sleep(0.2) # Let the page load, will be added to the API
    try:
        browser.find_element_by_xpath("//a[contains(@href,'http://seleniumhq.org')]")
    except NoSuchElementException:
        assert 0, "can't find seleniumhq"
    browser.close()

Documentation
=============
Coming soon, in the meantime - `"Use the source Luke"`_

.. _"Use the source Luke": http://code.google.com/p/selenium/source/browse/trunk/remote/client/src/py/webdriver.py
