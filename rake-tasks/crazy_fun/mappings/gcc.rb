require 'rake-tasks/crazy_fun/mappings/common'
require 'rake-tasks/checks.rb'

class GccMappings
  def add_all(fun)
    fun.add_mapping("gcc_library", Gcc::CheckPreconditions.new)
    fun.add_mapping("gcc_library", Gcc::CreateTask.new)
    fun.add_mapping("gcc_library", Gcc::Build.new)
    fun.add_mapping("gcc_library", Gcc::CopyOutputToPrebuilt.new)

    # For building binary components of the extension.
    fun.add_mapping("mozilla_lib", Gcc::MozBinary::CheckPreconditions.new)
    fun.add_mapping("mozilla_lib", Gcc::MozBinary::CreateTask.new)
    fun.add_mapping("mozilla_lib", Gcc::MozBinary::AddDependencies.new)
    fun.add_mapping("mozilla_lib", Gcc::MozBinary::Build.new)
    fun.add_mapping("mozilla_lib", Gcc::CopyOutputToPrebuilt.new)
  end
end

module Gcc

def Gcc::out_name(dir, args)
  File.join("build", dir, args[:arch], "lib" + args[:name] + ".so")
end

class BaseGcc < Tasks
  include Platform

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

    flags = "-shared  -Os "
    flags += (is_32_bit ? "-m32 " : "-m64 ")
    flags += " " + link_args + " " if link_args

    # if we've made it this far, try to link. If link fails,
    # copy from prebuilt.
    linker = is_cpp_code ? "g++" : "gcc"
    linker_cmd = "#{linker} -o #{out} #{obj_dir}/*.o #{flags}" 
    sh linker_cmd do |link_ok, res|
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
    cmd = "#{compiler} #{src_file} -c -o #{obj_dir}/#{objname} "
    cmd += (is_32_bit ? " -m32" : " -m64")
    cmd += " " + args if args
    sh cmd do |ok, res|
      if !ok
        puts "Unable to build. Aborting compilation"
        return false
      end
    end
    true
  end
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

class Build < BaseGcc
  def handle(fun, dir, args)
    out = Gcc::out_name(dir, args)
    default_flags = "-fPIC -Wall"
    compiler_args = [args[:args], default_flags].join " "
    linker_args = [args[:link_args], default_flags].join " "

    file out do
      puts "Compiling: #{task_name(dir, args[:name])} as #{out}"
      is_32_bit = "amd64" != args[:arch]
      gcc(fun, dir, args[:srcs], compiler_args, linker_args, out, is_32_bit)
    end
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

module MozBinary

def MozBinary::gecko_sdk_path(args)
  if args[:arch] == "i386"
    plat = "linux"
  else
    plat = "linux64"
  end

  return "third_party/gecko-#{args[:geckoversion]}/#{plat}"
end

class CheckPreconditions
  def handle(fun, dir, args)
    if args[:arch] and !(args[:arch] == "i386" or args[:arch] == "amd64")
      raise StandardError, "arch must be i386 or amd64"
    end

    if not args[:geckoversion]
      raise StandardError, "Gecko SDK version must be specified."
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

class AddDependencies < Tasks
  def handle(fun, dir, args)
    # Get the output file of this task
    out_task = Rake::Task[task_name(dir, args[:name])].out

    gecko_deps = MozBinary::gecko_sdk_path args
    # Make the *output file* depend on the Gecko SDK, not this
    # task itself
    file out_task.to_sym => gecko_deps
  end
end

class Build < BaseGcc
  include Platform

  def handle(fun, dir, args)
    out = Gcc::out_name(dir, args)
    gecko_sdk = MozBinary::gecko_sdk_path args
    gecko_sdk += Platform.dir_separator
    xpcom_lib = args[:xpcom_lib] || "xpcomglue_s_nomozalloc"

    file out do
      puts "Compiling an xpcom component: #{task_name(dir, args[:name])} as #{out}"
      is_32_bit = "amd64" != args[:arch]
      # g++ 2.6 and below need c++0x, above needs c++11
      begin
        std = `g++ --version`.split("\n")[0].split()[-1].split(".")[1].to_i > 6 ? "11" : "0x"
      rescue
        std = ""
      end
      base_compiler_args = "-Wall -fPIC -fshort-wchar -std=c++#{std} -Dunix -D__STDC_LIMIT_MACROS -I cpp/webdriver-interactions -I cpp/imehandler/common -I #{gecko_sdk}include -I #{gecko_sdk}include/nspr " + "`pkg-config gtk+-2.0 --cflags`"
      if (args[:geckoversion].to_i < 29)
        base_compiler_args += " -DWEBDRIVER_LEGACY_GECKO"
      end
      if (args[:geckoversion].to_i < 31)
        base_compiler_args += " -DWEBDRIVER_GECKO_USES_ISUPPORTS1"
      end
      compiler_args = [args[:args], base_compiler_args].join " "
      if (args[:geckoversion].to_i < 22)
        linker_args = "-Wall -fshort-wchar -fno-rtti -fno-exceptions -shared -fPIC -L#{gecko_sdk}lib -L#{gecko_sdk}bin -Wl,-rpath-link,#{gecko_sdk}bin -l#{xpcom_lib} -lxpcom -lnspr4 -lrt `pkg-config gtk+-2.0 --libs`"
      else
        linker_args = "-Wall -fshort-wchar -fno-rtti -fno-exceptions -shared -fPIC -L#{gecko_sdk}lib -L#{gecko_sdk}bin -Wl,-rpath-link,#{gecko_sdk}bin -l#{xpcom_lib} -lnss3 -lrt `pkg-config gtk+-2.0 --libs`"
      end
      gcc(fun, dir, args[:srcs], compiler_args, linker_args, out, is_32_bit)
    end
  end
end # End Build class

end # end of MozBinary module

end # end module Gcc
