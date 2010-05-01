
require 'rake-tasks/crazy_fun/mappings/common'

class JavascriptMappings
  def add_all(fun)
    fun.add_mapping("js_library", Javascript::CheckPreconditions.new)
    fun.add_mapping("js_library", Javascript::CreateTask.new)
    fun.add_mapping("js_library", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_library", Javascript::AddDependencies.new)
    fun.add_mapping("js_library", Javascript::Concatenate.new)
    
    fun.add_mapping("closure_binary", Javascript::CheckPreconditions.new)
    fun.add_mapping("closure_binary", Javascript::CreateTask.new)
    fun.add_mapping("closure_binary", Javascript::CreateTaskShortName.new)
    fun.add_mapping("closure_binary", Javascript::AddDependencies.new)
    fun.add_mapping("closure_binary", Javascript::Compile.new)
  end
end

module Javascript
  class BaseJs < Tasks
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
      if args[:deps].nil? && args[:srcs].nil?
        return
      end
      
      task = Rake::Task[js_name(dir, args[:name])]
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])
    end
  end
  
  class Concatenate < BaseJs
    def handle(fun, dir, args)
      # Cat all the deps together
      output = js_name(dir, args[:name])
      
      file output do
        puts "Concatenating: #{task_name(dir, args[:name])} as #{output}"
        
        t = Rake::Task[task_name(dir, args[:name])]
        
        js_files = build_deps(output, Rake::Task[output], []).uniq
        
        mkdir_p File.dirname(output)
        f = File.new(output, 'w')
        js_files.each do |js|
          f << IO.read(js)
        end
        
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
        
        js_files = build_deps(output, Rake::Task[output], []).uniq
        
        dirs = {} 
        js_files.each do |js|
          dirs[File.dirname(js)] = 1 
        end
        dirs = dirs.keys

        cmd = "java -jar third_party/py/jython.jar "
        cmd << "third_party/closure/bin/calcdeps.py -c third_party/closure/bin/compiler-2009-12-17.jar "
        cmd << "-o compiled "
        cmd << '-f "--third_party=true" '
#        cmd << '-f "--compilation_level=WHITESPACE_ONLY" '
        cmd << '-f "--formatting=PRETTY_PRINT" '
        cmd << "-f \"--js_output_file=#{output}\" "
        cmd << "-i "
        cmd << js_files.join(" -i ")
        cmd << " -p third_party/closure/goog -p "
        cmd << dirs.join(" -p ")

        mkdir_p File.dirname(output)
        sh cmd
      end
    end    
  end
end
