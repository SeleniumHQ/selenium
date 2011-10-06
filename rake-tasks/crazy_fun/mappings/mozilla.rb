
require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/checks.rb'

class MozillaMappings
  def add_all(fun)
    fun.add_mapping("mozilla_xpt", Mozilla::Xpt::CheckPreconditions.new)
    fun.add_mapping("mozilla_xpt", Mozilla::Xpt::CreateTask.new)
    fun.add_mapping("mozilla_xpt", Mozilla::Xpt::CreateShortNameTask.new)
    fun.add_mapping("mozilla_xpt", Mozilla::Xpt::AddDependencies.new)
    fun.add_mapping("mozilla_xpt", Mozilla::Xpt::Compile.new)
    
    fun.add_mapping("mozilla_extension", Mozilla::Xpi::CheckPreconditions.new)
    fun.add_mapping("mozilla_extension", Mozilla::Xpi::CreateTask.new)
    fun.add_mapping("mozilla_extension", Mozilla::Xpi::CreateShortNameTask.new)
    fun.add_mapping("mozilla_extension", Mozilla::Xpi::AddDependencies.new)
    fun.add_mapping("mozilla_extension", Mozilla::Xpi::Build.new)
    
    fun.add_mapping("mozilla_multi_extension", Mozilla::MultiXpi::CheckPreconditions.new)
    fun.add_mapping("mozilla_multi_extension", Mozilla::MultiXpi::CreateTask.new)
    fun.add_mapping("mozilla_multi_extension", Mozilla::MultiXpi::AddDependencies.new)
    fun.add_mapping("mozilla_multi_extension", Mozilla::MultiXpi::Build.new)
  end
end

module Mozilla
module Xpt
  
class CheckPreconditions
  def handle(fun, dir, args)
    raise StandardError, ":name must be set" if args[:name].nil?
    raise StandardError, ":srcs must be set" if args[:srcs].nil?
    raise StandardError, "Must specify exactly one :srcs" if args[:srcs].length != 1
    raise StandardError, ":srcs does not look like an IDL file" unless args[:srcs][0].end_with? ".idl"
  end
end  
  
class BaseXpt < Tasks
  include Platform
  
  def xpt_name(dir, args)
    name = task_name(dir, name)
    xpt = "build/" + (name.slice(2 ... name.length))
    xpt = xpt.sub(":", "/")
    
    idl = args[:srcs][0].split("/")[-1]
    idl = idl.sub /\.idl$/, ".xpt"
    
    xpt << idl

    Platform.path_for(xpt)
  end

  def gecko_sdk_path(gecko_version)
    gecko = ["third_party", "gecko-#{gecko_version}"]
    if windows?
      gecko << "win32"
    elsif linux?
      gecko << "linux"
    elsif mac?
      gecko << "mac"
    else
      gecko << "unknown"
    end

    gecko.join(Platform.dir_separator)
  end
end
  
class CreateTask < BaseXpt
  def handle(fun, dir, args) 
    xpt = xpt_name(dir, args)
    task_name = task_name(dir, args[:name])
    
    file xpt => to_filelist(dir, args[:srcs][0])
    
    desc "Build an xpt from #{args[:srcs][0]}"
    task task_name => xpt
    
    Rake::Task[task_name].out = xpt
  end
end

class CreateShortNameTask < BaseXpt
  def handle(fun, dir, args)
    name = task_name(dir, args[:name])

    if (name.end_with? "#{args[:name]}:#{args[:name]}")
      name = name.sub(/:.*$/, "")
      task name => task_name(dir, args[:name])

      if (!args[:srcs].nil?)
        Rake::Task[name].out = xpt_name(dir, args)
      end
    end
  end
end

class AddDependencies < BaseXpt
  def handle(fun, dir, args)
    out_file = Rake::Task[xpt_name(dir, args)]

    # For now, depend on gecko-2
    out_file.enhance [ gecko_sdk_path("2") ]
  end
end
  
class Compile < BaseXpt
  def handle(fun, dir, args)
    xpt = xpt_name(dir, args)
    
    file xpt do
      puts "Building: #{task_name(dir, args[:name])} as #{xpt}"

      gecko = gecko_sdk_path("2")

      incl = [gecko, "idl"].join(Platform.dir_separator)

      base_cmd = (ENV['XPIDL'] || [gecko, "bin", "xpidl"].join(Platform.dir_separator)).dup
      base_cmd << ".exe" if windows?
      base_cmd << " -w -m typelib -I#{incl}"

      src = dir + "/" + Platform.path_for(args[:srcs][0])

      out_dir = File.dirname(xpt)
      mkdir_p out_dir unless File.exists? out_dir

      dir_name = File.dirname(src)
      cmd = "#{base_cmd} -I#{dir_name} -e #{xpt} #{src}"

      sh cmd do |ok, res|
        if ok
          copy_to_prebuilt(xpt, fun)
        else
          copy_prebuilt(fun, xpt)
        end
      end
    end
  end
