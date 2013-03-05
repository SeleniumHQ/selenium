import os
import socket
import time
import subprocess
import signal

from selenium.vendor import requests


SERVER_ADDR = "localhost"
DEFAULT_PORT = 4444

SERVER_PATH = "build/java/server/src/org/openqa/grid/selenium/selenium-standalone.jar"

def start_server(module):
    _socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    url = "http://%s:%d/wd/hub" % (SERVER_ADDR, DEFAULT_PORT)
    try:
        _socket.connect((SERVER_ADDR, DEFAULT_PORT))
        print ("The remote driver server is already running or something else"
               "is using port %d, continuing..." % DEFAULT_PORT)
    except:
        print ("Starting the remote driver server")
        module.server_proc = subprocess.Popen(
            "java -jar %s" % SERVER_PATH,
            shell=True)

        assert wait_for_server(url, 10), "can't connect"
        print "Server should be online"

def wait_for_server(url, timeout):
    start = time.time()
    while time.time() - start < timeout:
        attempt_timeout = min(timeout, max(timeout / 5.0, 1))
        try:
            requests.get(url, timeout=attempt_timeout)
            return 1
        except requests.ConnectionError:
            time.sleep(0.2)

    return 0

def stop_server(module):
# FIXME: This does not seem to work, the server process lingers
    try:
        os.kill(module.server_proc.pid, signal.SIGTERM)
        time.sleep(5)
    except:
        pass
