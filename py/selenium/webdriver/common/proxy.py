class ProxyTypeFactory:
    @staticmethod
    def make(ff_value, string):
        return {'ff_value': ff_value, 'string': string}

class ProxyType:

    DIRECT = ProxyTypeFactory.make(0, 'DIRECT')           # Direct connection, no proxy (default on Windows).
    MANUAL = ProxyTypeFactory.make(1, 'MANUAL')           # Manual proxy settings (e.g., for httpProxy).
    PAC = ProxyTypeFactory.make(2, 'PAC')                 # Proxy autoconfiguration from URL.
    RESERVED_1 = ProxyTypeFactory.make(3, 'RESERVED1')    # Never used.
    AUTODETECT = ProxyTypeFactory.make(4, 'AUTODETECT')   # Proxy autodetection (presumably with WPAD).
    SYSTEM = ProxyTypeFactory.make(5, 'SYSTEM')           # Use system settings (default on Linux).
    UNSPECIFIED = ProxyTypeFactory.make(6, 'UNSPECIFIED')


class Proxy(object):

    proxyType = ProxyType.UNSPECIFIED
    autodetect = False
    ftpProxy = ''
    httpProxy = ''
    noProxy = ''
    proxyAutoconfigUrl = ''
    sslProxy = ''

    def __init__(self, raw=None):
        if raw is not None:
            if 'proxyType' in raw and raw['proxyType'] is not None:
                self.proxy_type = raw['proxyType']
            if 'ftpProxy' in raw and raw['ftpProxy'] is not None:
                self.ftp_proxy = raw['ftpProxy']
            if 'httpProxy' in raw and raw['httpProxy'] is not None:
                self.http_proxy = raw['httpProxy']
            if 'noProxy' in raw and raw['noProxy'] is not None:
                self.no_proxy = raw['noProxy']
            if 'proxyAutoconfigUrl' in raw and raw['proxyAutoconfigUrl'] is not None:
                self.proxy_autoconfig_url = raw['proxyAutoconfigUrl']
            if 'sslProxy' in raw and raw['sslProxy'] is not None:
                self.sslProxy = raw['sslProxy']
            if 'autodetect' in raw and raw['autodetect'] is not None:
                self.auto_detect = raw['autodetect']

    @property
    def proxy_type(self):
        return self.proxyType

    @proxy_type.setter
    def proxy_type(self, value):
        self._verify_proxy_type_compatilibily(ProxyType.AUTODETECT)
        self.proxyType = value

    @property
    def auto_detect(self):
        return self.autodetect

    @auto_detect.setter
    def auto_detect(self, value):
        if isinstance(value, bool):
            if self.autodetect is not value:
                self._verify_proxy_type_compatilibily(ProxyType.AUTODETECT)
                self.proxyType = ProxyType.AUTODETECT
                self.autodetect = value
        else:
            raise ValueError("value needs to be a boolean")

    @property
    def ftp_proxy(self):
        return self.ftpProxy

    @ftp_proxy.setter
    def ftp_proxy(self, value):
        self._verify_proxy_type_compatilibily(ProxyType.MANUAL)
        self.proxyType = ProxyType.MANUAL
        self.ftpProxy = value

    @property
    def http_proxy(self):
        return self.httpProxy

    @http_proxy.setter
    def http_proxy(self, value):
        self._verify_proxy_type_compatilibily(ProxyType.MANUAL)
        self.proxyType = ProxyType.MANUAL
        self.httpProxy = value

    @property
    def no_proxy(self):
        return self.noProxy

    @no_proxy.setter
    def no_proxy(self, value):
        self._verify_proxy_type_compatilibily(ProxyType.MANUAL)
        self.proxyType = ProxyType.MANUAL
        self.noProxy = value

    @property
    def proxy_autoconfig_url(self):
        return self.proxyAutoconfigUrl

    @proxy_autoconfig_url.setter
    def proxy_autoconfig_url(self, value):
        self._verify_proxy_type_compatilibily(ProxyType.PAC)
        self.proxyType = ProxyType.PAC
        self.proxyAutoconfigUrl = value

    @property
    def ssl_proxy(self):
        return self.sslProxy

    @ssl_proxy.setter
    def ssl_proxy(self, value):
        self._verify_proxy_type_compatilibily(ProxyType.MANUAL)
        self.proxyType = ProxyType.MANUAL
        self.sslProxy = value

    def _verify_proxy_type_compatilibily(self, compatibleProxy):
        if self.proxyType != ProxyType.UNSPECIFIED and self.proxyType != compatibleProxy:
            raise Exception(" Specified proxy type (%s) not compatible with current setting (%s)" % \
                                                (compatibleProxy, self.proxyType))


    def add_to_capabilities(self, capabilities):
        proxy_caps = {}
        proxy_caps['proxyType'] = self.proxyType['string']
        if self.autodetect:
            proxy_caps['autodetect'] = self.autodetect
        if self.ftpProxy:
            proxy_caps['ftpProxy'] = self.ftpProxy
        if self.httpProxy:
            proxy_caps['httpProxy'] = self.httpProxy
        if self.proxyAutoconfigUrl:
            proxy_caps['proxyAutoconfigUrl'] = self.proxyAutoconfigUrl
        if self.sslProxy:
            proxy_caps['sslProxy'] = self.sslProxy
        capabilities['proxy'] = proxy_caps
