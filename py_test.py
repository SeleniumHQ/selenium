#!/usr/bin/env python

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

"""A script for running the unit test and example tests for the python
binding."""

import optparse
import os
import shutil
import subprocess
import sys

def run_script(script_name, *args):
    command = [sys.executable, script_name.replace("/", os.path.sep)]
    command.extend(args)

    return subprocess.Popen(command)

if __name__ == "__main__":
    usage = 'usage: %prog [options] arg'
    parser = optparse.OptionParser(usage)
    parser.add_option('-d', '--driver', dest='driver', action='store',
                      default='firefox', type='choice',
                      choices=['chrome', 'firefox', 'remote'],
                      help='Which driver to test.')
    (options, args) = parser.parse_args()

    driver_tests_dict = {
      'chrome': ['api_examples'],
      'firefox': ['api_examples', 'cookie_tests', 'firefox_launcher_tests'],
      'remote': ['api_examples'],
    }

    base_dir = os.path.abspath(os.path.dirname(__file__))
    print 'base_dir:',base_dir
    os.environ["WEBDRIVER"] = base_dir
    os.environ["PYTHONPATH"] = os.pathsep.join([os.environ.get("PYTHONPATH", ""),
                                             os.path.join(base_dir, "../../../", "firefox", "lib-src"),
                                             os.path.join(base_dir, '..')])
    try:
        for test in driver_tests_dict[options.driver]:
            process = run_script(os.path.join(base_dir, "%s_tests/%s.py" % (options.driver, test)))
            assert process.wait() == 0, "Test %s failed" % test
    finally:
        try:
            os.kill(process.pid, 9)
        except:
            pass
