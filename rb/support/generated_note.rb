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

# Shared generated-file marker text for Ruby generators — see scripts/generated_note_template.txt.
module GeneratedNote
  def self.runfiles
    @runfiles ||= begin
      require 'bazel/runfiles'
      Bazel::Runfiles.create
    end
  end

  # Resolves a Bazel rlocation key to a real path. Fail loud: a generator has no non-Bazel
  # fallback, and rlocation returns nil when not running under a runfiles tree.
  def self.rlocation(key)
    runfiles.rlocation(key) || raise("Could not resolve runfile #{key.inspect}")
  end

  # Renders the standard two-line generated-file marker in the given comment style.
  def self.render(comment_prefix, generator, command)
    template = File.read(rlocation('_main/scripts/generated_note_template.txt'))
    text = template.sub('{generator}', generator).sub('{command}', command)
    text.rstrip.split("\n").map { |line| "#{comment_prefix} #{line}" }.join("\n")
  end
end
