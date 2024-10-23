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

from .session import session_subscribe, session_unsubscribe

class Network:
    EVENTS = {
        'before_request': 'network.beforeRequestSent',
        'response_started': 'network.responseStarted',
        'response_completed': 'network.responseCompleted',
        'auth_required': 'network.authRequired',
        'fetch_error': 'network.fetchError'
    }

    PHASES = {
        'before_request': 'beforeRequestSent',
        'response_started': 'responseStarted',
        'auth_required': 'authRequired'
    }

    def __init__(self, conn):
        self.conn = conn
        self.callbacks = {}

    async def continue_response(self, request_id, status_code, headers=None, body=None):
        params = {
            'requestId': request_id,
            'status': status_code
        }
        if headers is not None:
            params['headers'] = headers
        if body is not None:
            params['body'] = body
        await self.conn.execute('network.continueResponse', params)

    async def continue_request(self, request_id, url=None, method=None, headers=None, postData=None):
        params = {
            'requestId': request_id
        }
        if url is not None:
            params['url'] = url
        if method is not None:
            params['method'] = method
        if headers is not None:
            params['headers'] = headers
        if postData is not None:
            params['postData'] = postData
        await self.conn.execute('network.continueRequest', params)

    async def add_intercept(self, phases=None, contexts=None, url_patterns=None):
        if phases is None:
            phases = []
        params = {
            'phases': phases,
            'contexts': contexts,
            'urlPatterns': url_patterns
        }
        await self.conn.execute('network.addIntercept', params)

    async def remove_intercept(self, intercept):
        await self.conn.execute('network.removeIntercept', {'intercept': intercept})

    async def continue_with_auth(self, request_id, username, password):
        await self.conn.execute(
            'network.continueWithAuth',
            {
                'request': request_id,
                'action': 'provideCredentials',
                'credentials': {
                    'type': 'password',
                    'username': username,
                    'password': password
                }
            }
        )

    async def on(self, event, callback):
        event = self.EVENTS.get(event, event)
        self.callbacks[event] = callback
        await session_subscribe(self.conn, event, self.handle_event)

    async def handle_event(self, event, data):
        if event in self.callbacks:
            await self.callbacks[event](data)
