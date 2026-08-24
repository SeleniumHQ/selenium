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

"""Internal WebDriver BiDi protocol layer, projected from the BiDi specification.

This package is an internal implementation detail, not a supported public API.
It carries no stability guarantee and may change without warning between releases.
Program against the high-level driver APIs instead. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""

# The domain modules beside this file (network.py, browsing_context.py, ...) are
# generated at build time from the shared BiDi schema by //py:create-bidi-protocol-src
# and are not checked in. Only serialization.py, transport.py, domain.py and this
# __init__.py are hand-written. Regenerate the domain modules locally with:
#   bazel run //py:generate-bidi-protocol
