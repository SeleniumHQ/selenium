require "rake-tasks/files.rb"

def xpt(args)
  deps = build_deps_(args[:deps])

  args[:out].each do |result|
    out = "build/#{result}"

    file out => build_deps_(args[:src]) + deps do
      build_xpt(args[:src], out, args[:prebuilt])
    end
    task "#{args[:name]}" => out
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
  if !jar?
    puts "Unable to find jar. This is used to pack the archive"
    exit -1
  end

  deps = build_deps_(args[:deps])

  # if the src arg is a directory, depend on everything in it
  args[:src].each do |src|
    if (File.directory?(src))
      deps += FileList.new(src + "**/*")
    else
      deps += FileList.new(src)
    end
  end

  # Check if any of the resources are a list of src files. If so, add a
  # dependency on them and update the resource hash accordingly
  expanded_resources = []
  args[:resources].each do |res|
    if !res.nil?
      if (res.kind_of? Hash)
        res.each do |key,value|
          fl = File.directory?(key) ?
              FileList.new(key + "**/*") : FileList.new(key)
          if fl.existing!().length > 0
            if (value =~ /\/$/).nil?
              raise "File list resource must map to directory: (#{key}, #{value})"
            end
            deps += fl
            fl.each do |f|
              expanded_resources += [{f => value}]
            end
          else
            expanded_resources += [{key => value}]
          end
        end
      end
    end
  end
  args[:resources] = expanded_resources

  file "build/#{args[:out]}" => deps do
    # Set up a temporary directory
    target = "build/#{args[:out]}.temp"
    if (File.exists?(target))
      rm_rf target
    end
    mkdir_p target, :verbose => false
  
    # Copy the sources into it
    args[:src].each do |src|
      cp_r "#{src}/.", target, :verbose => false
    end
  
    # Copy the resources into the desired location
    args[:resources].each do |res|
      copy_resource_(res, target)
    end
  
    # Package up into the output file
    rm_r Dir.glob("#{target}/**/.svn")
    sh "cd #{target} && jar cMf ../#{args[:out]} *", :verbose => false
    rm_r target
  end
  task args[:name] => "build/#{args[:out]}"
end
