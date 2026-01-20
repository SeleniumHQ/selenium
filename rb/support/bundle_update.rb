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

require "fileutils"
require "rbconfig"

# Find the rb directory - use BUILD_WORKSPACE_DIRECTORY if in Bazel
root = if ENV['BUILD_WORKSPACE_DIRECTORY']
         File.join(ENV['BUILD_WORKSPACE_DIRECTORY'], 'rb')
       else
         File.expand_path("../..", __dir__)
       end

Dir.chdir(root)

ENV["BUNDLE_GEMFILE"] ||= File.join(root, "Gemfile")
ENV["BUNDLE_PATH"] ||= File.join(root, ".bundle")
ENV["BUNDLE_DISABLE_SHARED_GEMS"] ||= "1"

FileUtils.mkdir_p(ENV["BUNDLE_PATH"])

ruby = RbConfig.ruby
exec ruby, "-S", "bundle", "update", *ARGV
