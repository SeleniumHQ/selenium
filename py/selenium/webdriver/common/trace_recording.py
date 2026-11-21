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

"""Records a session into a trace archive (Playwright trace format).

This is a beta feature and may change.
"""

from __future__ import annotations

import json
import logging
import os
import subprocess
import threading
from pathlib import Path

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.selenium_manager import SeleniumManager

logger = logging.getLogger(__name__)


class TraceRecording:
    """A Selenium Manager process recording a session into a trace archive.

    Selenium Manager runs in pipe mode: it starts the driver behind a local HTTP
    proxy that records every command, a screenshot after each action, and (through
    WebDriver BiDi when the driver supports it) console messages and network
    activity. The trace is written when the session is deleted.

    Local drivers create this when ``options.record`` is set; it is not meant to
    be created directly. This is a beta feature and may change.
    """

    STARTUP_TIMEOUT = 60
    SHUTDOWN_TIMEOUT = 30

    def __init__(self, process: subprocess.Popen, trace_path: Path) -> None:
        self._process = process
        self._trace_path = trace_path
        self._output: list[str] = []
        self._lock = threading.Lock()
        self._proxy_url: str | None = None
        self._ready = threading.Event()
        self._reader = threading.Thread(target=self._read_output, name="selenium-manager-pipe", daemon=True)
        self._reader.start()

    @classmethod
    def start(
        cls,
        browser_name: str,
        driver_path: str | os.PathLike[str],
        trace_path: str | os.PathLike[str],
        timeout: float | None = None,
    ) -> TraceRecording:
        """Starts the driver through Selenium Manager, recording into ``trace_path``.

        Args:
            browser_name: Name of the browser of the session, e.g. ``chrome``.
            driver_path: Driver executable that Selenium Manager starts. Other
                service settings (port, arguments, logging) are not used.
            trace_path: Trace archive written when the session is deleted. An
                existing file is overwritten.
            timeout: Seconds to wait for the recording proxy to start. Defaults to
                ``STARTUP_TIMEOUT``.

        Returns:
            The running recording, whose ``proxy_url`` takes the WebDriver commands.

        Raises:
            WebDriverException: If Selenium Manager exits or does not start the
                proxy in time.
        """
        trace_path = Path(trace_path).absolute()
        args = [
            "--browser",
            browser_name,
            "--driver-path",
            str(driver_path),
            "--record",
            str(trace_path),
        ]
        recording = cls(SeleniumManager().start_pipe(args), trace_path)
        try:
            recording._await_proxy_url(cls.STARTUP_TIMEOUT if timeout is None else timeout)
        except BaseException:
            recording._terminate()
            raise
        logger.debug("Recording session to %s through %s", trace_path, recording.proxy_url)
        return recording

    @property
    def proxy_url(self) -> str:
        """URL of the recording proxy in front of the driver."""
        if self._proxy_url is None:
            raise WebDriverException("The recording proxy has not started")
        return self._proxy_url

    @property
    def trace_path(self) -> Path:
        """Path of the trace archive written when the session is deleted."""
        return self._trace_path

    @property
    def output(self) -> str:
        """Output of Selenium Manager so far."""
        with self._lock:
            return "".join(self._output)

    def stop(self, session_deleted: bool = True) -> None:
        """Waits until Selenium Manager has written the trace and exited.

        Selenium Manager exits by itself once the session is deleted. Otherwise
        (for example, the session could not be created) it is asked to terminate,
        which also saves what was recorded.

        Args:
            session_deleted: Whether the session was deleted through the proxy.
        """
        try:
            if session_deleted:
                try:
                    self._process.wait(self.SHUTDOWN_TIMEOUT)
                except subprocess.TimeoutExpired:
                    logger.warning("Selenium Manager did not exit after the session was quit, shutting it down")
            self._terminate()
        finally:
            self._reader.join(timeout=1)
            if self._process.stdout is not None:
                self._process.stdout.close()
            logger.debug("Selenium Manager pipe mode output:\n%s", self.output)

    def _terminate(self) -> None:
        if self._process.poll() is not None:
            return
        self._process.terminate()
        try:
            self._process.wait(self.SHUTDOWN_TIMEOUT)
        except subprocess.TimeoutExpired:
            self._process.kill()
            self._process.wait()

    def _read_output(self) -> None:
        stream = self._process.stdout
        if stream is None:
            self._ready.set()
            return
        try:
            for raw in iter(stream.readline, b""):
                line = raw.decode("utf-8", errors="replace")
                with self._lock:
                    self._output.append(line)
                if self._proxy_url is None:
                    proxy_url = self._find_proxy_url(line)
                    if proxy_url is not None:
                        self._proxy_url = proxy_url
                        self._ready.set()
        except (OSError, ValueError):
            pass
        finally:
            self._ready.set()

    def _await_proxy_url(self, timeout: float) -> None:
        if not self._ready.wait(timeout):
            raise WebDriverException(
                f"Selenium Manager did not start the recording proxy within {timeout} seconds:\n{self.output}"
            )
        if self._proxy_url is None:
            code = self._process.wait()
            raise WebDriverException(
                f"Selenium Manager exited with code {code} before starting the recording proxy:\n{self.output}"
            )

    @staticmethod
    def _find_proxy_url(output: str) -> str | None:
        """Finds the proxy URL, announced as a JSON line among the log lines."""
        for line in output.splitlines():
            line = line.strip()
            if not line.startswith("{") or '"proxy_url"' not in line:
                continue
            try:
                ready = json.loads(line)
            except ValueError:
                logger.debug("Ignoring unparsable Selenium Manager output: %s", line)
                continue
            url = ready.get("proxy_url") if isinstance(ready, dict) else None
            if isinstance(url, str):
                return url
        return None
