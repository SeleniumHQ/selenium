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
import typing
from abc import ABCMeta
from abc import abstractmethod

from selenium.common.exceptions import InvalidArgumentException
from selenium.webdriver.common.proxy import Proxy


class _BaseOptions:
    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls):
        if self.name in ("acceptInsecureCerts", "strictFileInteractability", "setWindowRect"):
            return obj._caps.get(self.name, False)
        return obj._caps.get(self.name)

    def __set__(self, obj, value):
        obj.set_capability(self.name, value)


class _PageLoadStrategy:
    """Determines the point at which a navigation command is returned:
    https://w3c.github.io/webdriver/#dfn-table-of-page-load-strategies.

    :param strategy: the strategy corresponding to a document readiness state
    """

    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls):
        return obj._caps[self.name]

    def __set__(self, obj, value):
        if value in ("normal", "eager", "none"):
            obj.set_capability("pageLoadStrategy", value)
        else:
            raise ValueError("Strategy can only be one of the following: normal, eager, none")


class _UnHandledPromptBehavior:
    """How the driver should respond when an alert is present and the:
    command sent is not handling the alert:
    https://w3c.github.io/webdriver/#dfn-table-of-page-load-strategies:

    :param behavior: behavior to use when an alert is encountered

    :returns: Values for implicit timeout, pageLoad timeout and script timeout if set (in milliseconds)
    """

    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls):
        return obj._caps["unhandledPromptBehavior"]

    def __set__(self, obj, value):
        if value in ("dismiss", "accept", "dismiss and notify", "accept and notify", "ignore"):
            obj.set_capability("unhandledPromptBehavior", value)
        else:
            raise ValueError(
                "Behavior can only be one of the following: dismiss, accept, dismiss and notify, "
                "accept and notify, ignore"
            )


class _Timeouts:
    """How long the driver should wait for actions to complete before:
    returning an error https://w3c.github.io/webdriver/#timeouts:

    :param timeouts: values in milliseconds for implicit wait, page load and script timeout

    :returns: Values for implicit timeout, pageLoad timeout and script timeout if set (in milliseconds)
    """

    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls):
        return self._caps["timeouts"]

    def __set__(self, obj, value):
        if all(x in ("implicit", "pageLoad", "script") for x in value.keys()):
            obj.set_capability("timeouts", value)
        else:
            raise ValueError("Timeout keys can only be one of the following: implicit, pageLoad, script")


class _Proxy:
    """
    :Returns: Proxy if set, otherwise None.
    """

    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls):
        return obj._proxy

    def __set__(self, obj, value):
        if not isinstance(value, Proxy):
            raise InvalidArgumentException("Only Proxy objects can be passed in.")
        obj._proxy = value
        obj._caps["proxy"] = value.to_capabilities()


