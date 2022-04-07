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

# module for getting the lan ip address of the computer
import os
import socket

if os.name != "nt":
    import fcntl
    import struct

    def get_interface_ip(ifname):
        def _bytes(value, encoding):
            try:
                return bytes(value, encoding)  # Python 3
            except TypeError:
                return value  # Python 2

        sckt = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        return socket.inet_ntoa(fcntl.ioctl(
            sckt.fileno(),
            0x8915,  # SIOCGIFADDR
            struct.pack('256s', _bytes(ifname[:15], 'utf-8'))
        )[20:24])


def get_lan_ip():
    if os.environ.get('CI') == 'true':
        return '0.0.0.0'

    try:
        ip = socket.gethostbyname(socket.gethostname())
    except Exception:
        return '0.0.0.0'
    if ip.startswith("127.") and os.name != "nt":
        interfaces = ["eth0", "eth1", "eth2", "en0", "en1", "en2", "en3",
                      "en4", "wlan0", "wlan1", "wifi0", "ath0", "ath1", "ppp0"]
        for ifname in interfaces:
            try:
                ip = get_interface_ip(ifname)
                break
            except OSError:
                pass
    return ip
