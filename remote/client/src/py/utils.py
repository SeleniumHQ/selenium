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

import simplejson
from ..common.exceptions import NoSuchElementException


def format_json(json_struct):
    return simplejson.dumps(json_struct, indent=4)

def handle_find_element_exception(e):
    if ("Unable to find" in e.response["value"]["message"] or
        "Unable to locate" in e.response["value"]["message"]):
        raise NoSuchElementException("Unable to locate element:")
    else:
        raise e

def return_value_if_exists(resp):
    if resp and "value" in resp:
        return resp["value"]

def get_root_parent(elem):
    parent = elem.parent
    while True:
        try:
            parent.parent
            parent = parent.parent
        except AttributeError:
            return parent
