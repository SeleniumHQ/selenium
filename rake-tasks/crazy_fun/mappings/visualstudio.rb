require 'albacore'
require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/checks'

# Monkey patch NUnitTestRunner.execute so as not to fail the build
# when encountering a test failure and to redirect output from NUnit.
class NUnitTestRunner
  attr_accessor :output_redirect, :ignore_test_fail
  def execute
    command_params = get_command_parameters().join(" ")
    unless output_redirect.nil?
      command_params = command_params + " > " + @output_redirect
    end
    result = run_command "NUnit", command_params

    failure_message = 'NUnit Failed. See Build Log For Detail'
    fail_with_message failure_message if !result and !@ignore_test_fail
  end
end

class VisualStudioMappings
  def add_all(fun)
    fun.add_mapping("visualc_library", CrazyFunVisualC::VisualCLibrary.new)

    fun.add_mapping("dotnet_library", CrazyFunDotNet::DotNetLibrary.new)
    fun.add_mapping("dotnet_library", CrazyFunDotNet::CreateShortTaskName.new)

    fun.add_mapping("dotnet_docs", CrazyFunDotNet::GenerateDotNetDocs.new)
    fun.add_mapping("dotnet_docs", CrazyFunDotNet::MoveDotNetHelpFile.new)

    fun.add_mapping("dotnet_test", CrazyFunDotNet::DotNetLibrary.new)
    fun.add_mapping("dotnet_test", CrazyFunDotNet::RunDotNetTests.new)
    
    fun.add_mapping("dotnet_release", CrazyFunDotNet::DotNetRelease.new)
  end
end

