============
Introduction
============
:Author: Miki Tebeka <miki@saucelabs.com>

Selenium Python Client Driver is a Python language binding for Selenium Remote
Control (version 1.0 and 2.0).

Currently only the remote protocols for both 1.0 and 2.0 are working. As work
progresses we'll add more "native" drivers.

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

    wd = connect(FIREFOX) # Get local session of firefox
    wd.get("http://www.yahoo.com") # Load page
    assert wd.get_title() == "Yahoo!"
    elem = wd.find_element_by_name("p") # Find the query box
    elem.send_keys("selenium\n")
    sleep(0.2) # Let the page load, will be added to the API
    try:
        wd.find_element_by_xpath("//a[contains(@href,'http://seleniumhq.org')]")
    except NoSuchElementException:
        assert 0, "can't find seleniumhq"
    wd.close()

Documentation
=============
Coming soon, in the meantime - `"Use the source Luke"`_

.. _"Use the source Luke": http://code.google.com/p/selenium/source/browse/trunk/remote/client/src/py/webdriver.py
