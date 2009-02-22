#!/usr/bin/python
import logging
import os
import socket
import subprocess
import time
from webdriver_common_tests import api_examples
from webdriver_remote.webdriver import WebDriver

DEFAULT_PORT = 6001

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        socket.connect(("localhost", DEFAULT_PORT))
        logging.info("The remote driver server is already running or something else"
                     "is using port %d, continuing..." % DEFAULT_PORT)
    except:
        logging.info("Starting the remote driver server")
        proc = subprocess.Popen(
            "java -Dwebdriver.firefox.development=true -jar RemoteDriverServer.jar %d" % DEFAULT_PORT,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            shell=True)
    time.sleep(5)
    api_examples.run_tests(WebDriver("localhost:6001", "firefox", "ANY"))