class BaseOptions(metaclass=ABCMeta):
    """Base class for individual browser options."""

    # Creating _BaseOptions descriptors
    browser_version = _BaseOptions("browserVersion")
    """Gets and Sets `borwser_version`

    Usage
    -----
    `self.boweser_version`
    `self.browser_version` = `value`

    Notes
    -----
    Requires the major version of the browser to match provided value
    https://w3c.github.io/webdriver/#dfn-browser-version.

    `value` is required version of the browser and should be `str`
    """
    platform_name = _BaseOptions("platformName")
    """Gets and Sets `platform_name`

    Usage
    -----
    `self.platform_name`
    `self.platform_name` = `value`

    Notes
    -----
    Requires the platform to match the provided value
    https://w3c.github.io/webdriver/#dfn-platform-name.
    `value` should be the required name of the platform and it should be a `str`
    """
    accept_insecure_certs = _BaseOptions("acceptInsecureCerts")
    """Gets and Sets `accept_insecure_certs`

    Usage
    -----
    `self.accept_insecure_certs`
    `self.accept_insecure_certs` = `value`

    Notes
    -----
    Whether untrusted and self-signed TLS certificates are implicitly
    trusted: https://w3c.github.io/webdriver/#dfn-insecure-tls-certificates.

    `value` should be `bool`, whether to accept insecure certificates
    """
    strict_file_interactability = _BaseOptions("strictFileInteractability")
    """Gets and Sets `strict_file_interactability`

    Usage
    -----
    `self.strict_file_interactability`
    `self.strict_file_interactability` = `value`

    Notes
    -----
    Whether interactability checks will be applied to file type input
    elements. The default is false.

    `value` should be `bool`, whether file interactability is strict
    """
    set_window_rect = _BaseOptions("setWindowRect")
    """Gets and Sets `set_window_rect`

    Usage
    -----
    `self.set_window_rect`
    `self.set_window_rect` = `value`

    Notes
    -----
    Whether the remote end supports all of the resizing and positioning
    commands. The default is false. https://w3c.github.io/webdriver/#dfn-strict-file-interactability.

    `value` should be `bool`, whether remote end must support setting window resizing and repositioning
    """
    # Creating _PageLoadStrategy descriptor
    page_load_strategy = _PageLoadStrategy("pageLoadStrategy")
    """Gets and Sets `page_load_strategy`

    Usage
    -----
    `self.page_load_strategy`
    `self.page_load_strategy` = `value`

    Notes
    -----
    Determines the point at which a navigation command is returned
    https://w3c.github.io/webdriver/#dfn-table-of-page-load-strategies.

    `value` should be `str`, the strategy corresponding to a document readiness state
    """
    # Creating _UnHandledPromptBehavior descriptor
    unhandled_prompt_behavior = _UnHandledPromptBehavior("unhandledPromptBehavior")
    """Gets and Sets `unhandled_prompt_behavior`

    Usage
    -----
    `self.unhandled_prompt_behavior`
    `self.unhandled_prompt_behavior` = `value`

    Notes
    -----
    How the driver should respond when an alert is present and the
    command sent is not handling the alert
    https://w3c.github.io/webdriver/#dfn-table-of-page-load-strategies.

    unhandled prompt behavior if set, the default is "dismiss and notify"
    `value` should be `str`, behavior to use when an alert is encountered
    """
    # Creating _Timeouts descriptor
    timeouts = _Timeouts("timeouts")
    """Gets and Sets `timeouts`

    Usage
    -----
    `self.timeouts`
    `self.timeouts` = `value`

    Notes
    -----
    returns: Values for implicit timeout, pageLoad timeout and script timeout if set (in milliseconds)
    sets: How long the driver should wait for actions to complete before
    returning an error https://w3c.github.io/webdriver/#timeouts.

    `value` should `dict`, values in milliseconds for implicit wait, page load and script timeout
    """
    # Creating _Proxy descriptor
    proxy = _Proxy("proxy")
    """Gets and Sets `proxy`

    Usage
    -----
    `self.proxy`
    `self.proxy` = `value`

    Returns: Proxy if set, otherwise None.
    Sets: `Proxy`
    `value` should be `Proxy`
    """

    def __init__(self) -> None:
        super().__init__()
        self._caps = self.default_capabilities
        self._proxy = None
        self.set_capability("pageLoadStrategy", "normal")
        self.mobile_options = None

    @property
    def capabilities(self):
        return self._caps

    def set_capability(self, name, value) -> None:
        """Sets a capability."""
        self._caps[name] = value

    def enable_mobile(
        self,
        android_package: typing.Optional[str] = None,
        android_activity: typing.Optional[str] = None,
        device_serial: typing.Optional[str] = None,
    ) -> None:
        """Enables mobile browser use for browsers that support it.

        :Args:
            android_activity: The name of the android package to start
        """
        if not android_package:
            raise AttributeError("android_package must be passed in")
        self.mobile_options = {"androidPackage": android_package}
        if android_activity:
            self.mobile_options["androidActivity"] = android_activity
        if device_serial:
            self.mobile_options["androidDeviceSerial"] = device_serial

    @abstractmethod
    def to_capabilities(self):
        """Convert options into capabilities dictionary."""

    @property
    @abstractmethod
    def default_capabilities(self):
        """Return minimal capabilities necessary as a dictionary."""


class ArgOptions(BaseOptions):
    def __init__(self) -> None:
        super().__init__()
        self._arguments = []
        self._ignore_local_proxy = False

    @property
    def arguments(self):
        """
        :Returns: A list of arguments needed for the browser
        """
        return self._arguments

    def add_argument(self, argument):
        """Adds an argument to the list.

        :Args:
         - Sets the arguments
        """
        if argument:
            self._arguments.append(argument)
        else:
            raise ValueError("argument can not be null")

    def ignore_local_proxy_environment_variables(self) -> None:
        """By calling this you will ignore HTTP_PROXY and HTTPS_PROXY from
        being picked up and used."""
        self._ignore_local_proxy = True

    def to_capabilities(self):
        return self._caps

    @property
    def default_capabilities(self):
        return {}
