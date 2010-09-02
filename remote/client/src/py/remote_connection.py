# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
import string
import urllib2

from command import Command
import utils


class Request(urllib2.Request):
    """Extends the urllib2.Request to support all HTTP request types."""

    def __init__(self, url, data=None, method=None):
        """Initialise a new HTTP request.

        Args:
          url - String for the URL to send the request to.
          data - Data to send with the request.
        """
        if method is None:
            method = data is not None and 'POST' or 'GET'
        elif method != 'POST' and method != 'PUT':
            data = None
        self._method = method
        urllib2.Request.__init__(self, url, data=data)

    def get_method(self):
        """Returns the HTTP method used by this request."""
        return self._method


class Response(object):
    """Represents an HTTP response.

    Attributes:
      fp - File object for the response body.
      code - The HTTP status code returned by the server.
      headers - A dictionary of headers returned by the server.
      url - URL of the retrieved resource represented by this Response.
    """

    def __init__(self, fp, code, headers, url):
        """Initialise a new Response.

        Args:
          fp - The response body file object.
          code - The HTTP status code returned by the server.
          headers - A dictionary of headers returned by the server.
          url - URL of the retrieved resource represented by this Response.
        """
        self.fp = fp
        self.read = fp.read
        self.code = code
        self.headers = headers
        self.url = url

    def close(self):
        """Close the response body file object."""
        self.read = None
        self.fp = None

    def info(self):
        """Returns the response headers."""
        return self.headers

    def geturl(self):
        """Returns the URL for the resource returned in this response."""
        return self.url


class HttpErrorHandler(urllib2.HTTPDefaultErrorHandler):
    """A custom HTTP error handler.

    Used to return Response objects instead of raising an HTTPError exception.
    """

    def http_error_default(self, req, fp, code, msg, headers):
        """Default HTTP error handler.

        Args:
          req - The original Request object.
          fp - The response body file object.
          code - The HTTP status code returned by the server.
          msg - The HTTP status message returned by the server.
          headers - The response headers.

        Returns:
          A new Response object.
        """
        return Response(fp, code, headers, req.get_full_url())


