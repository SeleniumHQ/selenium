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

import uuid


class ScriptKey:
    def __init__(self, id=None):
        self._id = id or uuid.uuid4()

    @property
    def id(self):
        return self._id

    def __eq__(self, other) -> bool:
        """Compare this ScriptKey with another object for equality.

        Args:
            other: The object to compare with.

        Returns:
            True if the script key ID equals the other object, False otherwise.
        """
        return self._id == other

    def __repr__(self) -> str:
        """Return a string representation of the ScriptKey object.

        Returns:
            A string representation showing the script key ID.
        """
        return f"ScriptKey(id={self.id})"
