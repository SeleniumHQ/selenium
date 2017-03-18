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

# Monkey patch NuGetPack.execute to pass correct command line options.
# This patch can be removed when Albacore issue is fixed.
class NuGetPack
  def execute
    fail_with_message 'nuspec must be specified.' if @nuspec.nil?

    params = []
    params << "pack"
    params << "#{nuspec}"
    params << "-BasePath #{base_folder}" unless @base_folder.nil?
    params << "-OutputDirectory #{output}" unless @output.nil?

    merged_params = params.join(' ')

    @logger.debug "Build NuGet pack Command Line: #{merged_params}"
    result = run_command "NuGet", merged_params

    failure_message = 'NuGet Failed. See Build Log For Detail'
    fail_with_message failure_message if !result
  end
end

class VisualStudioMappings
  def add_all(fun)
    fun.add_mapping("visualc_library", CrazyFunVisualC::VisualCLibrary.new)

    fun.add_mapping("visualc_release", CrazyFunVisualC::VisualCLibrary.new)
    fun.add_mapping("visualc_release", CrazyFunVisualC::VisualCRelease.new)

    fun.add_mapping("dotnet_library", CrazyFunDotNet::DotNetLibrary.new)
    fun.add_mapping("dotnet_library", CrazyFunDotNet::CreateShortTaskName.new)
    fun.add_mapping("dotnet_library", CrazyFunDotNet::MergeAssemblies.new)

    fun.add_mapping("dotnet_package", CrazyFunDotNet::CreateNuSpec.new)
    fun.add_mapping("dotnet_package", CrazyFunDotNet::PackNuGetPackage.new)
    fun.add_mapping("dotnet_package", CrazyFunDotNet::PublishNuGetPackage.new)

    fun.add_mapping("dotnet_docs", CrazyFunDotNet::GenerateDotNetDocs.new)
    fun.add_mapping("dotnet_docs", CrazyFunDotNet::MoveDotNetHelpFile.new)

    fun.add_mapping("dotnet_test", CrazyFunDotNet::DotNetLibrary.new)
    fun.add_mapping("dotnet_test", CrazyFunDotNet::RunDotNetTests.new)

    fun.add_mapping("dotnet_release", CrazyFunDotNet::DotNetRelease.new)
  end
end