module CrazyFunDotNet
  class DotNetLibrary < Tasks
    def handle(fun, dir, args)
      output_dir = 'build/dotnet'
      full_path = args[:out].gsub("/", Platform.dir_separator)
      desc "Build #{full_path}"

      task_name = task_name(dir, args[:name])

      # Default parameters to csc.exe that we will use.
      # These should decline as more functionality is added
      # to the Albacore csc task.
      params = ["/nostdlib+",
                "/nologo",
                "/noconfig",
                "/filealign:512"]

      args[:refs].insert(0, "mscorlib.dll")

      embedded_resources = []
      buildable_references = resolve_buildable_targets(args[:refs])
      buildable_resources = resolve_buildable_targets(args[:resources])
      target = csc task_name do |csc_task|
        puts "Compiling: #{task_name} as #{full_path}"
        FileUtils.mkdir_p output_dir

        framework_ver = "3.5"
        unless args[:framework_ver].nil?
          framework_ver = args[:framework_ver]
        end

        to_copy = []
        references = resolve_references(dir, args[:refs], framework_ver, to_copy)

        # For each resource key-value pair in the resources Hash, assume
        # the key to the hash represents the name of the file to embed
        # as a resource. If the key in the Hash is a Task, the name of
        # the file to embed should be output of that Task.
        unless args[:resources].nil?
          args[:resources].each do |resource|
            resource_file = resource.keys[0]
            resource_identifier = resource.fetch(resource_file)
            resource_task_name = task_name(dir, resource_file)
            if Rake::Task.task_defined?(resource_task_name)
              resource_file = Rake::Task[resource_task_name].out
            end
            embedded_resources << "#{resource_file},#{resource_identifier}"
          end
        end

        csc_task.use :net40
        csc_task.parameters params
        csc_task.compile FileList[[dir, args[:srcs]].join(File::SEPARATOR)]
        csc_task.output = args[:out]
        csc_task.target = :library
        csc_task.doc = args[:doc]
        csc_task.optimize = true
        csc_task.debug = :pdbonly
        csc_task.references references
        csc_task.resources embedded_resources

        copy_resources(dir, to_copy, output_dir)
        unless args[:files].nil?
          copy_resources(dir, args[:files], output_dir)
        end
      end
      
      add_dependencies(target, dir, buildable_references)
      add_dependencies(target, dir, buildable_resources)
      add_dependencies(target, dir, args[:deps])

      target.out = args[:out]
    end

    private
    def resolve_references(dir, refs, framework_ver, assemblies_to_copy)
      references = []
      unless refs.nil?
        refs.each do |reference|
          reference_task_name = task_name(dir, reference)

          if Rake::Task.task_defined? reference_task_name
            references << Rake::Task[reference_task_name].out
          else
            if reference.include? "/"
              assemblies_to_copy << reference
              references << reference
            else
              references << resolve_framework_reference(reference, framework_ver)
            end
          end
        end
      end
      return references
    end

    def get_reference_assemblies_dir()
      @reference_assemblies_dir ||= (
        program_files_dir = find_environment_variable(['ProgramFiles(x86)', 'programfiles(x86)', 'PROGRAMFILES(X86)'], "C:/Program Files (x86)")
        unless File.exists? program_files_dir
          program_files_dir = find_environment_variable(['ProgramFiles', 'programfiles', 'PROGRAMFILES'], "C:/Program Files")
        end
        File.join(program_files_dir, 'Reference Assemblies', 'Microsoft', 'Framework')
      )
    end

    def get_framework_dir()
      @framework_dir ||= (
        windows_dir = find_environment_variable(['WinDir', 'windir', 'WINDIR'], "C:/Windows")
        File.join(windows_dir, 'Microsoft.NET', 'Framework')
      )
    end

    def resolve_framework_reference(ref, version)
      if version == "3.5"
        assembly = File.join(get_reference_assemblies_dir(), "v" + version, ref)
        unless File.exists? assembly
          assembly = File.join(get_framework_dir(), "v2.0.50727", ref)
        end

        return assembly.to_s
      end
      return File.join(get_reference_assemblies_dir(), '.NETFramework', "v" + version, ref).to_s
    end

    def find_environment_variable(possible_vars, fallback)
      var_name = possible_vars.find { |e| ENV[e] }
      if var_name.nil?
        return fallback
      end
      return ENV[var_name]
    end

    def resolve_buildable_targets(target_candidates)
      buildable_targets = []
      unless target_candidates.nil?
        target_candidates.each do |target_candidate|
          if target_candidate.to_s.start_with? "//" or target_candidate.is_a? Symbol
            buildable_targets << target_candidate
          end
        end
      end
      return buildable_targets
    end
  end
  
  class CreateShortTaskName < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      if (name.end_with? "#{args[:name]}:#{args[:name]}")
        name = name.sub(/:.*$/, "")
        task name => task_name(dir, args[:name])
      end
    end
  end

  class RunDotNetTests < Tasks
    def handle(fun, dir, args)
      base_output_dir = 'build'
      output_dir = base_output_dir + '/dotnet'
      test_log_dir = base_output_dir + '/test_logs'

      task_name = task_name(dir, args[:name])
      desc "Run the tests for #{task_name}"

      target = nunit "#{task_name}:run" do |nunit_task|
        mkdir_p test_log_dir
        puts "Testing: #{task_name}"
        nunit_task.command = "third_party/csharp/nunit-2.5.9/nunit-console.exe"
        nunit_task.assemblies << [output_dir, args[:project]].join(File::SEPARATOR)
        nunit_task.options << "/nologo"
        nunit_task.options << "/nodots"
        nunit_task.options << "/xml=#{[test_log_dir, args[:project]].join(File::SEPARATOR)}.xml"
        nunit_task.output_redirect = "#{[test_log_dir, args[:project]].join(File::SEPARATOR)}.log"
        nunit_task.ignore_test_fail = !([nil, 'true'].include? ENV['haltonfailure'])
      end

      add_dependencies(target, dir, args[:deps])
      add_dependencies(target, dir, ["#{task_name}"])
    end
  end

  class GenerateDotNetDocs < Tasks
    def handle(fun, dir, args)
      task_name = task_name(dir, args[:name])
      desc "Generate documentation for #{task_name}"

      web_documentation_path = args[:website]
      web_documentation_path_desc = web_documentation_path.gsub("/", Platform.dir_separator)

      doc_sources = resolve_doc_sources(dir, args[:srcs])

      target_task = msbuild task_name do |msb|
        puts "Generating help website: at #{web_documentation_path_desc}"

        if ENV['DXROOT'].nil?
          fail "Sandcastle documentation tools not found. Documentation will not be created."
        end

        if ENV['SHFBROOT'].nil?
          fail "Sandcastle Help File Builder not found. Documentation will not be created."
        end

        msb.use :net40
        msb.properties = {
          "OutputPath" => File.expand_path(web_documentation_path).gsub("/", Platform.dir_separator), 
          "DocumentationSources" => build_doc_sources_parameter(doc_sources),
          "HtmlHelpName" => File.basename(args[:helpfile], File.extname(args[:helpfile])),
          "HelpTitle" => File.basename(args[:helpfile], File.extname(args[:helpfile]))
        }
        msb.targets ["CoreCleanHelp", "CoreBuildHelp"]
        msb.solution = File.join(dir, args[:project]).gsub("/", Platform.dir_separator)
        msb.parameters "/nologo"
        msb.verbosity = "quiet"
      end
    end

    def resolve_doc_sources(dir, doc_source_targets)
      doc_sources = []
      doc_source_targets.each do |doc_source_target|
        doc_source_task_name = task_name(dir, doc_source_target)
        if Rake::Task.task_defined? doc_source_task_name
          assembly_doc_source = File.expand_path(Rake::Task[doc_source_task_name].out)
          xml_doc_source = assembly_doc_source.chomp(File.extname(assembly_doc_source)) + ".xml"
          doc_sources << assembly_doc_source
          doc_sources << xml_doc_source
        end
      end
      return doc_sources
    end

    def build_doc_sources_parameter(doc_sources)
      doc_sources_parameter = ""
      doc_sources.each do |doc_source|
        if File.exists? doc_source
          doc_sources_parameter << "<DocumentationSource sourceFile='#{doc_source.gsub("/", Platform.dir_separator)}' xmlns='' />"
        else
          puts "WARNING: Could not find #{doc_source}. Documentation will not include these objects."
        end
      end
      return doc_sources_parameter
    end
  end

  class MoveDotNetHelpFile < Tasks
    def handle(fun, dir, args)
      task_name = task_name(dir, args[:name])
      help_file_path_desc = args[:out].gsub("/", Platform.dir_separator)
      web_documentation_path = args[:website]
      file task_name do
        puts "Generating help file: at #{help_file_path_desc}"
        mv File.join(web_documentation_path, args[:helpfile]), File.dirname(args[:out])
		File.rename(File.join(web_documentation_path, "Index.html"), File.join(web_documentation_path, "index.html"))
		File.rename(File.join(web_documentation_path, "styles", "Presentation.css"), File.join(web_documentation_path, "styles", "presentation.css"))
      end
    end
  end

  class DotNetRelease < Tasks
    def handle(fun, dir, args)
      output_dir = 'build/dotnet'
      file_name = args[:out].chomp(File.extname(args[:out])) + "-" + args[:version] + File.extname(args[:out])
      output_file = File.join(output_dir, file_name)

      full_path = output_file.gsub("/", Platform.dir_separator)
      desc "Preparing: #{full_path}"
      task_name = task_name(dir, args[:name])

      target = file task_name do
        puts "Preparing release file: #{full_path}"
        if File.exists? output_file
          File.delete output_file
        end
        zip(output_dir, output_file)
      end
      
      add_dependencies(target, dir, args[:deps])
    end
  end
end

module CrazyFunVisualC
  class VisualCLibrary < Tasks
    def handle(fun, dir, args)
      full_path = File.join("build", dir, args[:out])
      desc_path = full_path.gsub("/", Platform.dir_separator)
      desc "Build #{desc_path}"

      task_name = task_name(dir, args[:name])

      if !msbuild_installed?
         # overwrite the msbuild task with one that just copies prebuilts
         file full_path do
           copy_prebuilt(fun, full_path)
         end
         
         target_task = task task_name => full_path
      else
        # TODO (JimEvans): Change :net35 to :net40. Optionally change
        # build.desc files to refer to the .vcxproj files for the individual
        # C++ projects, and resolve the project name here.
        target_task = msbuild task_name do |msb|
          puts "Compiling: #{task_name} as #{desc_path}"
          msb.use :net40
          msb.properties :configuration => :Release, :platform => args[:platform]
          msb.solution = File.join(dir, args[:project])
          msb.targets = ["Build"]
          msb.parameters "/nologo"
          msb.verbosity = "quiet"
        end
      end

      target_task.out = full_path

      add_dependencies(target_task, dir, args[:deps])
      target_task.enhance [ args[:file_deps] ] if args[:file_deps]
    end
  end
end