class RemoteConnection(object):
    """A connection with the Remote WebDriver server.

    Communicates with the server using the WebDriver wire protocol:
    http://code.google.com/p/selenium/wiki/JsonWireProtocol
    """

    def __init__(self, remote_server_addr):
        self._url = remote_server_addr
        self._commands = {
            Command.NEW_SESSION: ('POST', '/session'),
            Command.QUIT: ('DELETE', '/session/$sessionId'),
            Command.GET_CURRENT_WINDOW_HANDLE:
                ('GET', '/session/$sessionId/window_handle'),
            Command.GET_WINDOW_HANDLES:
                ('GET', '/session/$sessionId/window_handles'),
            Command.GET: ('POST', '/session/$sessionId/url'),
            Command.GO_FORWARD: ('POST', '/session/$sessionId/forward'),
            Command.GO_BACK: ('POST', '/session/$sessionId/back'),
            Command.REFRESH: ('POST', '/session/$sessionId/refresh'),
            Command.EXECUTE_SCRIPT: ('POST', '/session/$sessionId/execute'),
            Command.GET_CURRENT_URL: ('GET', '/session/$sessionId/url'),
            Command.GET_TITLE: ('GET', '/session/$sessionId/title'),
            Command.GET_PAGE_SOURCE: ('GET', '/session/$sessionId/source'),
            Command.SCREENSHOT: ('GET', '/session/$sessionId/screenshot'),
            Command.SET_BROWSER_VISIBLE:
                ('POST', '/session/$sessionId/visible'),
            Command.IS_BROWSER_VISIBLE: ('GET', '/session/$sessionId/visible'),
            Command.FIND_ELEMENT: ('POST', '/session/$sessionId/element'),
            Command.FIND_ELEMENTS: ('POST', '/session/$sessionId/elements'),
            Command.GET_ACTIVE_ELEMENT:
                ('POST', '/session/$sessionId/element/active'),
            Command.FIND_CHILD_ELEMENT:
                ('POST', '/session/$sessionId/element/$id/element'),
            Command.FIND_CHILD_ELEMENTS:
                ('POST', '/session/$sessionId/element/$id/elements'),
            Command.CLICK_ELEMENT: ('POST', '/session/$sessionId/element/$id/click'),
            Command.CLEAR_ELEMENT: ('POST', '/session/$sessionId/element/$id/clear'),
            Command.SUBMIT_ELEMENT: ('POST', '/session/$sessionId/element/$id/submit'),
            Command.GET_ELEMENT_TEXT: ('GET', '/session/$sessionId/element/$id/text'),
            Command.SEND_KEYS_TO_ELEMENT:
                ('POST', '/session/$sessionId/element/$id/value'),
            Command.GET_ELEMENT_VALUE:
                ('GET', '/session/$sessionId/element/$id/value'),
            Command.GET_ELEMENT_TAG_NAME:
                ('GET', '/session/$sessionId/element/$id/name'),
            Command.IS_ELEMENT_SELECTED:
                ('GET', '/session/$sessionId/element/$id/selected'),
            Command.SET_ELEMENT_SELECTED:
                ('POST', '/session/$sessionId/element/$id/selected'),
            Command.TOGGLE_ELEMENT:
                ('POST', '/session/$sessionId/element/$id/toggle'),
            Command.IS_ELEMENT_ENABLED:
                ('GET', '/session/$sessionId/element/$id/enabled'),
            Command.IS_ELEMENT_DISPLAYED:
                ('GET', '/session/$sessionId/element/$id/displayed'),
            Command.HOVER_OVER_ELEMENT:
                ('POST', '/session/$sessionId/element/$id/hover'),
            Command.GET_ELEMENT_LOCATION:
                ('GET', '/session/$sessionId/element/$id/location'),
            Command.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW:
                ('GET', '/session/$sessionId/element/$id/location_in_view'),
            Command.GET_ELEMENT_SIZE:
                ('GET', '/session/$sessionId/element/$id/size'),
            Command.GET_ELEMENT_ATTRIBUTE:
                ('GET', '/session/$sessionId/element/$id/attribute/$name'),
            Command.ELEMENT_EQUALS:
                ('GET', '/session/$sessionId/element/$id/equals/$other'),
            Command.GET_ALL_COOKIES: ('GET', '/session/$sessionId/cookie'),
            Command.ADD_COOKIE: ('POST', '/session/$sessionId/cookie'),
            Command.DELETE_ALL_COOKIES:
                ('DELETE', '/session/$sessionId/cookie'),
            Command.DELETE_COOKIE:
                ('DELETE', '/session/$sessionId/cookie/$name'),
            Command.SWITCH_TO_FRAME: ('POST', '/session/$sessionId/frame'),
            Command.SWITCH_TO_WINDOW: ('POST', '/session/$sessionId/window'),
            Command.CLOSE: ('DELETE', '/session/$sessionId/window'),
            Command.DRAG_ELEMENT:
                ('POST', '/session/$sessionId/element/$id/drag'),
            Command.GET_SPEED: ('GET', '/session/$sessionId/speed'),
            Command.SET_SPEED: ('POST', '/session/$sessionId/speed'),
            Command.GET_ELEMENT_VALUE_OF_CSS_PROPERTY:
                ('GET',  '/session/$sessionId/element/$id/css/$propertyName')
        }

    def execute(self, command, params):
        """Send a command to the remote server.

        Any path subtitutions required for the URL mapped to the command should be
        included in the command parameters.

        Args:
          command - A string specifying the command to execute.
          params - A dictionary of named parameters to send with the command as
              its JSON payload.
        """
        command_info = self._commands[command]
        assert command_info is not None, 'Unrecognised command %s' % command
        data = utils.dump_json(params)
        path = string.Template(command_info[1]).substitute(params)
        url = '%s%s' % (self._url, path)
        return self._request(url, method=command_info[0], data=data)

    def _request(self, url, data=None, method=None):
        """Send an HTTP request to the remote server.

        Args:
          method - A string for the HTTP method to send the request with.
          url - The URL to send the request to.
          body - The message body to send.

        Returns:
          A dictionary with the server's parsed JSON response.
        """
        logging.debug('%s %s %s' % (method, url, data))

        request = Request(url, data=data, method=method)
        request.add_header('Accept', 'application/json')

        opener = urllib2.build_opener(urllib2.HTTPRedirectHandler(),
                                      HttpErrorHandler())
        response = opener.open(request)
        try:
            if response.code > 399 and response.code < 500:
                return {'status': response.code, 'value': response.read()}
            body = response.read().replace('\x00', '').strip()
            if body:
                data = utils.load_json(body.strip())
                assert type(data) is dict, (
                    'Invalid server response body: %s' % body)
                assert 'status' in data, (
                    'Invalid server response; no status: %s' % body)
                # Some of the drivers incorrectly return a response
                # with no 'value' field when they should return null.
                if 'value' not in data:
                    data['value'] = None
                return data
        finally:
            response.close()
