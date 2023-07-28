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

from functools import wraps
from warnings import warn

version = "4.12"


def deprecated_function(message):
    """decorator to log deprecation warning messgaes for deprecated methods."""

    @wraps
    def _deprecated_function(func):
        def wrapper(*args, **kwargs):
            warn(f"{message}: will be removed from {version}", DeprecationWarning, stacklevel=2)
            return func(*args, **kwargs)

        return wrapper

    return _deprecated_function


def deprecated_attribute(message, **dep_attr):
    @wraps
    def _deprecated_attributes(func):
        def wrapper(*args, **kwargs):
            func(*args, **kwargs)
            dep_attr_name = list(dep_attr.keys())[0]  # getting the name of deprecated attr
            dep_attr_type = list(dep_attr.values())[0]  # getting should the value be truthy or falsy?
            # get the value of the deprecated attributes
            dep_attr_value = getattr(args[0], dep_attr_name)  # getting actual value passed to depattr
            # check the truthiness of the deprecated attribute
            if bool(dep_attr_value) is dep_attr_type:
                warn(
                    f"'{dep_attr_name}': will be removed from {version}: {message}",
                    DeprecationWarning,
                    stacklevel=2,
                )

        return wrapper

    return _deprecated_attributes
