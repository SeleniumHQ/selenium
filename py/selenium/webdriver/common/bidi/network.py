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

from selenium.webdriver.common.bidi.common import command_builder


class NetworkEvent:
    """Represents a network event."""

    def __init__(self, event_class, **kwargs):
        self.event_class = event_class
        self.params = kwargs

    @classmethod
    def from_json(cls, json):
        return cls(event_class=json.get("event_class"), **json)


class Network:
    EVENTS = {
        "before_request": "network.beforeRequestSent",
        "response_started": "network.responseStarted",
        "response_completed": "network.responseCompleted",
        "auth_required": "network.authRequired",
        "fetch_error": "network.fetchError",
        "continue_request": "network.continueRequest",
        "continue_auth": "network.continueWithAuth",
    }

    PHASES = {
        "before_request": "beforeRequestSent",
        "response_started": "responseStarted",
        "auth_required": "authRequired",
    }

    def __init__(self, conn):
        self.conn = conn
        self.intercepts = []
        self.callbacks = {}
        self.subscriptions = {}

    def _add_intercept(self, phases=[], contexts=None, url_patterns=None):
        """Add an intercept to the network.

        Parameters:
        ----------
            phases (list, optional): A list of phases to intercept.
                Default is empty list.
            contexts (list, optional): A list of contexts to intercept.
                Default is None.
            url_patterns (list, optional): A list of URL patterns to intercept.
                Default is None.

        Returns:
        -------
            str : intercept id
        """
        params = {}
        if contexts is not None:
            params["contexts"] = contexts
        if url_patterns is not None:
            params["urlPatterns"] = url_patterns
        if len(phases) > 0:
            params["phases"] = phases
        else:
            params["phases"] = ["beforeRequestSent"]
        cmd = command_builder("network.addIntercept", params)

        result = self.conn.execute(cmd)
        self.intercepts.append(result["intercept"])
        return result

    def _remove_intercept(self, intercept=None):
        """Remove a specific intercept, or all intercepts.

        Parameters:
        ----------
            intercept (str, optional): The intercept to remove.
                Default is None.

        Raises:
        ------
            Exception: If intercept is not found.

        Notes:
        -----
            If intercept is None, all intercepts will be removed.
        """
        if intercept is None:
            intercepts_to_remove = self.intercepts.copy()  # create a copy before iterating
            for intercept_id in intercepts_to_remove:  # remove all intercepts
                self.conn.execute(command_builder("network.removeIntercept", {"intercept": intercept_id}))
                self.intercepts.remove(intercept_id)
        else:
            try:
                self.conn.execute(command_builder("network.removeIntercept", {"intercept": intercept}))
                self.intercepts.remove(intercept)
            except Exception as e:
                raise Exception(f"Exception: {e}")

    def _on_request(self, event_name, callback):
        """Set a callback function to subscribe to a network event.

        Parameters:
        ----------
            event_name (str): The event to subscribe to.
            callback (function): The callback function to execute on event.
                Takes Request object as argument.

        Returns:
        -------
            int : callback id
        """

        event = NetworkEvent(event_name)

        def _callback(event_data):
            request = Request(
                network=self,
                request_id=event_data.params["request"].get("request", None),
                body_size=event_data.params["request"].get("bodySize", None),
                cookies=event_data.params["request"].get("cookies", None),
                resource_type=event_data.params["request"].get("goog:resourceType", None),
                headers=event_data.params["request"].get("headers", None),
                headers_size=event_data.params["request"].get("headersSize", None),
                timings=event_data.params["request"].get("timings", None),
                url=event_data.params["request"].get("url", None),
            )
            callback(request)

        callback_id = self.conn.add_callback(event, _callback)

        if event_name in self.callbacks:
            self.callbacks[event_name].append(callback_id)
        else:
            self.callbacks[event_name] = [callback_id]

        return callback_id

    def add_request_handler(self, event, callback, url_patterns=None, contexts=None):
        """Add a request handler to the network.

        Parameters:
        ----------
            event (str): The event to subscribe to.
            url_patterns (list, optional): A list of URL patterns to intercept.
                Default is None.
            contexts (list, optional): A list of contexts to intercept.
                Default is None.
            callback (function): The callback function to execute on request interception
                Takes Request object as argument.

        Returns:
        -------
            int : callback id
        """

        try:
            event_name = self.EVENTS[event]
            phase_name = self.PHASES[event]
        except KeyError:
            raise Exception(f"Event {event} not found")

        result = self._add_intercept(phases=[phase_name], url_patterns=url_patterns, contexts=contexts)
        callback_id = self._on_request(event_name, callback)

        if event_name in self.subscriptions:
            self.subscriptions[event_name].append(callback_id)
        else:
            params = {}
            params["events"] = [event_name]
            self.conn.execute(command_builder("session.subscribe", params))
            self.subscriptions[event_name] = [callback_id]

        self.callbacks[callback_id] = result["intercept"]
        return callback_id

    def remove_request_handler(self, event, callback_id):
        """Remove a request handler from the network.

        Parameters:
        ----------
            event_name (str): The event to unsubscribe from.
            callback_id (int): The callback id to remove.
        """
        try:
            event_name = self.EVENTS[event]
        except KeyError:
            raise Exception(f"Event {event} not found")

        net_event = NetworkEvent(event_name)

        self.conn.remove_callback(net_event, callback_id)
        self._remove_intercept(self.callbacks[callback_id])
        del self.callbacks[callback_id]
        self.subscriptions[event_name].remove(callback_id)
        if len(self.subscriptions[event_name]) == 0:
            params = {}
            params["events"] = [event_name]
            self.conn.execute(command_builder("session.unsubscribe", params))
            del self.subscriptions[event_name]

    def clear_request_handlers(self):
        """Clear all request handlers from the network."""

        for event_name in self.subscriptions:
            net_event = NetworkEvent(event_name)
            for callback_id in self.subscriptions[event_name]:
                self.conn.remove_callback(net_event, callback_id)
                self._remove_intercept(self.callbacks[callback_id])
                del self.callbacks[callback_id]
            params = {}
            params["events"] = [event_name]
            self.conn.execute(command_builder("session.unsubscribe", params))
        self.subscriptions = {}

    def add_auth_handler(self, username, password):
        """Add an authentication handler to the network.

        Parameters:
        ----------
            username (str): The username to authenticate with.
            password (str): The password to authenticate with.

        Returns:
        -------
            int : callback id
        """
        event = "auth_required"

        def _callback(request):
            request._continue_with_auth(username, password)

        return self.add_request_handler(event, _callback)

    def remove_auth_handler(self, callback_id):
        """Remove an authentication handler from the network.

        Parameters:
        ----------
            callback_id (int): The callback id to remove.
        """
        event = "auth_required"
        self.remove_request_handler(event, callback_id)


