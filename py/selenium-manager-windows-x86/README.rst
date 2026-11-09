=============================
selenium-manager-windows-x86
=============================

The i686 build of the Selenium Manager binary. The architecture in the name is
the binary's, not the machine's: Windows runs this one on x64 via WOW64 and on
arm64 via emulation, so it covers every Windows architecture today. A native
x64 or arm64 build would ship as its own package rather than replace what is
here.

This package exists to be resolved as a dependency; it carries the binary and
nothing else. Install `selenium-manager
<https://pypi.org/project/selenium-manager>`_ instead, which pulls in the right
platform package for the machine doing the install and provides the
``selenium-manager`` command.
