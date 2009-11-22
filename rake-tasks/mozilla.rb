require "rake-tasks/files.rb"

class Mozilla < BaseGenerator
  def xpi(args)
    if !jar?
      puts "Unable to find jar. This is used to pack the archive"
      exit -1
    end
    
    create_deps_("build/#{args[:out]}", args)
    
    file "build/#{args[:out]}" do
      puts "Building #{args[:name]} as build/#{args[:out]}"
      # Set up a temporary directory
      target = "build/#{args[:out]}.temp"
      if (File.exists?(target))
        rm_rf target, :verbose => false
      end
      mkdir_p target, :verbose => false

      # Copy the sources into it
      FileList[args[:srcs]].each do |src|
        cp_r "#{src}", target, :verbose => false
      end

      # Copy the resources into the desired location
      args[:resources].each do |res|
        copy_resource_(res, target)
      end

      # Package up into the output file
      rm_r Dir.glob("#{target}/**/.svn"), :verbose => false
      sh "cd #{target} && jar cMf ../#{args[:out]} *", :verbose => false
      rm_r target, :verbose => false
    end
  end
end


def xpt(args)
  deps = build_deps_(args[:deps])

  Array(args[:out]).each do |result|
    out = "build/#{result}"

    file out => build_deps_(args[:src]) + deps do
      puts "Building #{args[:name]} as #{out}"
      build_xpt(args[:src], out, args[:prebuilt])
    end
    task "#{args[:name]}" => out
    Rake::Task[args[:name]].out = out
  end
end

def build_xpt(srcs, out, prebuilt)
  gecko = "third_party#{File::SEPARATOR}gecko-1.9.0.11#{File::SEPARATOR}"
  if (windows?)
    gecko += "win32"
  elsif (linux? or mac?)
    gecko += (linux? ? "linux" : "mac")
  else
    puts "Doing nothing for now. Later revisions will enable xpt building. Creating stub for #{out}"
    File.open("#{out}", 'w') {|f| f.write("")}
    return
  end

  base_cmd = "#{gecko}#{File::SEPARATOR}bin#{File::SEPARATOR}xpidl"
  if (windows?)
    base_cmd += ".exe"
  end
  base_cmd += " -w -m typelib -I#{gecko}#{File::SEPARATOR}idl"

  srcs.each do |src|
    dir_name = File.dirname(src)
    cmd = "#{base_cmd} -I#{dir_name} -e #{out} #{src}"
    sh cmd, :verbose => false do |ok, res|
      if !ok
        copy_prebuilt(prebuilt, out)
      else
        copy_to_prebuilt(out, prebuilt)
      end
    end
  end

end

def xpi(args)
  Mozilla.new().xpi(args)
end

