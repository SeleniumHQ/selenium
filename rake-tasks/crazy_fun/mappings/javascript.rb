require 'open3'
require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/crazy_fun/mappings/java'

class JavascriptMappings
  def add_all(fun)
    fun.add_mapping("js_deps", Javascript::CheckPreconditions.new)
    fun.add_mapping("js_deps", Javascript::CreateTask.new)
    fun.add_mapping("js_deps", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_deps", Javascript::AddDependencies.new)
    fun.add_mapping("js_deps", Javascript::WriteOutput.new)
    fun.add_mapping("js_deps", Javascript::CreateHeader.new)
    
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
    fun.add_mapping("js_fragment", Javascript::CreateHeader.new)

    # Compiles a list of |js_fragments| into a C++ header file.
    # Arguments:
    #   name - A unique name for the build target.
    #   srcs - A list of js_fragment dependencies that should be compiled.
    fun.add_mapping("js_fragment_header", Javascript::CheckFragmentPreconditions.new)
    fun.add_mapping("js_fragment_header", Javascript::CreateTask.new)
    fun.add_mapping("js_fragment_header", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_fragment_header", Javascript::AddDependencies.new)
    fun.add_mapping("js_fragment_header", Javascript::ConcatenateHeaders.new)
  end
end

module Javascript
  # CrazyFunJava.ant.taskdef :name      => "jscomp",
  #                          :classname => "com.google.javascript.jscomp.ant.CompileTask",
  #                          :classpath => "third_party/closure/bin/compiler-20100616.jar"

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

      Platform.path_for js
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
  
  class CheckFragmentPreconditions
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":deps must be set" if args[:deps].nil?
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

  class WriteOutput < BaseJs
    def handle(fun, dir, args)
      output = js_name(dir, args[:name])
      
      file output do
        t = Rake::Task[task_name(dir, args[:name])]
        
        js_files = build_deps(output, Rake::Task[output], []).uniq
        
        mkdir_p File.dirname(output)
        File.open(output, 'w') do |f|
          js_files.each do |dep|
            f << IO.read(dep)
          end
        end
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

        cmd = calcdeps +
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
          file << "goog.require('#{args[:module]}'); goog.exportSymbol('_', #{args[:function]});"
        end

        # Naming convention is CamelCase, not snake_case
        name = args[:name].gsub(/_(.)/) {|match| $1.upcase}
        wrapper = "function(){%output%; return _.apply(null,arguments);}"

        # TODO(simon): Don't hard code things. That's Not Smart
        cmd = calcdeps +
            "-o compiled " <<
            "-f \"--create_name_map_files=true\" " <<
            "-f \"--third_party=true\" " <<
            "-f \"--js_output_file=#{output}\" " <<
            "-f \"--output_wrapper='#{wrapper}'\" " <<
            "-f \"--compilation_level=ADVANCED_OPTIMIZATIONS\" " <<
            "-p third_party/closure/goog/ " <<
            "-p common/src/js " <<
            "-p iphone/src/js " <<
            "-i #{temp} "

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

  class GenerateHeader < BaseJs

    MAX_LINE_LENGTH = 80
    MAX_STR_LENGTH = MAX_LINE_LENGTH - "    L\"\",\n".length

    def write_atom_string_literal(to_file, dir, atom)
      # Check that the |atom| task actually generates a JavaScript file.
      atom_task = task_name(dir, atom)
      atom_file = Rake::Task[atom_task].out
      raise StandardError,
          "#{atom_file} is not a JavaScript file" unless atom_file =~ /\.js$/

      # Convert camelCase and snake_case to BIG_SNAKE_CASE
      uc = File.basename(atom_file).sub(/\.js$/, '')
      uc.gsub!(/(.)([A-Z][a-z]+)/, '\1_\2')
      uc.gsub!(/([a-z0-9])([A-Z])/, '\1_\2')
      atom_upper = uc.upcase

      # Each fragment file should be small (<= 20KB), so just read it all in.
      contents = IO.read(atom_file).strip

      # Escape the contents of the file so it can be stored as a literal.
      contents.gsub!(/\\/, "\\\\\\")
      contents.gsub!(/\t/, "\\t")
      contents.gsub!(/\n/, "\\n")
      contents.gsub!(/\f/, "\\f")
      contents.gsub!(/\r/, "\\r")
      contents.gsub!(/"/, "\\\"")
      contents.gsub!(/'/, "'")

      to_file << "\n"
      to_file << "const wchar_t* const #{atom_upper}[] = {\n"

      # Make the header file play nicely in a terminal: limit lines to 80
      # characters, but make sure we don't cut off a line in the middle
      # of an escape sequence.
      while contents.length > MAX_STR_LENGTH do
        diff = MAX_STR_LENGTH
        diff -= 1 while contents[diff-1, 1] =~ /\\/

        line = contents[0, diff]
        contents.slice!(0..diff - 1)
        to_file << "    L\"#{line}\",\n"
      end

      to_file << "    L\"#{contents}\",\n" if contents.length > 0
      to_file << "    NULL\n"
      to_file << "};\n"
    end

    def generate_header(dir, name, task_name, output, js_files)
      file output => js_files do
        puts "Preparing: #{task_name} as #{output}"
        define_guard = "#{name.upcase}_H__"

        output_dir = File.dirname(output)
        mkdir_p output_dir unless File.exists?(output_dir)

        File.open(output, 'w') do |out|
          out << "/* AUTO GENERATED - DO NOT EDIT BY HAND */\n"
          out << "#ifndef #{define_guard}\n"
          out << "#define #{define_guard}\n"
          out << "\n"
          out << "#include <stddef.h>  // For wchar_t.\n"
          out << "\n"
          out << "namespace webdriver {\n"

          js_files.each do |js_file|
            write_atom_string_literal(out, dir, js_file)
          end

          out << "}\n"
          out << "#endif  // #{define_guard}\n"
        end
      end
    end
  end

  # TODO(jleyba): Update this to use GenerateHeader
  class CreateHeader < BaseJs
    def handle(fun, dir, args)
       js = js_name(dir, args[:name])
       out = js.sub(/\.js$/, '.h')
       task_name = task_name(dir, args[:name]) + ":header"

       file out => [js] do
         puts "Preparing: #{task_name} as #{out}"

         upper = args[:name].upcase
         mkdir_p File.dirname(out)

         File.open(js, "r") do |from|
           File.open(out, "w") do |to|
             to << "/* AUTO GENERATED - Do not edit by hand. */\n"
             to << "/* See rake-tasks/crazy_fun/mappings/javascript.rb for generator. */\n\n"
             to << "#ifndef #{upper}_H\n"
             to << "#define #{upper}_H\n\n"
             to << "const wchar_t* #{upper}[] = {\n"

             while line = from.gets
               converted = line.chomp.gsub(/\\/, "\\\\\\").gsub(/"/, "\\\"")
               to << "L\"#{converted}\",\n"
             end

             to << "NULL\n"
             to << "};\n\n"
             to << "#endif\n"
           end
         end
       end

       task task_name => [out]

       Rake::Task[out].out = out
       Rake::Task[task_name].out = out
    end
  end

  class ConcatenateHeaders < GenerateHeader
    def handle(fun, dir, args)
      js = js_name(dir, args[:name])
      output = js.sub(/\.js$/, '.h')
      task_name = task_name(dir, args[:name])
      generate_header(dir, args[:name], task_name, output, args[:deps])
      task task_name => [output]
    end
  end
end
