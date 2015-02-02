from __future__ import absolute_import

import abc
import os
import six
import subprocess
import time

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common import utils


@six.add_metaclass(abc.ABCMeta)
class BaseService(object):
    """
    An abstract base class to implement the common code among the various services
    Particularly for ie, opera, phantomjs, safari, and chrom
    """

    port_retries = 30

    def __init__(self, executable_path, port=0):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the ChromeDriver
         - port : Port the service is running on
        """
        if port == 0:
            port = utils.free_port()
        self.port = port
        self.path = executable_path
        self.process = None

    @abc.abstractproperty
    def _start_args(self):
        """

        :return:
        :rtype: list
        """
        pass

    @abc.abstractproperty
    def _start_kwargs(self):
        """

        :return:
        :rtype: dict
        """
        pass

    def start(self):
        """
        Starts the Service.

        :Exceptions:
         - WebDriverException : Raised either when it can't start the service
           or when it can't connect to the service
        """
        try:
            self.process = subprocess.Popen(self._start_args, **self._start_kwargs)
        except:  # TODO shouldn't be this general of an exception
            raise WebDriverException("'{0}' executable needs to be "
                                     "available in the path. \nChrome Driver: Please look at"
                                     "http://docs.seleniumhq.org/download/#thirdPartyDrivers "
                                     "and read up at "
                                     "http://code.google.com/p/selenium/wiki/ChromeDriver")


    def stop(self):
        """
        Tells the driver to stop and cleans up the process
        """
        self._kill_process()

    @property
    def service_url(self):
        return "http://localhost:%d" % self.port

    def _kill_process(self):
        if self.process is None:
            return
        self.process.kill()
        self.process.wait()

    def wait_for_open_port(self, wait_open=True):
        """
        Waits for the port specified on this instance to be open.
        Unless wait_open is False, in which case it will actually wait for the port to be closed.

        :param wait_open: Specifies whether it should wait for the port to be open or closed
        :type wait_open: bool
        :raises WebDriverException: Raises this exception if it fails to achieve the
            desired status
        """
        count = 0
        while utils.is_connectable(self.port) is not wait_open:
            count += 1
            time.sleep(1)
            if count >= 30:
                raise WebDriverException("Can not connect to "
                                         "the '{0}'".format(os.path.basename(self.path)))

    def wait_for_close_or_force(self):
        """
        Waits for the port to no longer be open and then kills the process
        """
        try:
            self.wait_for_open_port(wait_open=False)
        except WebDriverException:
            pass

        # Tell the Server to properly die in case
        try:
            self._kill_process()
        except OSError:
            pass  # kill may not be available under windows environment