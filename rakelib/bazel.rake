require 'pp'
require 'rake/task'
require 'rake_tasks/selenium_rake/checks'
require 'rakelib/bazel/task'
require 'rakelib/rake/dsl'

module Bazel
  class << self
    def execute(kind, args, target, &block)
      verbose = Rake::FileUtilsExt.verbose_flag

      cmd = %w[bazel] + [kind, target] + (args || [])
      puts cmd.join(" ")
      
      if SeleniumRake::Checks::windows?
        cmd = cmd + ["2>&1"]
        cmd_line = cmd.join(" ")
        cmd_out = `#{cmd_line}`
        cmd_exit_code = $?.success?
      else
        cmd_out = `#{cmd_line}`
        cmd_exit_code = $?.success?
      end

      puts cmd_out if verbose

      raise "#{cmd.join(' ')} failed with exit code: #{cmd_exit_code}" if not cmd_exit_code

      block&.call(cmd_out)
      out_artifact = Regexp.last_match(1) if cmd_out =~ %r{\s+(bazel-bin/\S+)}
      
      puts "#{target} -> #{out_artifact}" if out_artifact
      out_artifact
    end
  end
end