module CrazyFunDotNet
  class DotNetTasks < Tasks
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

    def get_reference_assemblies_version_dir(version)
      if version == "net35"
        return File.join(get_reference_assemblies_dir(), "v3.5")
      end
      return File.join(get_reference_assemblies_dir(), '.NETFramework', "v4.0")
    end

    def resolve_framework_reference(ref, version)
      assembly = File.join(get_reference_assemblies_version_dir(version), ref)
      unless File.exists? assembly
        if version == "net35"
          assembly = File.join(get_framework_dir(), "v2.0.50727", ref)
        else
          assembly = File.join(get_framework_dir(), "v4.0.30319", ref)
        end
      end
      return assembly.to_s
    end

    def find_environment_variable(possible_vars, fallback)
      var_name = possible_vars.find { |e| ENV[e] }
      if var_name.nil?
        return fallback
      end
      return ENV[var_name]
    end

    def get_version(dir)
      found_version = version
      version_tag = ""
      list = FileList.new(dir + "/**/AssemblyInfo.cs").to_a
      if list.length > 0
        version_regexp = /^.*AssemblyVersion\(\"(.*)\"\).*$/
        version_tag_regexp = /^.*AssemblyInformationalVersion\(\".*-(.*)\"\).*$/
        assembly_info = File.open list[0]
        assembly_info.each do |line|
          version_match = line.match version_regexp
          if (not version_match.nil?)
            found_version = version_match[1]
            found_version = found_version[0..found_version.rindex(".") - 1]
          end
          version_tag_match = line.match version_tag_regexp
          if (not version_tag_match.nil?)
            version_tag = version_tag_match[1]
          end
        end
        assembly_info.close
      end
      if version_tag != ""
        found_version = found_version + "-" + version_tag
      end
      found_version
    end
  end

  class DotNetLibrary < DotNetTasks
    def handle(fun, dir, args)
      base_dir = "build/dotnet"
      framework_ver = "net40"
      unless args[:framework_ver].nil?
        framework_ver = args[:framework_ver]
      end

      unless args[:keyfile].nil?
        base_dir = File.join(base_dir, "strongnamed")
      else
        base_dir = File.join(base_dir, "dist")
      end

      output_dir = base_dir
      unless args[:merge_refs].nil?
        output_dir = File.join(output_dir, "unmerged")
      end
      output_dir = File.join(output_dir, framework_ver)
      full_path = File.join(output_dir, args[:out])
      desc_path = full_path.gsub("/", Platform.dir_separator)
      desc "Build #{desc_path}"

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
        puts "Compiling: #{task_name} as #{desc_path}"
        FileUtils.mkdir_p output_dir

        to_copy = []
        references = resolve_references(dir, args[:refs], framework_ver, to_copy)
        references << args[:merge_refs] unless args[:merge_refs].nil?

        # For each resource key-value pair in the resources Hash, assume
        # the key to the hash represents the name of the file to embed
        # as a resource. If the key in the Hash is a Task, the name of
        # the file to embed should be output of that Task.
        unless args[:resources].nil?
          args[:resources].each do |resource|
            resource_file = resource.keys[0]
            resource_identifier = resource.fetch(resource_file)
            resource_task_name = task_name(dir, resource_file)
            if Rake::Task.task_defined? resource_task_name
              resource_file = Rake::Task[resource_task_name].out
            end
            embedded_resources << "#{resource_file},#{resource_identifier}"
          end
        end

        csc_task.use :net40
        csc_task.parameters params
        csc_task.compile FileList[[dir, args[:srcs]].join(File::SEPARATOR)]
        csc_task.output = full_path
        csc_task.target = :library
        if args[:omitdocxml].nil?
          csc_task.doc = full_path.chomp(File.extname(args[:out])) + ".xml"
        end
        csc_task.optimize = true
        csc_task.debug = :pdbonly
        csc_task.references references
        csc_task.resources embedded_resources
        csc_task.keyfile = args[:keyfile] unless args[:keyfile].nil?

        copy_resources(dir, to_copy, output_dir)
        unless args[:files].nil?
          copy_resources(dir, args[:files], output_dir)
        end
      end
      
      add_dependencies(target, dir, buildable_references)
      add_dependencies(target, dir, buildable_resources)
      add_dependencies(target, dir, args[:deps])

      target.out = full_path
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
  
  class MergeAssemblies < DotNetTasks
    def handle(fun, dir, args)
      base_dir = "build/dotnet"
      framework_ver = "net40"
      unless args[:framework_ver].nil?
        framework_ver = args[:framework_ver]
      end

      unless args[:keyfile].nil?
        base_dir = File.join(base_dir, "strongnamed")
      else
        base_dir = File.join(base_dir, "dist")
      end

      output_dir = File.join(base_dir, framework_ver)
      unmerged_dir = File.join(base_dir, "unmerged")
      unmerged_dir = File.join(unmerged_dir, framework_ver)
      unmerged_path = File.join(unmerged_dir, args[:out])
      full_path = File.join(output_dir, args[:out])
      desc_path = full_path.gsub("/", Platform.dir_separator)

      desc "Merge #{desc_path}"
      task_name = task_name(dir, args[:name])
      
      unless args[:merge_refs].nil?
        params = ["/t:library",
                 "/xmldocs",
                 "/align:512"]
        if framework_ver == "net35"
          params << "/v2"
        else
          mscorlib_location = get_reference_assemblies_version_dir("net40")
          unless File.exists? mscorlib_location
            mscorlib_location = File.join(get_framework_dir(), "v4.0.30319")
          end
          params << "/targetplatform:v4,\"#{mscorlib_location.to_s.gsub('/', Platform.dir_separator)}\""
        end
        params << "/keyfile:#{args[:keyfile]}" unless args[:keyfile].nil?
        params << "/out:#{full_path.gsub('/', Platform.dir_separator)}"

        params << unmerged_path.gsub("/", Platform.dir_separator)

        args[:merge_refs].each do |assembly|
          params << assembly.gsub("/", Platform.dir_separator)
        end

        target = exec task_name do |cmd|
          puts "Merging: #{task_name} as #{desc_path}"
          FileUtils.mkdir_p output_dir
          if args[:exclude_merge_types].nil?
            params << "/internalize"
          else
            exclude_types_file = File.join(unmerged_dir, "#{args[:out]}.mergeexclude.txt")
            f = File.open(exclude_types_file, 'w')
            args[:exclude_merge_types].each do |exclude_type|
              f.write exclude_type + "\n"
            end
            f.close
            params << "/internalize:#{exclude_types_file.gsub('/', Platform.dir_separator)}"
          end
          cmd.command = "third_party/dotnet/ilmerge/ILMerge.exe"
          cmd.parameters = params.join " "
        end
        target.out = full_path
      end
    end

    private
    def resolve_merge_assemblies(dir, refs)
      to_merge = []
      unless refs.nil?
        refs.each do |reference|
          reference_task_name = task_name(dir, reference)

          unless Rake::Task.task_defined? reference_task_name
            if reference.include? "/"
              to_merge << reference
            end
          end
        end
      end
      return to_merge
    end
  end
  
  class CreateShortTaskName < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      if name.end_with? "#{args[:name]}:#{args[:name]}"
        name = name.sub(/:.*$/, "")
        task name => task_name(dir, args[:name])
      end
    end
  end

  class RunDotNetTests < Tasks
    def handle(fun, dir, args)
      base_output_dir = 'build'
      output_dir = base_output_dir + '/dotnet/dist/net40'
      test_log_dir = base_output_dir + '/test_logs'

      task_name = task_name(dir, args[:name])
      desc "Run the tests for #{task_name}"

      target = nunit "#{task_name}:run" do |nunit_task|
        mkdir_p test_log_dir
        puts "Testing: #{task_name}"
        nunit_task.command = "third_party/dotnet/nunit-3.6.0/nunit3-console.exe"
        nunit_task.assemblies << [output_dir, args[:project]].join(File::SEPARATOR)
        nunit_task.options << "--agents=1"
        nunit_task.options << "--noheader"
        nunit_task.options << "--result=#{[test_log_dir, args[:project]].join(File::SEPARATOR)}.xml"
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

      target_task = msbuild task_name do |msb|
        puts "Generating help website: at #{web_documentation_path_desc}"

        doc_sources = resolve_doc_sources(dir, args[:srcs])

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
      end
    end
  end

  class CreateNuSpec < DotNetTasks
    def handle(fun, dir, args)
      output_dir = "build/dotnet/dist"
      spec_file = "#{output_dir}/nuget/#{args[:packageid]}.nuspec"
      task_name = task_name(dir, args[:name])
      package_version = get_version(dir)
      desc "Creates and optionally publishes the NuGet package for #{args[:out]}"
      target = nuspec "#{task_name}" do |nuspec_task|
        mkdir_p "#{output_dir}/nuget"
        puts "Creating .nuspec for: #{task_name}"
        nuspec_task.output_file = spec_file
        nuspec_task.id = args[:packageid]
        nuspec_task.version = package_version
        nuspec_task.authors = "Selenium Committers"
        nuspec_task.description = args[:description]
        nuspec_task.owners = "Software Freedom Conservancy"
        nuspec_task.title = args[:title] unless args[:title].nil?
        nuspec_task.summary = args[:summary] unless args[:summary].nil?
        nuspec_task.projectUrl = "https://github.com/SeleniumHQ/selenium"
        nuspec_task.licenseUrl = "http://www.apache.org/licenses/LICENSE-2.0"
        nuspec_task.iconUrl = "http://seleniumhq.org/images/big-logo.png"
        nuspec_task.requireLicenseAcceptance = "false"
        nuspec_task.tags = args[:tags] unless args[:tags].nil?

        args[:deps].each do |dependency|
          file_dependency_task = task_name(dir, dependency)
          if Rake::Task.task_defined? file_dependency_task
            relative_output_file = Rake::Task[file_dependency_task].out.sub(output_dir + "/", "").gsub("/", Platform.dir_separator)
            output_subdir = File.dirname(relative_output_file)
            dest_dir = "lib"
            if output_subdir.length > 0
              dest_dir << "/#{output_subdir}"
            end
            nuspec_task.file relative_output_file, dest_dir
            nuspec_task.file relative_output_file.chomp(File.extname(relative_output_file)) + ".xml", dest_dir
          end
        end

        unless args[:packagedeps].nil?
          args[:packagedeps].each do |dep|
            package_dependency_id = dep.keys[0]
            package_dependency_version = package_version
            package_dependency_task = task_name(dir, package_dependency_id)
            if Rake::Task.task_defined? package_dependency_task
              package_dependency_id = Rake::Task[package_dependency_task].out
            else
              package_version = "#{dep.fetch(package_dependency_id)}"
            end
            nuspec_task.dependency package_dependency_id, package_dependency_version
          end
        end

        unless args[:assemblies].nil?
          args[:assemblies].each do |assembly|
            assembly_id = assembly.keys[0]
            framework_version = assembly.fetch(assembly_id)
            nuspec_task.framework_assembly assembly_id, framework_version
          end
        end
      end

      target.out = args[:packageid]
      add_dependencies(target, dir, args[:deps])
    end
  end

  class PackNuGetPackage < Tasks
    def handle(fun, dir, args)
      output_dir = "build/dotnet/dist"
      spec_file = "#{output_dir}/nuget/#{args[:packageid]}.nuspec"
      task_name = task_name(dir, args[:name])
      target = nugetpack "#{task_name}" do |nugetpack_task|
        puts "Packaging: #{task_name}"
        nugetpack_task.command = "third_party/dotnet/nuget/NuGet.exe"
        nugetpack_task.nuspec = spec_file
        nugetpack_task.base_folder = output_dir
        nugetpack_task.output = "#{output_dir}/nuget"
      end
    end
  end

  class PublishNuGetPackage < DotNetTasks
    def handle(fun, dir, args)
      output_dir = "build/dotnet/dist"
      package_version = get_version(dir)
      package_file = "#{output_dir}/nuget/#{args[:packageid]}.#{package_version}.nupkg".gsub("/", Platform.dir_separator)
      task_name = task_name(dir, args[:name])
      desc "Publishes NuGet package for #{task_name} to NuGet Gallery"
      target = task "#{task_name}" do
        if ENV["apikey"].nil?
          puts "No API key specified. NuGet packages will not be published."
        else
          # Create an "immediate execution" task so that the build won't
          # fail if the API key is not specified.
          nugetpush! "#{task_name}.publish" do |nugetpush_task|
            nugetpush_task.command = "third_party/dotnet/nuget/NuGet.exe"
            puts "Publishing NuGet package for: #{task_name}"
            nugetpush_task.package = package_file
            nugetpush_task.apikey = ENV["apikey"]
          end
        end
      end
    end
  end

  class DotNetRelease < DotNetTasks
    def handle(fun, dir, args)
      output_dir = 'build/dotnet'
      unless args[:signed].nil?
        output_dir = File.join(output_dir, "strongnamed")
      else
        output_dir = File.join(output_dir, "dist")
      end
      file_name = args[:out].chomp(File.extname(args[:out])) + "-" + get_version(dir) + File.extname(args[:out])
      output_file = File.join(output_dir, file_name)

      full_path = output_file.gsub("/", Platform.dir_separator)
      desc "Prepares release file #{full_path}"
      task_name = task_name(dir, args[:name])

      target = file task_name do
        puts "Preparing release file: #{full_path}"
        if File.exists? output_file
          File.delete output_file
        end
        tmp_dir = File.join(output_dir, "temp")
        mkdir_p tmp_dir
        lst = FileList[output_dir + "/*"].exclude(/.*(nuget|temp|unmerged).*/)
        cp_r lst, tmp_dir
        zip(tmp_dir, output_file)
        rm_rf tmp_dir
      end
      
      add_dependencies(target, dir, args[:deps])
      target.out = output_file
    end
  end
end

module CrazyFunVisualC
  class VisualCLibrary < Tasks
    def handle(fun, dir, args)
      full_path = File.join("build/cpp", args[:out])
      desc_path = full_path.gsub("/", Platform.dir_separator)
      desc "Build #{desc_path}"

      task_name = task_name(dir, args[:name])

      if !msbuild_installed?
         # overwrite the msbuild task with one that just copies prebuilts
         file full_path do
           copy_prebuilt(fun, full_path)
         end

         target_task = task task_name => full_path

         target_task.out = full_path
      else
        file desc_path do
          begin
            msbuild! "#{task_name}.compile" do |msb|
              puts "Compiling: #{task_name} as #{desc_path}"
              msb.use :net40
              msb.properties :configuration => :Release, :platform => args[:platform]
              msb.solution = File.join(dir, args[:project])
              msb.targets = ["Build"]
              msb.parameters "/nologo"
              msb.verbosity = "quiet"
            end
          rescue
              puts "Compilation of #{desc_path} failed."
              copy_prebuilt(fun, full_path)
          end
        end

        task task_name => desc_path
        Rake::Task[task_name].out = desc_path
        target_task = Rake::Task[desc_path]
      end

      add_dependencies(target_task, dir, args[:deps])
      target_task.enhance [ args[:file_deps] ] if args[:file_deps]
    end
  end

  class VisualCRelease < Tasks
    def handle(fun, dir, args)
      output_dir = 'build/cpp'
      file_name = args[:out].chomp(File.extname(args[:out])) + "_" + args[:platform] + "_" + get_version(dir) + ".zip"
      output_file = File.join(output_dir, file_name)

      full_path = output_file.gsub("/", Platform.dir_separator)
      desc "Prepares release file #{full_path}"
      task_name = task_name(dir, args[:name])
      release_task_name = task_name(dir, args[:name] + ":release")

      target = file release_task_name do
        puts "Preparing release file: #{full_path}"
        if File.exists? output_file
          File.delete output_file
        end
        if Rake::Task.task_defined? task_name
          dependency_output_file = Rake::Task[task_name].out
          do_zip(dependency_output_file, output_file)
        end
      end
      
      add_dependencies(target, dir, [task_name])
      target.out = output_file
    end

    def get_version(dir)
      found_version = version
      list = FileList.new(dir + "/**/*.rc").to_a
      if list.length > 0
        regexp = /^.*\"FileVersion\",\s*\"(.*)\".*$/
        rc = File.open list[0], 'rb'
        rc.each do |data|
          line = data.gsub(/\x00/, "")
          match = line.match regexp
          if (not match.nil?)
            found_version = match[1]
            found_version = found_version[0..found_version.rindex(".") - 1]
          end
        end
        rc.close
      end
      found_version
    end

    def do_zip(src, dest)
      # Need our own zip implementation as zip in common.rb only
      # handles directories, not individual files.
      src_dir = File.dirname(Platform.path_for(File.expand_path(src)))
      src_file = File.basename(Platform.path_for(File.expand_path(src)))
      out = Platform.path_for(File.expand_path(dest))
      Dir.chdir(src_dir) {
        # TODO(jari): something very weird going on here on windows
        # the 2>&1 is needed for some reason
        ok = system(%{jar cMf "#{out}" "#{src_file}" 2>&1})
        ok or raise "could not zip #{src} => #{dest}"
      }
    end
  end
end
