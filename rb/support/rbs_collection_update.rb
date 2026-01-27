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

require "rbconfig"

# Find the rb directory - try multiple strategies for different Bazel contexts
root = if ENV['BUILD_WORKSPACE_DIRECTORY']
         # bazel run sets this to the workspace root
         File.join(ENV['BUILD_WORKSPACE_DIRECTORY'], 'rb')
       elsif ENV['BUILD_WORKING_DIRECTORY']
         # Alternative for some bazel run scenarios
         rb_path = File.join(ENV['BUILD_WORKING_DIRECTORY'], 'rb')
         File.exist?(rb_path) ? rb_path : File.expand_path("../..", __dir__)
       else
         # Direct execution or other scenarios - find rb relative to script
         script_dir = File.expand_path(__dir__)
         if script_dir.include?('runfiles')
           # In bazel test, try to find the actual workspace
           # Look for the workspace by finding where Gemfile exists
           workspace = script_dir.split('runfiles').first.sub(%r{/bazel-out/.*}, '')
           File.join(workspace, 'rb')
         else
           File.expand_path("../..", __dir__)
         end
       end

Dir.chdir(root)

ruby = RbConfig.ruby

# Run rbs collection update
system(ruby, "-S", "rbs", "collection", "update", *ARGV) || exit(1)

# Fix the gemfile_lock_path to be relative (rbs writes absolute paths when run via bazel)
lockfile = File.join(root, "rbs_collection.lock.yaml")
content = File.read(lockfile)
content.gsub!(/^gemfile_lock_path:.*$/, 'gemfile_lock_path: Gemfile.lock')
File.write(lockfile, content)

puts "Updated rbs_collection.lock.yaml with fixed gemfile_lock_path"
