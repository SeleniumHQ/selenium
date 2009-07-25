def find_file(file) 
  if File.exists?(file)
    return file
  elsif File.exists?("build/#{file}")
    return "build/#{file}"
  else
    puts "Unable to locate #{file}"
    exit -1
  end
end

def copy_single_resource_(from, to)
  dir = to.sub(/(.*)\/.*?$/, '\1')
  mkdir_p "#{dir}"
  
  cp_r find_file(from), "#{to}"
end

def copy_resource_(from, to)
  if !from.nil? 
    if (from.kind_of? Hash) 
      from.each do |key,value|
        copy_single_resource_ key, to + "/" + value
      end
    end
  end
end

def xpt(args)
  deps = build_deps_(args[:deps])
  
  args[:out].each do |result|
    out = "build/#{result}"
  
    file out => build_deps_(args[:src]) + deps do
      build_xpt(args[:src], out)
    end
    task "#{args[:name]}" => out
  end
end

def build_xpt(srcs, out)
  if (windows?)
    gecko = "third_party\\gecko-1.9.0.11\\win32"
    srcs.each do |src|
      cmd = "#{gecko}\\bin\\xpidl.exe -w -m typelib -I#{gecko}\\idl -e #{out} #{src}"
      sh cmd, :verbose => false
    end
  else
    puts "Doing nothing for now. Later revisions will enable xpt building. Creating stub for #{out}"
    File.open("#{out}", 'w') {|f| f.write("")}
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
  
  file "build/#{args[:out]}" => deps do
    # Set up a temporary directory
    target = "build/#{args[:out]}.temp"
    if (File.exists?(target)) 
      rm_rf target
    end
    mkdir_p target
  
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
    sh "cd #{target} && jar cMf ../#{args[:out]} *", :verbose => true
    rm_r target
  end
  task args[:name] => "build/#{args[:out]}"
end
