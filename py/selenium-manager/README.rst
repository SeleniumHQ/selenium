================
Selenium Manager
================

Selenium Manager discovers the browsers installed on a machine, downloads the
matching drivers, and prints the paths back as JSON. It is the component the
Selenium bindings already shell out to; this distribution publishes it on its
own so it can be used without installing a binding.

Running it
==========

No install needed::

    uvx selenium-manager --browser chrome

Or install it into an environment::

    pip install selenium-manager
    selenium-manager --browser chrome

It also runs as a module::

    python -m selenium_manager --browser chrome

Pass ``--help`` for the full command set.

Platform packages
=================

``selenium-manager`` carries no binary itself. Installing it pulls in exactly
one platform package for the machine doing the install:

============================  =====================================
Platform                      Package
============================  =====================================
Linux x86-64                  ``selenium-manager-linux-x86-64``
Linux aarch64                 ``selenium-manager-linux-aarch64``
macOS (Intel and Apple Si)    ``selenium-manager-macos``
Windows (x86, x64, arm64)     ``selenium-manager-windows``
============================  =====================================

macOS and Windows are one package each: the macOS binary is universal, and the
Windows binary is i686, which Windows runs on x64 and arm64 as well.

Using it from Python
====================

``binary_path()`` resolves the binary without launching it, for callers that
want to run it themselves::

    from selenium_manager import binary_path

    subprocess.run([binary_path(), "--browser", "chrome", "--output", "json"])

Setting ``SE_MANAGER_PATH`` overrides the resolved path, the same way it does in
every Selenium binding.

Links
=====

* Source: https://github.com/SeleniumHQ/selenium/tree/trunk/py/selenium-manager
* Documentation: https://www.selenium.dev/documentation/selenium_manager
* Issues: https://github.com/SeleniumHQ/selenium/issues
