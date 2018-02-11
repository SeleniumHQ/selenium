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

"""This module contains some decorators that can be used to support
the page models. For example for an action that needs a page to be fully
loaded, the @require_loaded decorator will make sure the page is loaded
before the call is invoked.
This pattern is also useful for waiting for certain asynchronous events
to happen before excuting certain actions."""


def require_loaded(func):
    def load_page(page, *params, **kwds):
        if not page.is_loaded():
            page.load()
        assert page.is_loaded(), "page should be loaded by now"
        return func(page, *params, **kwds)
    return load_page
