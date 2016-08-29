require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/crazy_fun/mappings/java'
require 'pathname'
require 'set'

class JavascriptMappings
  def add_all(fun)
    # Generates a JavaScript library.
    #
    # Arguments:
    #   name: The name of the library.
    #   srcs: A list of .js files in this library.
    #   deps: A list of dependent js_library targets.
    #
    # Outputs:
    #   $name.mf: A manifest with each of the sources contained in this
    #       library listed on a separate line
    fun.add_mapping("js_library", Javascript::CheckPreconditions.new)
    fun.add_mapping("js_library", Javascript::CreateLibrary.new)
    fun.add_mapping("js_library", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_library", Javascript::CreateHeader.new)

    # Runs the Closure compiler over a set of JavaScript files, producing a
    # single, (optionally) minified file.
    #
    # Arguments:
    #   name: The name of the binary.
    #   srcs: A list of JavaScript files to include in the binary.
    #   deps: A list of js_library or js_deps targets to include in the binary.
    #       The transitive closure of all files listed in these targets will
    #       be included.
    #   defines: A list of symbols to define with the compiler. Each symbol
    #       should be of the form "$key=$value" and is equivalent to including
    #       the flag "--define=$key=$value".
    #   externs: A list of files to include as externs.
    #   flags: A list of flags to pass to the Closure compiler.
    #   no_format: If specified, the output will not be pretty printed (the
    #       value of this argument is irrelevant). If not specified, the
    #       binary will be compiled using the flag "--formatting=PRETTY_PRINT".
    #
    # Outputs:
    #   $name.js: The generated file.
    fun.add_mapping("js_binary", Javascript::CheckPreconditions.new)
    fun.add_mapping("js_binary", Javascript::CreateTask.new)
    fun.add_mapping("js_binary", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_binary", Javascript::AddDependencies.new)
    fun.add_mapping("js_binary", Javascript::Compile.new)

    #
    # Arguments:
    #   name: A unique name for this module.
    #   deps: A list of dependent js_module or js_library targets.
    fun.add_mapping("js_module", Javascript::CheckPreconditions.new)
    fun.add_mapping("js_module", Javascript::CheckModuleDeps.new)

    # Runs the Closure compiler over a set of JavaScript files, producing a
    # set of interconnected module files.
    #
    # Arguments:
    #   name: The base name of the binary. This will be used as a common prefix
    #       for the generated modules.
    #   modules: A list of dependent js_module targets.
    #   defines: A list of symbols to define with the compiler. Each symbol
    #       should be of the form "$key=$value" and is equivalent to including
    #       the flag "--define=$key=$value".
    #   externs: A list of files to include as externs.
    #   flags: A list of flags to pass to the Closure compiler.
    #   no_format: If specified, the output will not be pretty printed (the
    #       value of this argument is irrelevant). If not specified, the
    #       binary will be compiled using the flag "--formatting=PRETTY_PRINT".
    #
    # Outputs:
    #   A compiled file for each js_module dependency. Each output file will
    #   be named $name_$module.js, where $name is the |name| of this target,
    #   and $module is the |name| of the dependent js_module.
    fun.add_mapping("js_module_binary", Javascript::CompileModules.new)

    # Runs the Closure compiler over a set of JavaScript files to produce a
    # single script which can be easily injected into any page.
    #
    # Arguments:
    #   name: The name of the fragment.
    #   module: The name of the Closure module the main function is defined in.
    #   function: Fully qualified name of the main function.
    #   deps: A list of js_library or js_deps rules that this fragment depends
    #       on.
    #
    # Outputs:
    #   $name_exports.js: A file that exports main function to the global scope.
    #   $name.js: The generated file.
    fun.add_mapping("js_fragment", Javascript::CheckFragmentPreconditions.new)
    fun.add_mapping("js_fragment", Javascript::CreateTask.new)
    fun.add_mapping("js_fragment", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_fragment", Javascript::CreateExportFile.new)
    fun.add_mapping("js_fragment", Javascript::CompileFragment.new)
    fun.add_mapping("js_fragment", Javascript::CompileFragment.new('android', [
        'goog.userAgent.ASSUME_MOBILE_WEBKIT=true',
        'goog.userAgent.product.ASSUME_ANDROID=true',
    ]))
    fun.add_mapping("js_fragment", Javascript::CompileFragment.new('chrome', [
        'goog.userAgent.ASSUME_WEBKIT=true',
        'goog.userAgent.product.ASSUME_CHROME=true',
    ]))
    fun.add_mapping("js_fragment", Javascript::CompileFragment.new('firefox', [
        'goog.userAgent.ASSUME_GECKO=true',
        'goog.userAgent.product.ASSUME_FIREFOX=true',
    ]))
    fun.add_mapping("js_fragment", Javascript::CompileFragment.new('ie', [
        'goog.userAgent.ASSUME_IE=true',
    ]))
    fun.add_mapping("js_fragment", Javascript::CompileFragment.new('ios', [
        # We use the same fragments for iPad and iPhone, so just compile a
        # generic mobile webkit.
        'goog.userAgent.ASSUME_MOBILE_WEBKIT=true',
    ]))

    # Compiles a list of |js_fragments| into a C++ header file.
    # Arguments:
    #   name - A unique name for the build target.
    #   deps - A list of js_fragment dependencies that should be compiled.
    #   utf8 - Whether to use char or wchar_t for the generated header. Defaults
    #          to wchar_t.
    fun.add_mapping("js_fragment_header", Javascript::CheckFragmentHeaderPreconditions.new)
    fun.add_mapping("js_fragment_header", Javascript::CreateTask.new)
    fun.add_mapping("js_fragment_header", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_fragment_header", Javascript::AddDependencies.new)
    fun.add_mapping("js_fragment_header", Javascript::ConcatenateHeaders.new)
    fun.add_mapping("js_fragment_header", Javascript::CopyHeader.new)

    # Compiles a list of |js_fragments| into a C++ source and header file.
    # Arguments:
    #   name - A unique name for the build target.
    #   deps - A list of js_fragment_dependencies that should be compiled.
    #   extension - A string to use as the C++ source file's extension.
    #   utf8 - Whether to use char or wchar_t for the generated header. Defaults
    #          to wchar_t.
    fun.add_mapping("js_fragment_cpp", Javascript::CheckFragmentHeaderPreconditions.new)
    fun.add_mapping("js_fragment_cpp", Javascript::CreateTask.new)
    fun.add_mapping("js_fragment_cpp", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_fragment_cpp", Javascript::AddDependencies.new)
    fun.add_mapping("js_fragment_cpp", Javascript::ConcatenateCpp.new)
    fun.add_mapping("js_fragment_cpp", Javascript::CopyHeader.new)
    fun.add_mapping("js_fragment_cpp", Javascript::CopySource.new)

    # Compiles a list of |js_fragments| into a Java class with each fragment
    # defined as a string constant.
    #
    # Arguments:
    #   name: The name of target. Will be used as the generated class name.
    #   deps: A list of |js_fragment| files the target depends on.
    #   utf: Whether to output using UTF8.
    #   package: The package the generated class should belong to.
    # Outputs:
    #   The generated java file.
    fun.add_mapping("js_fragment_java", Javascript::CreateTask.new)
    fun.add_mapping("js_fragment_java", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_fragment_java", Javascript::AddDependencies.new)
    fun.add_mapping("js_fragment_java", Javascript::ConcatenateJava.new)

    # Compiles a list of |js_fragments| into a static C# class with each fragment
    # defined as a static readonly string.
    #
    # Arguments:
    #   name: The name of target. Will be used as the generated class name.
    #   deps: A list of |js_fragment| files the target depends on.
    #   utf: Whether to output using UTF8.
    #   package: The package the generated class should belong to.
    # Outputs:
    #   The generated java file.
    fun.add_mapping("js_fragment_csharp", Javascript::CreateTask.new)
    fun.add_mapping("js_fragment_csharp", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_fragment_csharp", Javascript::AddDependencies.new)
    fun.add_mapping("js_fragment_csharp", Javascript::ConcatenateCSharp.new)

    # Executes JavaScript tests in the browser.
    #
    # Arguments:
    #  srcs: List of test files.
    #  path: Path, relative to the client root, that the test files can be
    #      located.
    #  deps: A list of test dependencies.
    fun.add_mapping("js_test", Javascript::CheckPreconditions.new)
    fun.add_mapping("js_test", Javascript::CreateTask.new)
    fun.add_mapping("js_test", Javascript::CreateTaskShortName.new)
    fun.add_mapping("js_test", Javascript::AddDependencies.new)
    fun.add_mapping("js_test", Javascript::RunTests.new)

    fun.add_mapping("node_module", Javascript::CheckPreconditions.new)
    fun.add_mapping("node_module", Javascript::Node::CreateTask.new)
    fun.add_mapping("node_module", Javascript::CreateTaskShortName.new)
    fun.add_mapping("node_module", Javascript::Node::GenerateModule.new)
  end
end

module Javascript
  # CrazyFunJava.ant.taskdef :name      => "jscomp",
  #                          :classname => "com.google.javascript.jscomp.ant.CompileTask",
  #                          :classpath => "third_party/closure/bin/compiler-20130603.jar"

  class ClosureDeps

    # Describes the dependency info for a single file.
    class Info
      attr_accessor :file       # Absolute path to the file.
      attr_accessor :provides   # Symbols provided by this file.
      attr_accessor :requires   # Symbols required by this file.
      attr_accessor :is_module  # Whether this file defines a Closure module.

      def initialize(file)
        @file = File.expand_path(file)
        @provides = []
        @requires = []
        @is_module = false
      end
    end

    def initialize()
      @closure_dir = File.expand_path("third_party/closure/goog")
      @files = {}
      @provided = {}

      parse_deps(File.join(@closure_dir, "deps.js"))
    end

    def parse_deps(file)
      file = File.expand_path(file)

      # Check the global cache if we've already parsed this file.
      if @@DEPS_FILES[file]
        @@DEPS_FILES[file].each do |info|
          info.provides.each{|p| record_provider(p, info)}
        end
        return
      end

      @@DEPS_FILES[file] = []
      IO.read(file).each_line do |line|
        if data = @@ADD_DEP_REGEX.match(line)
          info = Info.new(File.expand_path(data[1], @closure_dir))
          info.is_module = data[4] == "true"
          @@DEPS_FILES[file].push(info)
          @@FILES[file] = info

          if data[2]
            info.provides = data[2].scan(/['"]([^'"]+)['"]/).collect do |m|
              record_provider(m[0], info)
              m[0]
            end
          end

          if data[3]
            info.requires = data[3].scan(/['"]([^'"]+)['"]/).collect{|m| m[0]}
          end
        end
      end
    end

    def parse_file(file)
      file = File.expand_path(file)

      # Check the global cache if we've already parsed this file.
      if @@FILES[file]
        info = @files[file] = @@FILES[file]
        info.provides.each{|p| record_provider(p, info)}
        return
      end

      info = Info.new(file)
      @@FILES[file] = @files[file] = info

      IO.read(file).each_line do |line|
        if data = @@MODULE_REGEX.match(line)
          info.provides.push(data[1])
          info.is_module = true
          record_provider(data[1], info)
        elsif data = @@PROVIDE_REGEX.match(line)
          info.provides.push(data[1])
          record_provider(data[1], info)
        elsif data = @@REQUIRE_REGEX.match(line)
          info.requires.push(data[1])
        end
      end
    end

    def write_deps(file)
      @files.each do |_, info|
        info.requires.each do |symbol|
          if !@provided[symbol]
            raise StandardError, "Missing provider for #{symbol}, required in #{info.file}"
          end
        end
      end

      File.open(file, "w") do |f|
        f.write("// This file was auto-generated. Do not edit\n")
        @files.each do |_, info|
          relative_path = Pathname.new(info.file).relative_path_from(Pathname.new(@closure_dir))

          f.write("goog.addDependency('#{relative_path}', [")
          if info.provides.length > 0
            f.write "'#{info.provides.join("', '")}'"
          end
          f.write("], [")
          if info.requires.length > 0
            f.write("'#{info.requires.join("', '")}'")
          end
          f.write("], #{info.is_module});\n")
        end
      end
    end

    def calc_deps(files)

      def resolve_deps(file, symbol, result_list, seen_list)
        if !@provided[symbol]
          raise StandardError, "Missing provider for #{symbol}, required in #{file}"
        end

        dep = @provided[symbol]
        if seen_list.index(dep.file) == nil
          seen_list.push(dep.file)
          dep.requires.each{|r| resolve_deps(dep.file, r, result_list, seen_list)}
          result_list.push(dep.file)
        end
      end

      result_list = [File.join(@closure_dir, "base.js")]
      seen_list = []
      files.each do |file|
        file = File.expand_path(file)
        parse_file(file)
        info = @files[file]

        seen_list.push(file)
        info.requires.each do |symbol|
          resolve_deps(file, symbol, result_list, seen_list)
        end
        result_list.push(file)
      end

      result_list.uniq
    end

    private
    @@ADD_DEP_REGEX = Regexp.new [
        "^goog.addDependency\\s*\\(\\s*",
        "['\"]([^'\"]+)['\"]",     # Relative path from Closure's base.js
        "\\s*,\\s*",
        "\\[([^\\]]+)?\\]",        # Provided symbols
        "\\s*,\\s*",
        "\\[([^\\]]+)?\\]",        # Required symbols
        "\\s*",
        "(?:,\\s*(true|false))?",  # Module flag.
        "\\s*\\)"
    ].each {|r| r.to_s}.join('')
    @@MODULE_REGEX = /^goog\.module\s*\(\s*['"]([^'"]+)['"]\s*\)/
    @@PROVIDE_REGEX = /^goog\.provide\s*\(\s*['"]([^'"]+)['"]\s*\)/
    # goog.require statement may have a LHS assignment if inside a goog.module
    # file. This is a simplified version of:
    # https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/deps/JsFileParser.java#L41
    @@REQUIRE_REGEX = /^\s*(?:(?:var|let|const)\s+[a-zA-Z_$][a-zA-Z0-9$_]*\s*=\s*)?goog\.require\s*\(\s*['"]([^'"]+)['"]\s*\)/

    # Global cache used to avoid parsing files multiple times. The parsed
    # information is copied into the individual instance's local graph so we
    # can still detect when a rule has invalid inputs.

    # Maps file name to an Info object for each parsed file.
    @@FILES = {}

    # Contains dependency info parsed from a Closurere deps.js file. Maps file
    # name to an array of Info objects for each described file.
    @@DEPS_FILES = {}

    def record_provider(symbol, info)
      if provider = @provided[symbol]
        return if provider.file == info.file
        raise StandardError, "Duplicate provide for #{symbol} in #{info.file}, first seen in #{provider.file}"
      end
      @provided[symbol] = info
    end

  end

  class BaseJs < Tasks

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
      output = `#{cmd} 2>&1`
      failed = !$?.success? || output =~ /ERROR/

      if ENV['log'] == 'true' || failed
        puts output
      end

      exit(2) if failed
    end

    def calc_deps(src_files, js_files)
      deps = ClosureDeps.new
      js_files.each {|f| deps.parse_file(f)}
      deps.calc_deps(src_files).uniq
    end

    private
  end

  class CheckPreconditions
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":srcs must be set" if args[:srcs].nil? and args[:deps].nil?
    end
  end

  class CheckFragmentPreconditions
    def handle(fun, dir, args)
      CheckPreconditions.new.handle(fun, dir, args)
      raise StandardError, ":module must be set" if args[:module].nil?
      raise StandardError, ":function must be set" if args[:function].nil?
    end
  end

  class CheckFragmentHeaderPreconditions
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

      task "#{task_name}.js" => task_name

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

  class CreateLibrary < BaseJs
    def manifest_name(dir, name)
      name = task_name(dir, name)
      mf = "build/" + (name.slice(2 ... name.length))
      mf = mf.sub(":", "/")
      mf << ".mf"

      Platform.path_for mf
    end

    def handle(fun, dir, args)
      manifest = manifest_name(dir, args[:name])
      task_name = task_name(dir, args[:name])

      file manifest
      task task_name => manifest

      task = Rake::Task[task_name]
      task.out = manifest

      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])

      file manifest do
        mkdir_p File.dirname(manifest)
        File.open(manifest, "w") do |file|
          task.prerequisites.each do |prereq|
            file << "#{prereq}\n"
          end
        end
      end

      # Generate build/{$task_name}.js, which concatenates the transitive
      # closure of js files in this library. Files are added to output in the
      # order declared in build.desc.
      # This is an implicit output not linked to the main task.
      jslib = js_name(dir, args[:name])
      file jslib do
        js_files = build_deps(jslib, Rake::Task[jslib], []).uniq

        mkdir_p File.dirname(jslib)
        File.open(jslib, 'w') do |f|
          js_files.each do |dep|
            f << IO.read(dep)
          end
        end
      end
      add_dependencies(Rake::Task[jslib], dir, args[:deps])
      add_dependencies(Rake::Task[jslib], dir, args[:srcs])
    end
  end

  class Compile < BaseJs
    def handle(fun, dir, args)
      output = js_name(dir, args[:name])

      file output do
        puts "Compiling: #{task_name(dir, args[:name])} as #{output}"

        t = Rake::Task[task_name(dir, args[:name])]

        js_files = build_deps(output, Rake::Task[output], []).uniq

        all_srcs = args[:srcs].nil? ? js_files : args[:srcs].collect{|src| Dir[File.join(dir, src)]}
        all_srcs = all_srcs.flatten.collect{|src| File.expand_path(src)}
        all_deps = calc_deps(all_srcs.flatten, js_files)

        flags = args[:flags] || []

        declared = args[:defines] || [];
        flags += declared.collect {|d| "--define=#{d}"}

        formatting = !args[:no_format].nil? ? "" : '--formatting=PRETTY_PRINT'
        flags.push(formatting)

        flags.push("--js_output_file=#{output}")

        cmd = "" <<
           flags.join(" ") <<
           " --js='" <<
           all_deps.join("' --js='") << "'"

        if (args[:externs])
          args[:externs].each do |extern|
            cmd << " --externs=#{File.join(dir, extern)} "
          end
        end

        mkdir_p File.dirname(output)

        CrazyFunJava.ant.java :classname => "com.google.javascript.jscomp.CommandLineRunner", :failonerror => true do
          classpath do
            pathelement :path =>  "third_party/closure/bin/compiler.jar"
          end
          arg :line => cmd
        end
      end
    end
  end

  class JsModule < BaseJs
    # Hash of module task name to module info hash:
    #   :name - module name
    #   :srcs - list of raw srcs in the module
    #   :deps - list of transitive dependencies
    #   :module_deps - list of dependent modules
    @@MODULE_INFO = {}
  end

  class CheckModuleDeps < JsModule
    def handle(fun, dir, args)
      module_name = task_name(dir, args[:name])
      task module_name do
        raise StandardError, ":name must be set" if args[:name].nil?
        raise StandardError, ":srcs must be set" if args[:srcs].nil?

        puts "Checking dependencies for: #{module_name}"

        task = Rake::Task[module_name]
        deps = build_deps(task, task, []).uniq.collect{|dep| File.expand_path(dep)}

        srcs = args[:srcs].collect{|src| Dir[File.join(dir, src)]}
        srcs = srcs.flatten.collect{|src| File.expand_path(src)}

        module_deps = args[:module_deps] || []
        module_deps = module_deps.collect{|mod| task_name(dir, mod)}

        @@MODULE_INFO[module_name] = {
            :name => module_name.to_s.sub(/.*(:|\/)/, ""),
            :srcs => srcs,
            :deps => calc_deps(srcs, deps),
            :module_deps => module_deps
        }

        # If we get here without errors, all module dependencies are present.
      end

      task = Rake::Task[module_name]
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:module_deps])
      add_dependencies(task, dir, args[:srcs])
    end
  end

  class CompileModules < JsModule
    def check_preconditions(args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":modules must be set" if args[:modules].nil?
    end

    def declare_task(dir, args)
      task_name = task_name(dir, args[:name])
      folder = "build/#{dir}/#{args[:name]}"

      desc "Compile and optimize modules in #{folder}"
      task task_name

      task = Rake::Task[task_name]
      task.out = folder
      add_dependencies(task, dir, args[:modules])
    end

    def resolve_module_deps(name, result_list, seen_list)
      if !@@MODULE_INFO[name]
        raise StandardError, "Unable to find js_module #{name}"
      end

      dep = @@MODULE_INFO[name]
      if seen_list.index(dep) == nil
        seen_list.push(dep)
        dep[:module_deps].each do |sub_dep|
          resolve_module_deps(sub_dep, result_list, seen_list)
        end
        result_list.push(dep)
      end
    end

    def collect_module_info(dir, modules)
      modules.collect! do |mod|
        name = task_name(dir, mod)
        if name.index(/.*:\w+$/).nil?
          name = "#{name}:#{name.sub(/.*\//, "")}"
        end

        info = @@MODULE_INFO[name]
        raise StandardError, "Unable to find js_module #{name}" if info.nil?
        info
      end

      #modules.sort! do |x, y|
      #  x[:deps].count <=> y[:deps].count
      #end
      #
      result_list = []
      seen_list = []
      modules.each do |info|
        seen_list.push(info)
        info[:module_deps].each do |dep|
          resolve_module_deps(dep, result_list, seen_list)
        end
        result_list.push(info)
      end
      result_list.uniq!
      raise StandardError, "Unable to identify root module" unless
          result_list[0][:module_deps].empty?
      result_list
    end

    def handle(fun, dir, args)
      check_preconditions(args)
      declare_task(dir, args)

      task_name = task_name(dir, args[:name])
      task task_name do
        folder = "build/#{dir}/#{args[:name]}"

        puts "Preparing: #{task_name} as #{folder}"

        module_info = collect_module_info(dir, args[:modules])
        srcs = (args[:srcs] || []).collect do |src|
          File.expand_path(File.join(dir, src))
        end
        deps = []
        module_info.each do |info|
          srcs.concat(info[:srcs])
          deps.concat(info[:deps])
        end
        srcs.uniq!
        deps.uniq!

        js_files = calc_deps(srcs, deps)

        flags = args[:flags] || []
        flags.push("--module_output_path_prefix='#{folder}/#{args[:name]}_'")

        num_files = 0
        module_info.each do |info|
          indices = info[:srcs].collect do |src|
            js_files.index(src)
          end
          module_file_count = (indices.max + 1) - num_files
          module_deps = info[:module_deps].collect do |dep|
            @@MODULE_INFO[dep][:name]
          end
          module_deps = module_deps.empty? ? "" : ":#{module_deps.join(",")}"
          flags.push("--module=#{info[:name]}:#{module_file_count}#{module_deps}")
          num_files += module_file_count
        end

        js_files.each do |file|
          flags.push("--js=\"#{file}\"")
        end

        (args[:externs] || []).each do |file|
          flags.push("--externs=\"#{File.expand_path(File.join(dir, file))}\"")
        end

        mkdir_p Platform.path_for folder

        CrazyFunJava.ant.java :classname => "com.google.javascript.jscomp.CommandLineRunner", :failonerror => true do
          classpath do
            pathelement :path =>  "third_party/closure/bin/compiler.jar"
          end
          arg :line => flags.join(" ")
        end
      end
    end
  end

  class BaseCompileFragment < BaseJs
    def exports_name(dir, name)
      js_name(dir, name).sub(/\.js$/, "_exports.js")
    end
  end

  class CreateExportFile < BaseCompileFragment
    def handle(fun, dir, args)
      name = exports_name(dir, args[:name])

      file name do
        puts "Generating export file for #{args[:function]} at #{name}"
        mkdir_p File.dirname(name)
        File.open(name, "w") do |file|
          file << "goog.require('#{args[:module]}'); goog.exportSymbol('_', #{args[:function]});"
        end
      end

      task = Rake::Task[name]
      add_dependencies(task, dir, args[:deps])
    end
  end

  class CompileFragment < BaseCompileFragment
    def initialize(target_platform=nil, defines=nil)
      super()
      if !target_platform.nil? && defines.nil?
        raise StandardError,
          "Fragment platform target #{target_platform} does not have any goog.defines!"
      end
      @target_platform=target_platform
      @defines=defines
    end

    def handle(fun, dir, args)
      exports = exports_name(dir, args[:name])
      output = js_name(dir, args[:name])
      name = task_name(dir, args[:name])
      defines = ""
      minify = args[:minify]

      if !@target_platform.nil?
        output = output.sub(/\.js$/, "_#{@target_platform}.js")
        name += ":#{@target_platform}"
        defines = @defines.collect {|d| "--define=#{d} "}
        defines = defines.join
      end

      file output => [exports] do
        puts "Compiling #{name} as #{output}"

        js_files = build_deps(output, Rake::Task[output], []).uniq

        # Always load closure's deps.js first to "forward declare" all of the
        # Closure types. This prevents type errors when a symbol is referenced
        # in a file's type annotation, but not actually needed in the compiled
        # output.
        all_deps = [File.expand_path('third_party/closure/goog/deps.js')]
        all_deps += calc_deps(exports, js_files)

        # Wrap the output in two functions. The outer function ensures the
        # compiled fragment never pollutes the global scope by using its
        # own scope on each invocation. We must import window.navigator into
        # this unique scope since Closure's goog.userAgent package assumes
        # navigator and document are defined on goog.global. Normally, this
        # would be window, but we are explicitly defining the fragment so that
        # goog.global is _not_ window.
        #     See http://code.google.com/p/selenium/issues/detail?id=1333
        wrapper = "function(){%output%; return this._.apply(null,arguments);}"
        wrapper = "function(){return #{wrapper}.apply({" +
                  "navigator:typeof window!='undefined'?window.navigator:null," +
                  "document:typeof window!='undefined'?window.document:null" +
                  "}, arguments);}"

        formatting =
            (ENV['pretty_print'] == 'true') ?  "--formatting=PRETTY_PRINT" : ""

        cmd = "" <<
            "--js_output_file=#{output} " <<
            "--output_wrapper='#{wrapper}' " <<
            "--compilation_level=#{compilation_level(minify)} " <<
            "--define=goog.NATIVE_ARRAY_PROTOTYPES=false " <<
            "--define=bot.json.NATIVE_JSON=false " <<
            "#{defines} " <<
            "#{formatting} " <<
            "--jscomp_off=unknownDefines " <<
            "--jscomp_off=deprecated " <<
            "--jscomp_error=accessControls " <<
            "--jscomp_error=ambiguousFunctionDecl " <<
            "--jscomp_error=checkDebuggerStatement " <<
            "--jscomp_error=checkRegExp " <<
            "--jscomp_error=checkTypes " <<
            "--jscomp_error=checkVars " <<
            "--jscomp_error=const " <<
            "--jscomp_error=constantProperty " <<
            "--jscomp_error=duplicate " <<
            "--jscomp_error=duplicateMessage " <<
            "--jscomp_error=externsValidation " <<
            "--jscomp_error=fileoverviewTags " <<
            "--jscomp_error=globalThis " <<
            "--jscomp_error=internetExplorerChecks " <<
            "--jscomp_error=invalidCasts " <<
            "--jscomp_error=missingProperties " <<
            "--jscomp_error=nonStandardJsDocs " <<
            "--jscomp_error=strictModuleDepCheck " <<
            "--jscomp_error=typeInvalidation " <<
            "--jscomp_error=undefinedNames " <<
            "--jscomp_error=undefinedVars " <<
            "--jscomp_error=uselessCode " <<
            "--jscomp_error=visibility " <<
            "--js='" <<
            all_deps.join("' --js='") << "'"

        mkdir_p File.dirname(output)

        CrazyFunJava.ant.java :classname => "com.google.javascript.jscomp.CommandLineRunner", :fork => false, :failonerror => true do
          classpath do
            pathelement :path =>  "third_party/closure/bin/compiler.jar"
          end
          arg :line => cmd
        end
      end

      output_task = Rake::Task[output]
      add_dependencies(output_task, dir, args[:srcs])
      add_dependencies(output_task, dir, args[:deps])

      desc "Compile and optimize #{output}"
      task name => [output]
      Rake::Task[name].out = output
    end

    def compilation_level(minify)
      to_minify = ENV['minify'] || minify

      to_minify == 'false' ? 'WHITESPACE_ONLY' : 'ADVANCED_OPTIMIZATIONS'
    end
  end

  class GenerateAtoms < BaseJs

    MAX_LINE_LENGTH_CPP = 78
    MAX_LINE_LENGTH_JAVA = 100
    MAX_STR_LENGTH_CPP = MAX_LINE_LENGTH_CPP - "    L\"\"\n".length
    MAX_STR_LENGTH_JAVA = MAX_LINE_LENGTH_JAVA - "       .append\(\"\"\)\n".length
    COPYRIGHT =
          "/*\n" +
          " * Copyright 2011-2014 Software Freedom Conservancy\n" +
          " *\n" +
          " * Licensed under the Apache License, Version 2.0 (the \"License\");\n" +
          " * you may not use this file except in compliance with the License.\n" +
          " * You may obtain a copy of the License at\n" +
          " *\n" +
          " *     http://www.apache.org/licenses/LICENSE-2.0\n" +
          " *\n" +
          " * Unless required by applicable law or agreed to in writing, software\n" +
          " * distributed under the License is distributed on an \"AS IS\" BASIS,\n" +
          " * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n" +
          " * See the License for the specific language governing permissions and\n" +
          " * limitations under the License.\n" +
          " */\n"

    def get_atom_name_from_file(dir, atom_file)
      name = File.basename(atom_file).sub(/\.js$/, '')

      # If this is a browser optimized atom, drop the browser identifier
      # from the name: foo_ie.js => foo.js, bar_android.js => bar.js
      name.sub!(/_(android|chrome|ie|ios)$/, '')

      # Convert camelCase and snake_case to BIG_SNAKE_CASE
      name.gsub!(/(.)([A-Z][a-z]+)/, '\1_\2')
      name.gsub!(/([a-z0-9])([A-Z])/, '\1_\2')
      return name.upcase
    end

    def write_atom_string_literal(to_file, dir, atom, language, utf8 = true)
      # Check that the |atom| task actually generates a JavaScript file.
      if (File.exists?(atom))
        atom_file = atom
      else
        atom_task = task_name(dir, atom)
        atom_file = Rake::Task[atom_task].out
      end

      raise "#{atom_file} is not a JavaScript file" unless atom_file =~ /\.js$/

      puts "Generating header for #{atom_file}"
      atom_name = get_atom_name_from_file(dir, atom_file)

      if language == :csharp
        atom_name = atom_name.split('_').each{|part| part.capitalize!}.join('')
      end

      # Each fragment file should be small (<= 20KB), so just read it all in.
      contents = IO.read(atom_file).strip

      if contents.empty?
        raise "refuse to generate header from empty JavaScript file: #{atom_file.inspect}"
      end

      # Escape the contents of the file so it can be stored as a literal.
      contents.gsub!(/\\/, "\\\\\\")
      contents.gsub!(/\t/, "\\t")
      contents.gsub!(/\n/, "\\n")
      contents.gsub!(/\f/, "\\f")
      contents.gsub!(/\r/, "\\r")
      contents.gsub!(/"/, "\\\"")
      contents.gsub!(/'/, "'")

      atom_type = utf8 ? "char" : "wchar_t"
      max_str_length = language == :cpp ? MAX_STR_LENGTH_CPP : MAX_STR_LENGTH_JAVA
      max_str_length += 1 if utf8

      if language == :cpp
        # Don't need the 'L' on each line for UTF8.
        line_format = utf8 ? "    \"%s\"" : "    L\"%s\""
      elsif language == :java
        line_format = "      .append\(\"%s\"\)"
      elsif language == :csharp
        line_format = "                    atom.Append\(\"%s\"\);"
      end

      to_file << "\n"

      if language == :cpp
        to_file << "const #{atom_type}* const #{atom_name}[] = {\n"
      elsif language == :java
        to_file << "  #{atom_name}(new StringBuilder()\n"
      elsif language == :csharp
        to_file << "        public static string #{atom_name}\n"
        to_file << "        {\n"
        to_file << "            get\n"
        to_file << "            {\n"
        to_file << "                const string atomName = \"#{atom_name}\";\n"
        to_file << "                if (!atomsRepository.ContainsKey(atomName))\n"
        to_file << "                {\n"
        to_file << "                    StringBuilder atom = new StringBuilder();\n"
      end

      # Make the header file play nicely in a terminal: limit lines to 80
      # characters, but make sure we don't cut off a line in the middle
      # of an escape sequence.
      while contents.length > max_str_length do
        diff = max_str_length
        diff -= 1 while contents[diff-1, 1] =~ /\\/

        line = contents[0, diff]
        contents.slice!(0..diff - 1)

        if (language == :java)
          to_file << line_format % line
          to_file << "\n"
        elsif (language == :cpp)
          to_file << line_format % line
          to_file << ",\n"
        elsif (language == :csharp)
          to_file << line_format % line
          to_file << "\n"
        end
      end

      to_file << line_format % contents if contents.length > 0

      if language == :java
        to_file << "\n    .toString()),\n"
      elsif language == :cpp
        to_file << ",\n    NULL\n};\n"
      elsif language == :csharp
        to_file << "\n                    atomsRepository[atomName] = atom.ToString();\n"
        to_file << "                }\n"
        to_file << "\n"
        to_file << "                return atomsRepository[atomName];\n"
        to_file << "            }\n"
        to_file << "        }\n"
      end
    end

    def generate_cpp_source(dir, name, task_name, output, js_files, utf8)
      file output => js_files do
        puts "Preparing: #{task_name} as #{output}"

        output_dir = File.dirname(output)
        mkdir_p output_dir unless File.exists?(output_dir)

        File.open(output, 'w') do |out|
          out << COPYRIGHT
          out << "\n"
          out << "/* AUTO GENERATED - DO NOT EDIT BY HAND */\n"
          out << "\n"
          out << "#include <stddef.h>  // For NULL.\n"
          out << "\n"
          out << "#include \"atoms.h\"\n"
          out << "\n"
          out << "namespace webdriver {\n"
          out << "namespace atoms {\n"

          js_files.each do |js_file|
            write_atom_string_literal(out, dir, js_file, :cpp, utf8)
          end

          out << "\n"
          out << "}  // namespace atoms\n"
          out << "}  // namespace webdriver\n"
          out << "\n"
        end
      end
    end

    def generate_header(dir, name, task_name, output, js_files, just_declare, utf8)
      file output => js_files do
        puts "Preparing: #{task_name} as #{output}"
        define_guard = "WEBDRIVER_#{name.upcase}_H_"
        char_type = utf8 ? "char" : "wchar_t"
        string_type = utf8 ? "std::string" : "std::wstring"

        output_dir = File.dirname(output)
        mkdir_p output_dir unless File.exists?(output_dir)

        File.open(output, 'w') do |out|
          out << COPYRIGHT
          out << "\n"
          out << "/* AUTO GENERATED - DO NOT EDIT BY HAND */\n"
          out << "#ifndef #{define_guard}\n"
          out << "#define #{define_guard}\n"
          out << "\n"
          out << "#include <stddef.h>  // For wchar_t.\n" unless utf8
          out << "#include <string>    // For std::(w)string.\n"
          out << "\n"
          out << "namespace webdriver {\n"
          out << "namespace atoms {\n"
          out << "\n"

          js_files.each do |js_file|
            if just_declare
              atom_filename = Rake::Task[task_name(dir, js_file)].out
              atom_name = get_atom_name_from_file(dir, atom_filename)
              out << "extern const #{char_type}* const #{atom_name}[];\n"
            else
              write_atom_string_literal(out, dir, js_file, :cpp, utf8)
            end
          end

          out << "\n"
          out << "static inline #{string_type} asString(const #{char_type}* const atom[]) {\n"
          out << "  #{string_type} source;\n";
          out << "  for (int i = 0; atom[i] != NULL; i++) {\n"
          out << "    source += atom[i];\n"
          out << "  }\n"
          out << "  return source;\n"
          out << "}\n\n";
          out << "}  // namespace atoms\n"
          out << "}  // namespace webdriver\n"
          out << "\n"
          out << "#endif  // #{define_guard}\n"
        end
      end
    end

    def generate_java(dir, name, task_name, output, js_files, package)
      file output => js_files do
        task_name =~ /([a-z]+)-(driver|atoms)/
        implementation = $1.capitalize
        output_dir = File.dirname(output)
        mkdir_p output_dir unless File.exists?(output_dir)
        class_name = implementation + "Atoms"
        output = output_dir + "/" + class_name + ".java"

        puts "Preparing #{task_name} as #{output}"

        File.open(output, "w") do |out|
          out << COPYRIGHT
          out << "\n"
          out << "package #{package};\n"
          out << "\n"
          out << "/**\n"
          out << " * The WebDriver atoms are used to ensure consistent behaviour cross-browser.\n"
          out << " */\n"
          out << "public enum #{class_name} {\n"
          out << "\n"
          out << "  // AUTO GENERATED - DO NOT EDIT BY HAND\n"

          js_files.each do |js_file|
            write_atom_string_literal(out, dir, js_file, :java)
          end

          out << "  ;\n"
          out << "\n"
          out << "  private final String value;\n"
          out << "\n"
          out << "  public String getValue() {\n"
          out << "    return value;\n"
          out << "  }\n"
          out << "\n"
          out << "  public String toString() {\n"
          out << "    return getValue();\n"
          out << "  }\n"
          out << "\n"
          out << "  #{class_name}(String value) {\n"
          out << "    this.value = value;\n"
          out << "  }\n"
          out << "\n"
          out << "}"
        end
      end
    end

    def generate_csharp(dir, name, task_name, output, js_files, package)
      file output => js_files do
        task_name =~ /([a-z]+)-driver/
        implementation = $1.capitalize
        output_dir = File.dirname(output)
        mkdir_p output_dir unless File.exists?(output_dir)
        class_name = "WebDriverAtoms"
        output = output_dir + "/" + class_name + ".cs"

        puts "Preparing #{task_name} as #{output}"

        File.open(output, "w") do |out|
          out << COPYRIGHT
          out << "\n"
          out << "using System.CodeDom.Compiler;\n"
          out << "using System.Collections.Generic;\n"
          out << "using System.Text;\n"
          out << "\n"
          out << "namespace #{package}\n"
          out << "{\n"
          out << "    /**\n"
          out << "     * The WebDriver atoms are used to ensure consistent behaviour cross-browser.\n"
          out << "     * \n"
          out << "     * AUTO GENERATED - DO NOT EDIT BY HAND\n"
          out << "     */\n"
          out << "    [GeneratedCode(\"WebDriver\", \"#{version}\")]\n"
          out << "    public static class #{class_name}\n"
          out << "    {\n"
          out << "        private static Dictionary<string, string> atomsRepository = new Dictionary<string, string>();\n"

          js_files.each do |js_file|
            write_atom_string_literal(out, dir, js_file, :csharp)
          end

          out << "    }\n"
          out << "}"
        end
      end
    end

  end

  class ConcatenateHeaders < GenerateAtoms
    def handle(fun, dir, args)
      js = js_name(dir, args[:name])
      output = js.sub(/\.js$/, '.h')
      task_name = task_name(dir, args[:name])
      generate_header(dir, args[:name], task_name, output, args[:deps], false, args[:utf8])
      task task_name => [output]
    end
  end

  class ConcatenateCpp < GenerateAtoms
    def handle(fun, dir, args)
      js = js_name(dir, args[:name])
      h_output = js.sub(/\.js$/, '.h')
      cc_output = js.sub(/\.js$/, '.' + args[:extension])
      task_name = task_name(dir, args[:name])
      generate_header(dir, args[:name], task_name, h_output, args[:deps], true, args[:utf8])
      generate_cpp_source(dir, args[:name], task_name, cc_output, args[:deps], args[:utf8])
      task task_name => [h_output]
      task task_name => [cc_output]
    end
  end

  class ConcatenateJava < GenerateAtoms
    def handle(fun, dir, args)
      js = js_name(dir, args[:name])
      output = js.sub(/\.js$/, '.java')
      task_name = task_name(dir, args[:name])
      generate_java(dir, args[:name], task_name, output, args[:deps], args[:package])
      task task_name => [output]
    end
  end

  class ConcatenateCSharp < GenerateAtoms
    def handle(fun, dir, args)
      js = js_name(dir, args[:name])
      output = js.sub(/\.js$/, '.cs')
      task_name = task_name(dir, args[:name])
      generate_csharp(dir, args[:name], task_name, output, args[:deps], args[:package])
      task task_name => [output]
    end
  end

  class CopyHeader < BaseJs
    def handle(fun, dir, args)
      return unless args[:out]

      js = js_name(dir, args[:name])
      output = js.sub(/\.js$/, '.h')
      task_name = task_name(dir, args[:name])
      task task_name do
        puts "Writing: #{args[:out]}"
        cp output, args[:out]
      end
    end
  end

  class CopySource < BaseJs
    def handle(fun, dir, args)
      return unless args[:out]

      js = js_name(dir, args[:name])
      output = js.sub(/\.js$/, '.cc')
      task_name = task_name(dir, args[:name])
      task task_name do
        puts "Writing: #{args[:out]}"
        cp output, args[:out]
      end
    end
  end

  class CreateHeader < GenerateAtoms
    def handle(fun, dir, args)
      js = js_name(dir, args[:name])
      out = js.sub(/\.js$/, '.h')
      task_name = task_name(dir, args[:name]) + ":header"
      generate_header(dir, args[:name], task_name, out, [js], false, false)
      task task_name => [out]
    end
  end

  class RunTests < BaseJs
    def handle(fun, dir, args)
      task_name = task_name(dir, args[:name])

      java_browsers = BROWSERS.find_all { |k,v| v.has_key?(:java) }
      available_browsers = java_browsers.find_all { |k,v| [nil, true].include?(v[:available]) }
      listed_browsers = args[:browsers] ? Hash[*(args[:browsers]).collect { |b| [b, BROWSERS[b]]}.flatten].find_all { |k,v| !v.nil? } : java_browsers

      listed_browsers.each do |browser, all_browser_data|
        browser_data = all_browser_data[:java]
        browser_task_name = "#{task_name}_#{browser}"
        deps = [task_name]
        deps.concat(browser_data[:deps]) if browser_data[:deps]

        desc "Run the tests for #{browser_task_name}"
        task "#{browser_task_name}:run" => deps do
          puts "Testing: #{browser_task_name} " +
              (ENV['log'] == 'true' ? 'Log: build/test_logs/TEST-' + browser_task_name.gsub(/[\/:]+/, '-') : '')

          cp = CrazyFunJava::ClassPath.new("#{browser_task_name}:run")
          puts cp
          mkdir_p 'build/test_logs'

          CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel(2) if ENV['log']
          CrazyFunJava.ant.junit(:fork => true, :forkmode =>  'once', :showoutput => true,
                                 :printsummary => 'on', :haltonerror => halt_on_error?, :haltonfailure => halt_on_failure?) do |ant|
            ant.classpath do |ant_cp|
              cp.all.each do |jar|
                ant_cp.pathelement(:location => jar)
              end
            end

            sysprops = args[:sysproperties] || []

            ant.sysproperty :key => "selenium.browser", :value => browser #browser_data[:class]

            sysprops.each do |map|
              map.each do |key, value|
                ant.sysproperty :key => key, :value => value
              end
            end

            if ($DEBUG)
              ant.jvmarg(:line => "-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005")
            end

            test_dir = args[:test_dir] ? File.join(dir, args[:test_dir]) : File.join(dir, 'test')
            ant.sysproperty :key => 'js.test.dir', :value => test_dir

            if !args[:exclude].nil?
              excludes = File.join(dir, args[:exclude])
              excludes = FileList[excludes].to_a.collect do |f|
                f[test_dir.length + 1..-1]
              end
              ant.sysproperty :key => 'js.test.excludes', :value => excludes.join(',')
            end

            ant.formatter(:type => 'plain')
            ant.formatter(:type => 'xml')

            ant.test(:name => "org.openqa.selenium.javascript.ClosureTestSuite",
                     :outfile => "TEST-" + browser_task_name.gsub(/[\/:]+/, "-"),
                     :todir => 'build/test_logs')
          end
          CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel($DEBUG ? 2 : 0)
        end
      end

      task "#{task_name}:run" => (listed_browsers & available_browsers).map { |browser,_| "#{task_name}_#{browser}:run" }
    end
  end

  module Node
    class BaseNodeJsTask < BaseJs
      def folder_name(dir, name)
        path_for "build/#{dir}/#{name}"
      end
    end


    class CreateTask < BaseNodeJsTask
      def handle(fun, dir, args)
        folder_name = folder_name(dir, args[:name])
        task_name = task_name(dir, args[:name])

        task task_name
        task = Rake::Task[task_name]
        task.out = folder_name
        add_dependencies(task, dir, args[:srcs])
        add_dependencies(task, dir, args[:deps]) unless args[:deps].nil?
      end
    end

    class GenerateModule < BaseNodeJsTask
      def handle(fun, dir, args)
        folder_name = folder_name(dir, args[:name])
        task_name = task_name(dir, args[:name])

        task task_name do
          puts "Preparing: #{task_name} as #{folder_name}"

          srcdir = File.join(dir, args[:srcdir])

          deps = build_deps(folder_name, Rake::Task[task_name], []).uniq
          deps = deps.flatten.collect {|dep| File.expand_path(dep)}

          roots = args[:content_roots].collect {|root| File.join(Dir.pwd, root)}

          resources = []
          exclude_resources = []
          (args[:resources] || []).each do |resource|
            resource.each do |from, to|
              resources.push(" --resource=#{from}:#{to}")
            end
          end
          (args[:exclude_resources] || []).each do |pattern|
            exclude_resources.push(" --exclude_resource=#{pattern}")
          end

          mkdir_p "#{folder_name}"

          cmd = "node javascript/node/deploy.js" <<
              " --output=#{folder_name}" <<
              " --lib=" << deps.join(" --lib=") <<
              " --lib=third_party/closure/goog" <<
              " --root=" << roots.join(" --root=") <<
              " --src=" << srcdir <<
              resources.join("") <<
              exclude_resources.join("")

          sh cmd
        end
      end
    end
  end  # module Node
end
