
require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/checks.rb'

class MozillaMappings
  def add_all(fun)
    fun.add_mapping("mozilla_xpt", Mozilla::Xpt::CheckPreconditions.new)
    fun.add_mapping("mozilla_xpt", Mozilla::Xpt::CreateTask.new)
    fun.add_mapping("mozilla_xpt", Mozilla::Xpt::Compile.new)
    
    fun.add_mapping("mozilla_xpi", Mozilla::Xpi::CheckPreconditions.new)
    fun.add_mapping("mozilla_xpi", Mozilla::Xpi::CreateTask.new)
    fun.add_mapping("mozilla_xpi", Mozilla::Xpi::AddDependencies.new)
    fun.add_mapping("mozilla_xpi", Mozilla::Xpi::Build.new)
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

    xpt.gsub("/", Platform.dir_separator)
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
  
class Compile < BaseXpt
  def handle(fun, dir, args)
    xpt = xpt_name(dir, args)

    
    file xpt do
      puts "Building: #{task_name(dir, args[:name])} as #{xpt}"
     
      gecko = "third_party#{Platform.dir_separator}gecko-1.9.0.11#{Platform.dir_separator}"
      if (windows?)
        gecko += "win32"
      elsif (linux? or mac?)
        gecko += (linux? ? "linux" : "mac")
      else
	require 'rbconfig'
	puts "Platform is: #{RbConfig::CONFIG['host_os']}"
        # TODO(simon): Should just copy the prebuilt xpt
      end

      base_cmd = "#{gecko}#{Platform.dir_separator}bin#{Platform.dir_separator}xpidl"
      if (windows?)
        base_cmd += ".exe"
      end
      base_cmd += " -w -m typelib -I#{gecko}#{Platform.dir_separator}idl"

      src = dir + "/" + args[:srcs][0].gsub("/", Platform.dir_separator)

      out_dir = File.dirname(xpt)
      mkdir_p out_dir unless File.exists? out_dir

      dir_name = File.dirname(src)
      cmd = "#{base_cmd} -I#{dir_name} -e #{xpt} #{src}"
      sh cmd do |ok, res|
        if !ok
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

  def xpi_name(dir, name)
    xpi = task_name(dir, name)
    
    xpi = "build/" + (xpi.slice(2 ... xpi.length))
    xpi = xpi.sub(":", "/")
    xpi << ".xpi"

    xpi.gsub("/", Platform.dir_separator)
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
    xpi = xpi_name(dir, args[:name]) 
    
    file xpi
    
    desc "Build #{xpi}"
    task task_name  => xpi
    
    Rake::Task[task_name].out = xpi
  end
end
  
class AddDependencies < BaseXpi
  def handle(fun, dir, args)
    all_deps = []
    all_deps += args[:content] || []
    all_deps += args[:components] || []
    all_deps.push args[:chrome] unless args[:chrome].nil?
    all_deps.push args[:install] unless args[:install].nil?
    
    task = Rake::Task[xpi_name(dir, args[:name])]
    add_dependencies(task, dir, all_deps)
  end
end
  
class Build < BaseXpi
  def handle(fun, dir, args)
    xpi = xpi_name(dir, args[:name])
    
    file xpi do 
      puts "Preparing: #{task_name(dir, args[:name])} as #{xpi}"
      temp = xpi + "_temp"
      mkdir_p temp

      copy_all(dir, { args[:chrome] => "chrome.manifest" }, temp) unless args[:chrome].nil?
      copy_all(dir, { args[:install] => "install.rdf"}, temp) unless args[:install].nil?
      copy_all(dir, args[:content], temp + Platform.dir_separator + "content") unless args[:content].nil?
      copy_all(dir, args[:components], temp + Platform.dir_separator + "components") unless args[:components].nil?

      zip(temp, xpi)
      
      rm_rf temp
    end
  end
end
end # end of Xpi mofule
end
