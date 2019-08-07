require 'pp'
require 'open3'
require "rake/task"

module Bazel
  def self.execute(kind, target, &block)
    verbose = Rake::FileUtilsExt.verbose_flag
    outs = []

    cmd = %w(bazel) + [kind, target]
    cmd_out = ""
    Open3.popen2e(*cmd) do |stdin, stdouts, wait|
      Thread.new do
        while (line = stdouts.gets)
          if line.chomp =~ /\s+(bazel-bin\/.+)/
            outs << $1
          end
          cmd_out << line
          STDOUT.print line if verbose
        end
      end

      stdin.close

      raise "#{cmd.join(' ')} failed with exit code: #{wait.value.exitstatus}" unless wait.value.success?

      block.call(cmd_out) if block

      if outs.length
        puts "#{target} -> #{outs[0]}"
      end
      outs[0] if outs.length
    end
  end

  class BazelTask < Rake::Task
    def needed?
      true
    end

    def invoke(*args, &block)
      self.out = Bazel::execute(@verbose, "build", name, &block)

      block.call(cmd_out) if block
    end
  end
end

module Rake::DSL
  def bazel(*args, &block)
    Bazel::BazelTask.define_task(*args, &block)
  end
end
