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
      params = ["/nologo",
                "/noconfig",
                "/filealign:512"]

      embedded_resources = []
      buildable_references = resolve_buildable_targets(args[:refs])
      buildable_resources = resolve_buildable_targets(args[:resources])
      target = csc task_name do |csc_task|
        puts "Compiling: #{task_name} as #{full_path}"
        FileUtils.mkdir_p output_dir

        references = resolve_references(dir, args[:refs])
        to_copy = flag_references_to_copy(references)

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
    def resolve_references(dir, refs)
      references = []
      unless refs.nil?
        refs.each do |reference|
          reference_task_name = task_name(dir, reference)
          if Rake::Task.task_defined?(reference_task_name)
            references << Rake::Task[reference_task_name].out
          else
            references << reference
          end
        end
      end
      return references
    end

    def flag_references_to_copy(refs)
      output_dir = 'build/dotnet'
      to_copy = []
      unless refs.nil?
        refs.each do |reference|
          if reference.include?("/") && !reference.start_with?(output_dir)
            to_copy << reference
          end
        end
      end
      return to_copy
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
