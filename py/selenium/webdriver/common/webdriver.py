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

from selenium.webdriver.common.options import BaseOptions
from selenium.webdriver.common.service import Service
from selenium.webdriver.common.trace_recording import TraceRecording
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver


class LocalWebDriver(RemoteWebDriver):
    """Base class for local WebDrivers."""

    _trace_recording: TraceRecording | None = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._is_remote = False

    def _start_driver(self, browser_name: str, service: Service, options: BaseOptions) -> str:
        """Starts the driver of ``service`` and returns the URL to send commands to.

        When ``options.record`` is set, Selenium Manager starts the driver behind a
        recording proxy instead of the service starting it.

        Args:
            browser_name: Name of the browser of the session, e.g. ``chrome``.
            service: Service whose driver executable is started.
            options: Options of the session.

        Returns:
            The URL of the driver, or of the recording proxy in front of it.
        """
        trace_path = options.record
        if trace_path is None:
            service.start()
            return service.service_url
        self._trace_recording = TraceRecording.start(browser_name, service.path, trace_path)
        return self._trace_recording.proxy_url

    def __new__(cls, *args, **kwargs):
        if cls is LocalWebDriver:
            raise TypeError(f"Only children of '{cls.__name__}' may be instantiated")
        return object.__new__(cls)

    def quit(self) -> None:
        """Closes the browser and shuts down the driver executable.

        When the session is recorded, this also waits until the trace is written.
        """
        session_deleted = getattr(self, "session_id", None) is not None
        try:
            super().quit()
        except Exception:
            # We don't care about the message because something probably has gone wrong
            session_deleted = False
        finally:
            recording, self._trace_recording = self._trace_recording, None
            try:
                if recording is not None:
                    recording.stop(session_deleted=session_deleted)
            finally:
                if hasattr(self, "service") and self.service is not None:
                    self.service.stop()

    def download_file(self, *args, **kwargs):
        """Only implemented in RemoteWebDriver."""
        raise NotImplementedError

    def get_downloadable_files(self, *args, **kwargs):
        """Only implemented in RemoteWebDriver."""
        raise NotImplementedError

    def delete_downloadable_files(self, *args, **kwargs):
        """Only implemented in RemoteWebDriver."""
        raise NotImplementedError
