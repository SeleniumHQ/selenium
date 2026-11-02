================================
selenium-manager-linux-aarch64
================================

The Selenium Manager binary for Linux aarch64. It is statically linked against
musl, so the same file runs on glibc and musl hosts alike.

This package exists to be resolved as a dependency; it carries the binary and
nothing else. Install `selenium-manager
<https://pypi.org/project/selenium-manager>`_ instead, which pulls in the right
platform package for the machine doing the install and provides the
``selenium-manager`` command.
