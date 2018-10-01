require 'inifile'
require 'open3'
require 'rake-tasks/checks'

module Buck

  def self.download
    @@buck_bin ||= (
      cmd = if windows?
              buckconfigs = [IniFile.load('.buckconfig.local'), IniFile.load('.buckconfig')]
              python_interpreter = buckconfigs.lazy.map { |c| c && c['parser']['python_interpreter'] }.find(&:itself)
              [python_interpreter || "python", "buckw"]
            else
              ["./buckw"]
            end

      sh cmd.join(" ") + " kill", :verbose => true
      cmd
    )
  end

  def self.buck_cmd(command, args, &block)
    buck = []
    pex = Buck.download
    buck.push(*pex)

    args ||= []
    buck.push(command)
    if command == 'build' || command == 'test' || command == 'publish'
      buck.push('--stamp-build=detect')
    end
    buck.push(*args)
    puts buck.join(' ')

    output = ''
    Open3.popen3(*buck) do |stdin, stdout, stderr, wait|
      Thread.new do
        while (error = stderr.gets)
          STDERR.print(error)
        end
      end

      Thread.new do
        while (line = stdout.gets)
          output << line
          STDOUT.print line
        end
      end

      stdin.close

      raise "#{buck.join(' ')} failed with exit code: #{wait.value.exitstatus}" unless wait.value.success?
    end

    block.call(output) if block
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

    Buck.buck_cmd('targets', ['--show-output', target]) do |output|
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
    Buck.buck_cmd('build',  [name])
    block.call if block
  end

  Buck::enhance_task(task)
end

rule /\/\/.*:run/ => [ proc {|task_name| task_name[0..-5]} ] do |task|
  Buck::enhance_task(task)

  short = task.name[0..-5]

  task.enhance do
    # Figure out if this is an executable or a test target.
    Buck.buck_cmd('query', [short, '--output-attributes', 'buck.type']) do |output|
      hash = JSON.parse(output)
      type = hash[short]['buck.type']
      if type =~ /.*_test/
        Buck.buck_cmd('test', [short])
      else
        Buck.buck_cmd('run', ['--verbose', '5', short])
      end
    end
  end
end


rule /\/\/.*:zip/ => [ proc {|task_name| task_name[0..-5]} ] do |task|
  Buck::enhance_task(task)

  short = task.name[0..-5]

  task.enhance do
    dir, target = short[2..-1].split(':', 2)
    working_dir = "buck-out/crazy-fun/#{dir}/#{target}_zip"

    # Build the source zip
    Buck.buck_cmd('query', ["kind(java_library, deps(#{short}))"]) do |output|
      # Collect all the targets
      to_build = []
      output.lines do |line|
        line.chomp!
        to_build.push(line + "#src")
      end

      src_dir = "buck-out/crazy-fun/#{dir}/#{target}_src_zip"
      src_out = "#{working_dir}/#{target}-#{version}-nodeps-sources.zip"
      mkdir_p File.dirname(src_out)
      rm_f src_out
      rm_rf src_dir

      mkdir_p src_dir
      mkdir_p "#{working_dir}/lib"
      mkdir_p "#{working_dir}/uber"

      Buck.buck_cmd('build', ['--show-output'] + to_build) do |built|
        built.lines do |line|
          line.chomp!
          line.split[1].each do |file|
            next unless File.exists? file
            sh "cd #{src_dir} && jar xf #{File.expand_path(file)}"
          end
        end
      end
      sh "cd #{src_dir} && jar cMf #{File.expand_path(src_out)} *"
    end

    # Figure out if this is an executable or a test target.
    Buck.buck_cmd('audit', ['classpath', short]) do |output|
      third_party = []
      first_party = []

      output.lines do |line|
        line.chomp!
        line = line.gsub(/\\/, "/")

        if line =~ /gen\/third_party\/.*\.jar/
          third_party.push(line)
        elsif line =~ /gen\/java\/.*\.jar/
          first_party.push(line)
        end
      end

      first_party.each do |jar|
        sh "cd #{working_dir}/uber && jar xf #{jar}"
      end

      # TODO: Don't do this. It's sinful.
      version = File.open('SELENIUM_VERSION', &:gets).chomp
      version = eval(version)

      out = "buck-out/crazy-fun/#{dir}/#{target}.zip"

      sh "cd #{working_dir}/uber && jar cMf ../#{target}-#{version}-nodeps.jar *"
      rm_rf "#{working_dir}/uber"

      third_party.each do |jar|
        cp jar, "#{working_dir}/lib"
      end
      sh "cd #{working_dir} && jar cMf #{File.expand_path(out)} *"

      task.out = out
    end
  end
end


rule /\/\/.*/ do |task|
  # Task is a FileTask, but that's not what we need. Instead, just delegate down to buck in all
  # cases where the rule was not created by CrazyFun. Rules created by the "rule" method will
  # be a FileTask, whereas those created by CrazyFun are normal rake Tasks.

  buck_file = task.name[/\/\/([^:]+)/, 1] + "/BUCK"

  if task.class == Rake::FileTask && !task.out && File.exists?(buck_file)
    task.enhance do
      Buck.buck_cmd('build', ['--deep', task.name])
    end

    Buck::enhance_task(task)
  end
end
