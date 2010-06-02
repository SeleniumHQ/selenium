require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/checks.rb'

class GccMappings
  def add_all(fun)
    fun.add_mapping("gcc_library", Gcc::CheckPreconditions.new)
    fun.add_mapping("gcc_library", Gcc::CreateTask.new)
    fun.add_mapping("gcc_library", Gcc::Build.new)
    fun.add_mapping("gcc_library", Gcc::CopyOutputToPrebuilt.new)
  end
end

module Gcc

def Gcc::out_name(dir, args)
  File.join("build", dir, args[:arch], "lib" + args[:name] + ".so")
end

class CheckPreconditions
  def handle(fun, dir, args)
    if args[:arch] and !(args[:arch] == "i386" or args[:arch] == "amd64")
      raise StandardError, "arch must be i386 or amd64"
    end
    
    raise StandardError, "No srcs specified" unless args[:srcs]
  end
end

class CreateTask < Tasks
  def handle(fun, dir, args)
    name = task_name(dir, args[:name])
    out = Gcc::out_name(dir, args)
    
    task name => out
    Rake::Task[name].out = out
    args[:srcs].each do |src|
      file out => FileList[src]
    end
    
    if (name.end_with? "#{args[:name]}:#{args[:name]}")
      name = name.sub(/:.*$/, "")
      task name => task_name(dir, args[:name])
      Rake::Task[name].out = out(dir, args)
    end    
  end
end

class Build < Tasks
  def handle(fun, dir, args)
    out = Gcc::out_name(dir, args) 
    
    file out do
      puts "Compiling: #{task_name(dir, args[:name])} as #{out}"
      is_32_bit = "amd64" != args[:arch]
      gcc(fun, dir, args[:srcs], args[:args], args[:link_args], out, is_32_bit)
    end
  end
  
  def gcc(fun, dir, srcs, args, link_args, out, is_32_bit)
    if !gcc?
      copy_prebuilt(fun, out)
      return
    end

    obj_dir = "#{out}_temp/obj" + (is_32_bit ? "32" : "64")

    mkdir_p obj_dir

    is_cpp_code = false
    srcs.each do |src|
      FileList.new(File.join(dir, src)).each do |f|
        ok = gccbuild_c(f, obj_dir, args, is_32_bit)
        if (!ok)
          copy_prebuilt(fun, out)
          return
        end
        if (src =~ /\.cpp$/)
          is_cpp_code = true
        end
      end
    end

    flags = "-Wall -shared  -fPIC -Os -fshort-wchar "
    flags += (is_32_bit ? "-m32 " : "-m64 ")
    flags += " " + link_args + " " if link_args

    # if we've made it this far, try to link. If link fails,
    # copy from prebuilt.
    linker = is_cpp_code ? "g++" : "gcc"
    sh "#{linker} -o #{out} #{obj_dir}/*.o #{flags}" do |link_ok, res|
      if (!link_ok)
        copy_prebuilt(fun, out)
        return
      end
    end

    rm_rf "#{out}_temp"
  end

  def gccbuild_c(src_file, obj_dir, args, is_32_bit)
    compiler = src_file =~ /\.c$/ ? "gcc" : "g++"
    objname = src_file.split('/')[-1].sub(/\.c[p{2}]*?$/, ".o")
    cmd = "#{compiler} #{src_file} -Wall -c -fshort-wchar -fPIC -o #{obj_dir}/#{objname} "
    cmd += (is_32_bit ? " -m32" : " -m64")
    cmd += args if args
    sh cmd do |ok, res|
      if !ok
        puts "Unable to build. Aborting compilation"
        return false
      end
    end
    true
  end
end

class CopyOutputToPrebuilt < Tasks
  def handle(fun, dir, args)
    out = Gcc::out_name(dir, args)
    
    file out do
      dest = fun.find_prebuilt(out)
      cp out, dest
    end
  end
end

end