end  
end # End of Xpt module

module Xpi
  
class BaseXpi < Tasks
  include Platform

  def xpi_name(dir, args)
    xpi = task_name(dir, args[:name])
    
    xpi = "build/" + (xpi.slice(2 ... xpi.length))
    xpi = xpi.sub(":", "/")
    xpi << ".xpi"

    Platform.path_for(xpi)
    
    if args[:out]
      xpi = File.join(File.dirname(xpi), args[:out])
    end
    xpi
  end
end
  
class CheckPreconditions
  def handle(fun, dir, args)
    raise StandardError, ":name must be set" if args[:name].nil?
  end
end  

class CreateTask < BaseXpi
  def handle(fun, dir, args)
    task_name = task_name(dir, args[:name])
    xpi = xpi_name(dir, args) 
    
    file xpi
    
    desc "Build #{xpi}"
    task task_name  => xpi
    
    Rake::Task[task_name].out = xpi
  end
end

class CreateShortNameTask < BaseXpi
  def handle(fun, dir, args)
    name = task_name(dir, args[:name])

    if (name.end_with? "#{args[:name]}:#{args[:name]}")
      name = name.sub(/:.*$/, "")
      task name => task_name(dir, args[:name])

      if (!args[:srcs].nil?)
        Rake::Task[name].out = xpi_name(dir, args)
      end
    end
  end
end

  
class AddDependencies < BaseXpi
  def handle(fun, dir, args)
    all_deps = []
    all_deps += args[:content] || []
    all_deps += args[:components] || []
    all_deps += args[:resources] || []
    all_deps.push args[:chrome] unless args[:chrome].nil?
    all_deps.push args[:install] unless args[:install].nil?
    
    task = Rake::Task[xpi_name(dir, args)]
    add_dependencies(task, dir, all_deps)
  end
end
  
class Build < BaseXpi
  def handle(fun, dir, args)
    xpi = xpi_name(dir, args)
    
    file xpi do 
      puts "Preparing: #{task_name(dir, args[:name])} as #{xpi}"
      temp = xpi + "_temp"
      mkdir_p temp

      copy_all(dir, { args[:chrome] => "chrome.manifest" }, temp) unless args[:chrome].nil?
      copy_all(dir, { args[:install] => "install.rdf"}, temp) unless args[:install].nil?
      copy_resources(dir, args[:content], temp + Platform.dir_separator + "content") unless args[:content].nil?
      copy_all(dir, args[:components], temp + Platform.dir_separator + "components") unless args[:components].nil?
      copy_resources(dir, args[:resources], temp) unless args[:resources].nil?

      Dir["#{temp}/**/.svn"].each { |file| rm_rf file }
      zip(temp, xpi)
      
      rm_rf temp
    end
  end

end
end # end of Xpi mofule

module MultiXpi

class BaseMultiXpi < Tasks
  include Platform

  def multi_xpi_name(dir, args)
    xpi = task_name(dir, args[:name])

    xpi = "build/" + (xpi.slice(2 ... xpi.length))
    xpi = xpi.sub(":", "/")
    xpi << ".xpi"

    Platform.path_for(xpi)

    if args[:out]
      xpi = File.join(File.dirname(xpi), args[:out])
    end
    xpi
  end
end

class CheckPreconditions
  def handle(fun, dir, args)
    raise StandardError, ":name must be set" if args[:name].nil?
    raise StandardError, ":install must be set" if args[:install].nil?
    raise StandardError, ":xpis must be set" if args[:xpis].nil?
  end
end  

class CreateTask < BaseMultiXpi
  def handle(fun, dir, args)
    task_name = task_name(dir, args[:name])
    xpi = multi_xpi_name(dir, args) 
    
    file xpi
    
    desc "Build #{xpi}"
    task task_name  => xpi
    
    Rake::Task[task_name].out = xpi
  end
end

class AddDependencies < BaseMultiXpi
  def handle(fun, dir, args)
    all_deps = []
    all_deps += args[:xpis]
    all_deps.push args[:install] unless args[:install].nil?
    
    task = Rake::Task[multi_xpi_name(dir, args)]
    add_dependencies(task, dir, all_deps)
  end
end

class Build < BaseMultiXpi
  def handle(fun, dir, args)
    xpi = multi_xpi_name(dir, args)
    
    file xpi do 
      puts "Preparing: #{task_name(dir, args[:name])} as #{xpi}"
      temp = xpi + "_temp"
      mkdir_p temp

      copy_all(dir, { args[:install] => "install.rdf"}, temp) unless args[:install].nil?
      copy_all(dir, args[:resources], temp)

      Dir["#{temp}/**/.svn"].each { |file| rm_rf file }
      zip(temp, xpi)
      
      rm_rf temp
    end
  end
end
end # end of MultiXpi module

end # end of Mozilla module
