=========================
selenium-manager-windows
=========================

The Selenium Manager binary for Windows. The binary is i686, which Windows runs
on x64 and arm64 as well, so this one package covers every Windows
architecture.

This package exists to be resolved as a dependency; it carries the binary and
nothing else. Install `selenium-manager
<https://pypi.org/project/selenium-manager>`_ instead, which pulls in the right
platform package for the machine doing the install and provides the
``selenium-manager`` command.
