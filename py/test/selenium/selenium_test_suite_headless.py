"""
Copyright 2006 ThoughtWorks, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import unittest
import test_ajax_jsf
import test_default_server
import test_google
import test_i18n
import sys

def suite():
    return unittest.TestSuite((\
        unittest.makeSuite(test_i18n.TestI18n),
        ))

if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=2).run(suite())
    sys.exit(not result.wasSuccessful())
