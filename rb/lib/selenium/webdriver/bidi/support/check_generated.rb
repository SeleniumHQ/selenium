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
  def self.check!(schema_path)
    schema_path = File.join(Dir.pwd, schema_path) unless File.exist?(schema_path)
    modules = build_ir(Schema.new(JSON.parse(File.read(schema_path))))
    protocol_dir = File.expand_path('../protocol', __dir__)
    template = File.join(__dir__, 'templates', 'module.rb.erb')

    stale = modules.reject do |mod|
      path = File.join(protocol_dir, "#{mod.filename}.rb")
      File.exist?(path) && File.read(path) == render(mod, template)
    end
    return if stale.empty?

    warn "Generated BiDi protocol code is stale or hand-edited: #{stale.map { |m| "#{m.filename}.rb" }.sort.join(', ')}"
    warn 'Regenerate with: bazel run //rb/lib/selenium/webdriver:bidi-generate'
    exit 1
  end
end

BiDiGenerate.check!(ARGV.fetch(0)) if $PROGRAM_NAME == __FILE__
