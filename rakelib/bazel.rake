require 'pp'
require 'rake/task'
require 'rakelib/bazel/task'
require 'rakelib/rake/dsl'

module Bazel
  class << self
    def execute(kind, args, target, &block)
      verbose = Rake::FileUtilsExt.verbose_flag

      cmd = %w[bazel] + [kind, target] + (args || []) + ["2>&1"]
      cmd_line = cmd.join(" ")
      puts cmd_line

      cmd_out = `#{cmd_line}`

      puts cmd_out if verbose

      raise "#{cmd.join(' ')} failed with exit code: #{$?.success?}" if not $?.success?

      block&.call(cmd_out)
      out_artifact = Regexp.last_match(1) if cmd_out =~ %r{\s+(bazel-bin/\S+)}
      
      puts "#{target} -> #{out_artifact}" if out_artifact
      out_artifact
    end
  end
end
