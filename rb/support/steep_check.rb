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
require "fileutils"
require "open3"

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

# Clear GIT_DIR to prevent it from interfering with RBS collection git operations
# (e.g., when running via git pre-push hook which sets GIT_DIR)
ENV.delete('GIT_DIR')

# Install RBS collection from lockfile (--frozen skips Gemfile.lock validation)
system(ruby, "-S", "rbs", "collection", "install", "--frozen") || exit(1)

# Run steep check, discarding stderr (internal Steep logs, not type errors)
cmd = [ruby, "-S", "steep", "check", "--severity-level=error", *ARGV]
stdout, status = Open3.capture2(*cmd, err: File::NULL)

print stdout
exit status.exitstatus
