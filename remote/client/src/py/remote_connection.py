import httplib
import simplejson
import logging
import utils
from webdriver_common.exceptions import ErrorInResponseException

class RemoteConnection(object):
    __shared_state = {}

    def __init__(self, remote_server_addr, browser_name, platform):
        self.__dict__ = self.__shared_state
        if "_conn" not in self.__dict__:
            self._conn = httplib.HTTPConnection(remote_server_addr)
            self._context = "foo"
            self._session_id = ""
            #TODO: parameterize the capabilities
            resp = self.post("/hub/session",
                             {"browserName": browser_name,
                              "platform": platform,
                              "class":"org.openqa.selenium.remote.DesiredCapabilities",
                              "javascriptEnabled":False,
                              "version":""},
                             )
            #TODO: handle the capabilities info sent back from server
            self._session_id = resp["sessionId"]

    def post(self, path, *params):
        return self.request("POST", path, *params)

    def get(self, path, *params):
        return self.request("GET", path, *params)

    def request(self, method, path, *params):
        if params:
            payload = simplejson.dumps(params)
            logging.debug("request:" + path + utils.format_json(params))
        else:
            payload = ""

        if not path.startswith("/hub") and not path.startswith("http://"):
            path =  "/hub/session/%s/%s/" % (self._session_id, self._context) + path
        self._conn.request(method, path,
                           body = payload, headers={"Accept":"application/json"})
        return self._process_response()

    def quit(self):
        self._conn.request("DELETE", "/hub/session/%s" % (self._session_id))

    def _process_response(self):
        resp = self._conn.getresponse()
        data = resp.read()

        if resp.status in [301, 302, 303, 307] and resp.getheader("location") != None:
            redirected_url = resp.getheader("location")
            return self.get(redirected_url)
        if data:
            decoded_data = simplejson.loads(data)
            logging.debug("response:" + utils.format_json(decoded_data))
            if decoded_data["error"]:
                raise ErrorInResponseException(
                    decoded_data,
                    "Error occurred when remote driver (server) is processing the request:" +
                    utils.format_json(decoded_data))
            return decoded_data
