require 'albacore'
require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/checks'

class VisualStudioMappings
  def add_all(fun)
    fun.add_mapping("visualc_library", CrazyFunVisualC::VisualCLibrary.new)

    fun.add_mapping("dotnet_library", CrazyFunDotNet::DotNetLibrary.new)

    fun.add_mapping("dotnet_test", CrazyFunDotNet::DotNetLibrary.new)
    fun.add_mapping("dotnet_test", CrazyFunDotNet::RunDotNetTests.new)
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
      # TODO (JimEvans): Visual Studio 2010 migration.
      # Add a "/nostdlib+" element to the params array.
      params = ["/nologo",
                "/noconfig",
                "/filealign:512"]

      # TODO (JimEvans): Visual Studio 2010 migration.
      # Insert an mscorlib reference, since we compile with the
      # nostdlib flag enabled.
      # args[:refs].insert(0, "mscorlib.dll")

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

        # TODO (JimEvans): Visual Studio 2010 migration.
        # Change :net35 to :net40
        csc_task.use :net35
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

  class RunDotNetTests < Tasks
    def handle(fun, dir, args)
      output_dir = 'build/dotnet'
      task_name = task_name(dir, args[:name])
      desc "Run the tests for #{task_name}"

      target = nunit "#{task_name}:run" do |nunit_task|
        puts "Testing: #{task_name}"
        nunit_task.command = "third_party/csharp/nunit-2.5.9/nunit-console.exe"
        nunit_task.assemblies << [output_dir, args[:project]].join(File::SEPARATOR)
        nunit_task.options << "/nologo"
      end

      add_dependencies(target, dir, args[:deps])
      add_dependencies(target, dir, ["#{task_name}"])
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
        # TODO (JimEvans): Visual Studio 2010 migration.
        # Change :net35 to :net40. Optionally change build.desc
        # files to refer to the .vcxproj files for the individual
        # C++ projects, and resolve the project name here.
        target_task = msbuild task_name do |msb|
          puts "Compiling: #{task_name} as #{desc_path}"
          msb.use :net35
          msb.properties :configuration => :Release, :platform => args[:platform]
          msb.targets args[:target]
          msb.solution = "WebDriver.sln"
          msb.parameters "/nologo"
          msb.verbosity = "quiet"
        end
      end

      target_task.out = full_path

      add_dependencies(target_task, dir, args[:deps])
    end
  end
end
