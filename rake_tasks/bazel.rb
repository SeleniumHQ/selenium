# frozen_string_literal: true

require 'English'
require 'open3'
require 'rake'
require 'io/wait'
require_relative 'selenium_rake/checks'

module Bazel
  def self.execute(kind, args, target, &block)
    verbose = Rake::FileUtilsExt.verbose_flag

    if target.end_with?(':run')
      kind = 'run'
      target = target[0, target.length - 4]
    end

    cmd = %w[bazel] + [kind, target] + (args || [])
    cmd_out = ''
    cmd_exit_code = 0

    if SeleniumRake::Checks.windows?
      cmd += ['2>&1']
      cmd_line = cmd.join(' ')
      cmd_out = `#{cmd_line}`.encode('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')
      puts cmd_out if verbose
      cmd_exit_code = $CHILD_STATUS
    else
      Open3.popen2e(*cmd) do |stdin, stdouts, wait|
        is_running = true
        stdin.close
        while is_running
          begin
            stdouts.wait_readable
            line = stdouts.readpartial(512)
            cmd_out += line
            $stdout.print line if verbose
          rescue EOFError
            is_running = false
          end
        end
        cmd_exit_code = wait.value.exitstatus
      end
    end

    raise "#{cmd.join(' ')} failed with exit code: #{cmd_exit_code}\nOutput: #{cmd_out}" if cmd_exit_code != 0

    block&.call(cmd_out)
    return unless cmd_out =~ %r{\s+(bazel-bin/\S+)}

    out_artifact = Regexp.last_match(1)
    puts "#{target} -> #{out_artifact}" if out_artifact
    out_artifact
  end
end
