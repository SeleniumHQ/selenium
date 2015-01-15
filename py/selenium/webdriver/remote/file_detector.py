# Copyright 2014 Software freedom conservancy
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
from __future__ import absolute_import

import abc
import os
import six
from selenium.webdriver.common.keys import keys_to_typing


@six.with_metaclass(abc.ABCMeta)
class FileDetector(object):
    """
    Used for identifying whether a sequence of chars represents the path to a
    file.
    """

    @abc.abstractmethod
    def is_local_file(self, *keys):
        return


class UselessFileDetector(FileDetector):
    """
    A file detector that never finds anything.
    """
    def is_local_file(self, *keys):
        return None


class LocalFileDetector(FileDetector):
    """
    Detects files on the local disk.
    """
    def is_local_file(self, *keys):
        file_path = ''
        typing = keys_to_typing(keys)
        file_path = ''.join(typing)

        if file_path is '':
            return None

        try:
            if os.path.isfile(file_path):
                return file_path
        except:
            pass
        return None
