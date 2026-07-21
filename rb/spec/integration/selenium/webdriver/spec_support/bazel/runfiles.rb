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

# Mirrors the Bazel::Runfiles helper in rules_ruby#374; drop this file and depend on
# @rules_ruby//ruby/runfiles once a rules_ruby release ships it.

require 'pathname'

module Bazel
  # Resolves runtime paths to data dependencies using either a
  # manifest file or a runfiles directory.
  class Runfiles
    def self.create(env = ENV)
      manifest_file = env['RUNFILES_MANIFEST_FILE']
      runfiles_dir = env['RUNFILES_DIR']

      return new(ManifestBased.new(manifest_file)) if manifest_file && !manifest_file.empty?
      return new(DirectoryBased.new(runfiles_dir)) if runfiles_dir && !runfiles_dir.empty?

      create_from_program_name($PROGRAM_NAME)
    end

    def self.create_from_program_name(program_name)
      if File.exist?("#{program_name}.runfiles_manifest")
        new(ManifestBased.new("#{program_name}.runfiles_manifest"))
      elsif File.exist?("#{program_name}.runfiles")
        new(DirectoryBased.new("#{program_name}.runfiles"))
      else
        new(DirectoryBased.new(''))
      end
    end

    def initialize(strategy)
      @strategy = strategy
    end

    def rlocation(path)
      raise ArgumentError, 'path must not be empty' if path.to_s.empty?

      return path if Pathname.new(path).absolute?

      invalid_path = %r{\A\.\.[/\\]|[/\\]\.\.[/\\]|\A\.[/\\]|[/\\]\.[/\\]|[/\\]\.\z|[/\\][/\\]}
      raise ArgumentError, "path is not valid: #{path.inspect}" if path.match?(invalid_path)

      @strategy.rlocation(path)
    end

    # Resolves paths by looking them up in a runfiles MANIFEST file.
    class ManifestBased
      def initialize(manifest_path)
        @entries = parse_manifest(manifest_path)
      end

      def rlocation(path)
        return @entries[path] if @entries.key?(path)

        prefix = File.dirname(path)
        while prefix != '.' && prefix != '/'
          base = @entries[prefix]
          return "#{base}#{path[prefix.length..]}" if base && !base.empty?

          prefix = File.dirname(prefix)
        end

        nil
      end

      private

      def parse_manifest(path)
        entries = {}
        return entries unless File.exist?(path)

        File.foreach(path) do |line|
          line.chomp!
          next if line.empty?

          key, value = parse_entry(line)
          entries[key] = value
        end

        entries
      end

      def parse_entry(line)
        escaped = line.delete_prefix!(' ')
        key, _, value = line.partition(' ')
        return [key, value] unless escaped

        [unescape(key), unescape(value)]
      end

      def unescape(str)
        str.gsub(/\\[snb]/, '\s' => ' ', '\n' => "\n", '\b' => '\\')
      end
    end

    # Resolves paths by joining them onto a runfiles directory root.
    class DirectoryBased
      def initialize(runfiles_dir)
        @runfiles_dir = runfiles_dir
      end

      def rlocation(path)
        return nil if @runfiles_dir.empty?

        File.join(@runfiles_dir, path)
      end
    end
  end
end
