require 'pp'
require 'open3'

module Bazel
  def self.execute(kind, args, target, &block)
    verbose = Rake::FileUtilsExt.verbose_flag

    if target.end_with?(':run')
      kind = 'run'
      target = target[0, target.length - 4]
    end

    cmd = %w[bazel] + [kind, target] + (args || [])

    if SeleniumRake::Checks.windows?
      cmd = cmd + ["2>&1"]
      cmd_line = cmd.join(' ')
      cmd_out = `#{cmd_line}`.encode('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')
      cmd_exit_code = $?.success?
    else
      Open3.popen2e(*cmd) do |stdin, stdouts, wait|
        is_running = true
        stdin.close
        cmd_out = ''
        while is_running
          begin
            pipes = IO.select([stdouts])
            if pipes.empty?
              is_running = false
            else
              line = stdouts.readpartial(512)
              cmd_out << line
              STDOUT.print line if verbose
            end
          rescue EOFError
            is_running = false
          end
        end
        cmd_exit_code = wait.value.exitstatus
      end
    end

    puts cmd_out if verbose

    raise "#{cmd.join(' ')} failed with exit code: #{cmd_exit_code}" unless cmd_exit_code

    block&.call(cmd_out)
    out_artifact = Regexp.last_match(1) if cmd_out =~ %r{\s+(bazel-bin/\S+)}

    puts "#{target} -> #{out_artifact}" if out_artifact
    out_artifact
  end
end