# frozen_string_literal: true

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

require 'selenium-webdriver'

checkout = File.expand_path('../../../..', __dir__)
bazel_bin = "#{checkout}/bazel-bin/rb"
unless File.directory?("#{bazel_bin}/bin")
  raise Selenium::WebDriver::Error::WebDriverError,
        "#{bazel_bin} has not been built; run `./go rb:local_dev` in #{checkout}"
end

$LOAD_PATH.insert(0, "#{bazel_bin}/lib")
Selenium::WebDriver::SeleniumManager.bin_path = "#{bazel_bin}/bin"
Selenium::WebDriver.logger.info("Using atoms, CDP, and Selenium Manager from #{bazel_bin}", id: :local_dev)

devtools = Gem.loaded_specs['selenium-devtools']
if devtools && File.realpath(devtools.full_gem_path) != "#{checkout}/rb"
  Selenium::WebDriver.logger.warn("selenium-devtools #{devtools.version} from #{devtools.full_gem_path} mixes with the " \
                                  "checkout's CDP code; remove it from the Gemfile", id: %i[local_dev devtools])
end
