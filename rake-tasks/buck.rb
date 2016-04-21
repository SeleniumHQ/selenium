require 'open3'

module Buck

  def self.buck_cmd
    @@buck_cmd ||= (
      lambda { |command, target, &block|
        cmd = "buck #{command} #{target}"
        output = ''
        err = ''
        Open3.popen3(cmd) do |stdin, stdout, stderr, wait_thr|
          stdin.close

          while line = stderr.gets
            if command == 'build' || command == 'test'
              puts line
            end
            err += line
          end

          while line = stdout.gets
            output += line
          end

          # In jruby, wait_thr always appears to be nil. *sigh*
#          if !wait_thr.value.success?
#            raise "Unable to execute command: " + err.to_s
#          end
        end

        block.call(output.to_s) if block
      }
    )

    #block.call(output) if block
  end

  def self.enhance_task(task)
    class <<task
      def needed?
        true
      end

      attr_reader :out
      def out
        @out ||= Buck::find_buck_out(name)
      end
    end

    task
  end

  def self.find_buck_out(target)
    out = nil

    Buck::buck_cmd.call('targets', "--show-output #{target}") do |output|
      sections = output.chomp.split
      # Not all buck rules have an output file.
      if sections.size > 1
        out = output.chomp.split[-1]
      end
    end

    out
  end

end

def buck(*args, &block)
  case args[0]
    when String
      name = args[0].to_sym
      prereqs = []
    when Hash
      name = args[0].keys[0]
      pres = args[0][name]
      case pres
        when String
          prereqs = [pres]
        when Array
          prereqs = pres
        else
          raise "I have no idea what to do with this: #{pres.class.to_s}"
      end
    else
      raise "Unknown arg type: #{args[0].class.to_s}"
  end

  task = Rake::Task.task_defined?(name) ? Rake::Task[name] : Rake::Task.define_task(name)
  task.enhance prereqs do
    Buck::buck_cmd.call('build', name)
    block.call if block
  end

  Buck::enhance_task(task)
end

rule /\/\/.*:run/ => [ proc {|task_name| task_name[0..-5]} ] do |task|
  Buck::enhance_task(task)

  short = task.name[0..-5]

  task.enhance do
    Buck::buck_cmd.call('test', short)
  end
end

rule /\/\/.*/ do |task|
  # Task is a FileTask, but that's not what we need. Instead, just delegate down to buck in all
  # cases where the rule was not created by CrazyFun. Rules created by the "rule" method will
  # be a FileTask, whereas those created by CrazyFun are normal rake Tasks.

  puts "Making things the old way: #{task.name}"

  if task.class == Rake::FileTask && !task.out
    task.enhance do
      Buck::buck_cmd.call('build', task.name)
    end

    Buck::enhance_task(task)
  end
end
