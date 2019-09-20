# frozen_string_literal: true

require 'pp'
require 'open3'
require 'rake/task'
require 'rakelib/bazel/task'
require 'rakelib/rake/dsl'

module Bazel
  class << self
    def execute(kind, args, target, &block)
      verbose = Rake::FileUtilsExt.verbose_flag
      outs = []

      cmd = %w[bazel] + [kind, target] + (args || [])
      cmd_out = ''
      Open3.popen2e(*cmd) do |stdin, stdouts, wait|
        Thread.new do
          while (line = stdouts.gets)
            outs << Regexp.last_match(1) if line.chomp =~ %r{\s+(bazel-bin/.+)}
            cmd_out << line
            STDOUT.print line if verbose
          end
        end

        stdin.close

        raise "#{cmd.join(' ')} failed with exit code: #{wait.value.exitstatus}" unless wait.value.success?

        block&.call(cmd_out)

        puts "#{target} -> #{outs[0]}" if outs.length
        outs[0] if outs.length
      end
    end
  end
end