class Request:
    """Represents an intercepted network request."""

    def __init__(
        self,
        network: Network,
        request_id,
        body_size=None,
        cookies=None,
        resource_type=None,
        headers=None,
        headers_size=None,
        method=None,
        timings=None,
        url=None,
    ):
        self.network = network
        self.request_id = request_id
        self.body_size = body_size
        self.cookies = cookies
        self.resource_type = resource_type
        self.headers = headers
        self.headers_size = headers_size
        self.method = method
        self.timings = timings
        self.url = url

    def fail_request(self):
        """Fail this request."""

        if not self.request_id:
            raise ValueError("Request not found.")

        params = {"request": self.request_id}
        self.network.conn.execute(command_builder("network.failRequest", params))

    def continue_request(self, body=None, method=None, headers=None, cookies=None, url=None):
        """Continue after intercepting this request."""

        if not self.request_id:
            raise ValueError("Request not found.")

        params = {"request": self.request_id}
        if body is not None:
            params["body"] = body
        if method is not None:
            params["method"] = method
        if headers is not None:
            params["headers"] = headers
        if cookies is not None:
            params["cookies"] = cookies
        if url is not None:
            params["url"] = url

        self.network.conn.execute(command_builder("network.continueRequest", params))

    def _continue_with_auth(self, username=None, password=None):
        """Continue with authentication.

        Parameters:
        ----------
            request (Request): The request to continue with.
            username (str): The username to authenticate with.
            password (str): The password to authenticate with.

        Notes:
        -----
            If username or password is None, it attempts auth with no credentials
        """

        params = {}
        params["request"] = self.request_id

        if not username or not password:  # no credentials is valid option
            params["action"] = "default"
        else:
            params["action"] = "provideCredentials"
            params["credentials"] = {"type": "password", "username": username, "password": password}

        self.network.conn.execute(command_builder("network.continueWithAuth", params))
