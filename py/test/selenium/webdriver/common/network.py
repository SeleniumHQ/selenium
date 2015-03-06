# this originally comes from this stack overflow post:
# http://stackoverflow.com/a/1947766/725944
# then pulled from https://github.com/w3c/web-platform-tests/blob/master/webdriver/network.py
# http://www.w3.org/Consortium/Legal/2008/04-testsuite-copyright.html

# module for getting the lan ip address of the computer
import os
import socket

if os.name != "nt":
    import fcntl
    import struct
    def get_interface_ip(ifname):
        sckt = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        return socket.inet_ntoa(fcntl.ioctl(
                sckt.fileno(),
                0x8915,  # SIOCGIFADDR
                struct.pack('256s', ifname[:15])
            )[20:24])

def get_lan_ip():
    try:
        ip = socket.gethostbyname(socket.gethostname())
    except:
        return '0.0.0.0'
    if ip.startswith("127.") and os.name != "nt":
        interfaces = ["eth0","eth1","eth2","en0","en1","en2","en3","en4","wlan0","wlan1","wifi0","ath0","ath1","ppp0"]
        for ifname in interfaces:
            try:
                ip = get_interface_ip(ifname)
                break
            except IOError:
                pass
    return ip
