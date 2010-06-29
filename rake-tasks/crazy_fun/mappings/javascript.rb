
require 'open3'
require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/crazy_fun/mappings/java'

class JavascriptMappings
  def add_all(fun)
    fun.add_mapping("js_deps", Javascript::CheckPreconditions.new)
    fun.add_mapping("js_deps", Javascript::CreateTask.new)
    fun.add_mapping("js_deps", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_deps", Javascript::AddDependencies.new)
    fun.add_mapping("js_deps", Javascript::TouchOutput.new)
    
    fun.add_mapping("js_binary", Javascript::CheckPreconditions.new)
    fun.add_mapping("js_binary", Javascript::CreateTask.new)
    fun.add_mapping("js_binary", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_binary", Javascript::AddDependencies.new)
    fun.add_mapping("js_binary", Javascript::Compile.new)

    fun.add_mapping("js_fragment", Javascript::CheckPreconditions.new)
    fun.add_mapping("js_fragment", Javascript::CreateTask.new)
    fun.add_mapping("js_fragment", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_fragment", Javascript::AddDependencies.new)
    fun.add_mapping("js_fragment", Javascript::CompileFragment.new)
  end
end

module Javascript
  CrazyFunJava.ant.taskdef(:name => "jscomp",
    :classname => "com.google.javascript.jscomp.ant.CompileTask",
    :classpath => "third_party/closure/bin/compiler-20100616.jar")

  class BaseJs < Tasks
    attr_reader :calcdeps

    def initialize()
      @calcdeps = "java -jar third_party/py/jython.jar third_party/closure/bin/calcdeps.py " +
                  "-c third_party/closure/bin/compiler-20100616.jar "
    end

    def js_name(dir, name)
      name = task_name(dir, name)
      js = "build/" + (name.slice(2 ... name.length))
      js = js.sub(":", "/")
      js << ".js"

      js.gsub("/", Platform.dir_separator)
    end
    
    def build_deps(ignore, task, deps)
      prereqs = task.prerequisites
      prereqs.each do |p| 
        if (File.exists?(p) and p.to_s =~ /\.js/)
          deps.push p.to_s unless p.to_s == ignore or p.to_s =~ /^build/
        end
        if Rake::Task.task_defined? p
          build_deps ignore, Rake::Task[p], deps
        end
      end
      
      deps
    end

    def execute(cmd)
      stdin, out, err = Open3.popen3(cmd)
      stdin.close

      # ignore stdout --- the commands we use log to stderr
      # this also causes the command to actually execute

      output = err.read
      if output =~ /ERROR/m
        STDERR.puts output
        exit(2)
      end
    end
  end

  class CheckPreconditions
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":srcs must be set" if args[:srcs].nil? and args[:deps].nil?
    end
  end
  
  class CreateTaskShortName < BaseJs
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])

      if (name.end_with? "/#{args[:name]}:#{args[:name]}")
        name = name.sub(/:.*$/, "")

        task name => task_name(dir, args[:name])

        Rake::Task[name].out = js_name(dir, args[:name])
      end
    end
  end

  class CreateTask < BaseJs
    def handle(fun, dir, args)
      name = js_name(dir, args[:name])
      task_name = task_name(dir, args[:name])

      file name

      desc "Compile and optimize #{name}"
      task task_name => name
      
      Rake::Task[task_name].out = name
    end
  end
    
  class AddDependencies < BaseJs
    def handle(fun, dir, args)
      task = Rake::Task[js_name(dir, args[:name])]
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])
    end
  end
 
  class AddTestDependencies < BaseJs
    def handle(fun, dir, args) 
      task = Rake::Task[js_name(dir, args[:name])]
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])

      task.enhance [ "//jsapi:test:uber" ]
    end
  end

  class TouchOutput < BaseJs
    def handle(fun, dir, args)
      output = js_name(dir, args[:name])
      
      file output do
        t = Rake::Task[task_name(dir, args[:name])]
        
        js_files = build_deps(output, Rake::Task[output], []).uniq
        
        mkdir_p File.dirname(output)
        f = File.new(output, 'w')
        f.close
      end
    end
  end
  
  class Compile < BaseJs
    def handle(fun, dir, args)
      output = js_name(dir, args[:name])
      
      file output do
        puts "Compiling: #{task_name(dir, args[:name])} as #{output}"
        
        t = Rake::Task[task_name(dir, args[:name])]

        puts "Building deps"
        js_files = build_deps(output, Rake::Task[output], []).uniq
        
        dirs = {} 
        js_files.each do |js|
          dirs[File.dirname(js)] = 1 
        end
        dirs = dirs.keys

        cmd = calcdeps <<
           " -o compiled " <<
           '-f "--third_party=true" ' <<
           '-f "--formatting=PRETTY_PRINT" ' <<
           "-f \"--js_output_file=#{output}\" " <<
           "-i " <<
           js_files.join(" -i ") <<
           " -p third_party/closure/goog -p " <<
           dirs.join(" -p ")

        mkdir_p File.dirname(output)

        execute cmd
      end
    end    
  end

  class CompileFragment < BaseJs
    def handle(fun, dir, args)
      output = js_name(dir, args[:name])

      file output do
        puts "Compiling: #{task_name(dir, args[:name])} as #{output}"

        temp = "#{output}.tmp.js"

        mkdir_p File.dirname(output)
        js_files = build_deps(output, Rake::Task[output], []).uniq

        rm_f "#{output}.tmp"

        File.open(temp, "w") do |file|
          file << "goog.require('#{args[:module]}'); goog.exportSymbol('#{args[:name]}', #{args[:function]});"
        end

        # TODO(simon): Don't hard code things. That's Not Smart
        cmd =  calcdeps <<
            "-o compiled " <<
            "-f \"--third_party=true\" " <<
            "-f \"--js_output_file=#{output}\" " <<
            "-f \"--compilation_level=ADVANCED_OPTIMIZATIONS\" " <<
            "-p third_party/closure/goog/ " <<
            "-p common/src/js " <<
            "-i #{temp}"

        mkdir_p File.dirname(output)
        
        execute cmd

        rm_f temp

        # Strip out the license comments.
        result = IO.read(output)
        result = result.gsub(/\/\*.*?\*\//m, '')
        File.open(output, 'w') do |f| f.write(result); end
      end
    end
  end
end
