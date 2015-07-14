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

"""
The Utils methods.
"""
import socket


def free_port():
    """
    Determines a free port using sockets.
    """
    free_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    free_socket.bind(('0.0.0.0', 0))
    free_socket.listen(5)
    port = free_socket.getsockname()[1]
    free_socket.close()
    return port

def is_connectable(port):
    """
    Tries to connect to the server at port to see if it is running.

    :Args:
     - port: The port to connect.
    """
    try:
        socket_ = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        socket_.settimeout(1)
        socket_.connect(("127.0.0.1", port))
        result = True
    except socket.error:
        result = False
    finally:
        socket_.close()
    return result

def is_url_connectable(port):
    """
    Tries to connect to the HTTP server at /status path
    and specified port to see if it responds successfully.

    :Args:
     - port: The port to connect.
    """
    try:
        from urllib import request as url_request
    except ImportError:
        import urllib2 as url_request

    try:
        res = url_request.urlopen("http://127.0.0.1:%s/status" % port)
        if res.getcode() == 200:
            return True
        else:
            return False
    except:
        return False
