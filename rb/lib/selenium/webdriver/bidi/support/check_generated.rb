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

require 'json'
require_relative 'bidi_generate'

module BiDiGenerate
  # Verifies the checked-in protocol .rb match what the generator would produce from the
  # current schema — catching a hand-edit or a forgotten regeneration. Re-renders each module
  # in memory (no file writes) and compares. The .rbs are covered by Steep.
  def self.check!(schema_rootpath)
    schema = Schema.new(JSON.parse(File.read(schema_path(schema_rootpath))))
    protocol_dir = File.expand_path('../protocol', __dir__)
    template = File.join(__dir__, 'templates', 'module.rb.erb')

    stale = build_ir(schema).filter_map do |mod|
      path = File.join(protocol_dir, "#{mod.filename}.rb")
      "#{mod.filename}.rb" unless File.exist?(path) && File.read(path) == render(mod, template)
    end
    stale << 'error_code.rb' unless error_module_current?(schema, protocol_dir)
    return if stale.empty?

    warn "Generated BiDi protocol code is stale or hand-edited: #{stale.sort.join(', ')}"
    warn 'Regenerate with: bazel run //rb/lib/selenium/webdriver:bidi-generate'
    exit 1
  end

  # Whether the checked-in protocol/error_code.rb matches what the generator would render now.
  def self.error_module_current?(schema, protocol_dir)
    mod = ErrorModule.new(filename: 'error_code', codes: error_code_map(schema))
    path = File.join(protocol_dir, 'error_code.rb')
    File.exist?(path) && File.read(path) == render(mod, File.join(__dir__, 'templates', 'error_code.rb.erb'))
  end

  # $(rootpath) is relative to the runfiles root; __dir__ anchors us there so it resolves the
  # same way locally and on RBE (an execpath would not). This file lives at
  # rb/lib/selenium/webdriver/bidi/support, so expand six levels up to the root — File.expand_path
  # is separator-agnostic, unlike stripping a "/"-spelled suffix (which would miss on Windows).
  # The cwd-relative rootpath fallback matches how spec_support's `rlocation` resolves.
  def self.schema_path(rootpath)
    runfiles_root = File.expand_path('../../../../../..', __dir__)
    [File.join(runfiles_root, rootpath), rootpath].find { |p| File.exist?(p) } ||
      raise("BiDi schema not found (looked for #{rootpath})")
  end
end

BiDiGenerate.check!(ARGV.fetch(0)) if $PROGRAM_NAME == __FILE__
