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

import typing
from dataclasses import dataclass
from threading import Thread
from time import sleep
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

    def add_intercept(self, phases=None, contexts=None, url_patterns=None):
        if phases is None:
            phases = []
        self.conn.execute('network.addIntercept', phases=phases, contexts=contexts, urlPatterns=url_patterns)

    def remove_intercept(self, intercept):
        self.conn.execute('network.removeIntercept', intercept=intercept)

    def continue_with_auth(self, request_id, username, password):
        self.conn.execute(
            'network.continueWithAuth',
            request=request_id,
            action='provideCredentials',
            credentials={
                'type': 'password',
                'username': username,
                'password': password
            }
        )

    def on(self, event, callback):
        event = self.EVENTS.get(event, event)
        self.callbacks[event] = callback
        session_subscribe(self.conn, event, self.handle_event)

    def handle_event(self, event, data):
        if event in self.callbacks:
            self.callbacks[event](data)

    def off(self, event):
        event = self.EVENTS.get(event, event)
        if event in self.callbacks:
            del self.callbacks[event]
            session_unsubscribe(self.conn, event, self.handle_event)