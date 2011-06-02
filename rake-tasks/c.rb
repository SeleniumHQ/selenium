# C related tasks

require "rake-tasks/files.rb"

def dll(args)
  deps = build_deps_(args[:deps])
  
  Array(args[:out]).each do |result|
    out = "build/#{result}"
  
    file out => build_deps_(args[:src]) + deps do
      if (out =~ /\.dll$/)
        msbuild_legacy(args[:solution], out, args[:prebuilt])
      elsif (out =~ /\.so$/) 
        is_32_bit = "amd64" != args[:arch]
        gcc(args[:src], out, args[:args], args[:link_args], is_32_bit, args[:prebuilt])
      else
        puts "Cannot compile #{args[:out]}"
        exit -1
      end
    end
    
    # TODO(simon): Yuck. Not Good Enough
    task "#{args[:name]}" => out
    task args[:out] => out
    Rake::Task[args[:name]].out = "#{out}"
  end
end

def msbuild_legacy(solution, out, prebuilt)
  if msbuild_installed?
    if (!File.exists? out) then
      sh "MSBuild.exe #{solution} /verbosity:q /target:Rebuild /property:Configuration=Release /property:Platform=x64", :verbose => false
      sh "MSBuild.exe #{solution} /verbosity:q /target:Rebuild /property:Configuration=Release /property:Platform=Win32", :verbose => false
      copy_to_prebuilt(out, prebuilt)
    end
  else
    copy_prebuilt(prebuilt, out)
  end
end

def gcc(srcs, out, args, link_args, is_32_bit, prebuilt)
  if !gcc?
    copy_prebuilt(prebuilt, out)
    return
  end

  obj_dir = "#{out}_temp/obj" + (is_32_bit ? "32" : "64")

  mkdir_p obj_dir

  is_cpp_code = false
  srcs.each do |src|
    ok = gccbuild_c(src, obj_dir, args, is_32_bit)
    if (!ok)
      copy_prebuilt(prebuilt, out)
      return
    end
    if (src =~ /\.cpp$/)
      is_cpp_code = true
    end
  end

  flags = "-Wall -shared  -fPIC -Os -fshort-wchar "
  flags += (is_32_bit ? "-m32 " : "-m64 ")
  flags += " " + link_args + " " if link_args

  # if we've made it this far, try to link. If link fails,
  # copy from prebuilt.
  linker = is_cpp_code ? "g++" : "gcc"
  linker_cmd = "#{linker} -o #{out} #{obj_dir}/*.o #{flags}"
  sh linker_cmd do |link_ok, res|
    if (!link_ok)
      copy_prebuilt(prebuilt, out)
      return
    end
  end

  copy_to_prebuilt(out, prebuilt)

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

