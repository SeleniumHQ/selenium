# C related tasks

require 'rake-tasks/files'

# Because this is created inside a main construct, accessors don't work shorthand
# So we'll define them long-hand and then revert to shorthand once we classify the
# files properly - Luke - Sep 2019
# attr_accessor :bitness

def bitness
  @bitness
end

def bitness=(value)
  @bitness = value
end


def dll(args)
  deps = build_deps_(args[:deps])
  result_array = Array(args[:out])

  result_array.each do |result|
    out = "build/#{result}"

    compile_file(out, deps, args)

    # TODO(simon): Yuck. Not Good Enough
    task args[:name].to_s => out
    task args[:out] => out
    Rake::Task[args[:name]].out = out.to_s
  end
end

def compile_file(out, deps, args)
  full_build_deps = "#{build_deps_(args[:src])}#{deps}"

  file out => full_build_deps do
    if out.end_with?('.dll')
      msbuild_legacy(args[:solution], out, args[:prebuilt])
    elsif out.end_with?('.so')
      is_32_bit = args[:arch] != 'amd64'
      self.bitness = is_32_bit
      gcc(args[:src], out, args[:args], args[:link_args], args[:prebuilt])
    else
      puts "Cannot compile #{args[:out]}"
      exit -1
    end
  end
end

def msbuild_legacy(solution, out, prebuilt)
  return copy_prebuilt(prebuilt, out) unless msbuild_installed?

  unless File.exist?(out)
    sh "MSBuild.exe #{solution} /verbosity:q /target:Rebuild /property:Configuration=Release /property:Platform=x64", verbose: false
    sh "MSBuild.exe #{solution} /verbosity:q /target:Rebuild /property:Configuration=Release /property:Platform=Win32", verbose: false
    copy_to_prebuilt(out, prebuilt)
  end
end

def gcc(srcs, out, args, link_args, prebuilt)
  return copy_prebuilt(prebuilt, out) unless gcc?

  obj_dir = "#{out}_temp/obj#{bitness}"

  mkdir_p obj_dir

  is_cpp_code = false
  srcs.each do |src|
    ok = gccbuild_c(src, obj_dir, args)
    return copy_prebuilt(prebuilt, out) unless ok
    is_cpp_code = true if src.end_with?('.cpp')
  end

  flags = "-Wall -shared  -fPIC -Os -fshort-wchar -m#{bitness}"
  flags += " #{link_args} " if link_args

  # if we've made it this far, try to link. If link fails, copy from prebuilt.
  linker = is_cpp_code ? 'g++' : 'gcc'
  linker_cmd = "#{linker} -o #{out} #{obj_dir}/*.o #{flags}"
  sh linker_cmd do |link_ok|
    return copy_prebuilt(prebuilt, out) unless link_ok
  end

  copy_to_prebuilt(out, prebuilt)

  rm_rf "#{out}_temp"
end

def gccbuild_c(src_file, obj_dir, args)
  compiler = src_file.end_with?('.c') ? 'gcc' : 'g++'
  objname = src_file.split('/')[-1].sub(/\.c[p{2}]*?$/, '.o')
  cmd = "#{compiler} #{src_file} -Wall -c -fshort-wchar -fPIC -o #{obj_dir}/#{objname} "
  cmd += " -m#{bitness}"
  cmd += args if args
  sh cmd do |ok|
    return puts 'Unable to build. Aborting compilation' unless ok
  end
  true
end
