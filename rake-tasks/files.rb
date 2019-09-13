def find_file(file)
  puts "Copying #{file}" if $DEBUG

  if Rake::Task.task_defined?(file) && Rake::Task[file].out
    # Grab the "out" of the task represented by this symbol
    file = Rake::Task[file].out.to_s
  end

  if File.exist?(file)
    file
  elsif File.exist?("build/#{file}")
    "build/#{file}"
  else
    fl = FileList.new(file).existing!
    return fl unless fl.empty?

    fl = FileList.new("build/#{file}").existing!
    return fl unless fl.empty?

    puts "Unable to locate #{file}"
    exit -1
  end
end

def copy_single_resource_(from, to)
  dir = to.sub(/(.*)\/.*?$/, '\1')
  mkdir_p dir.to_s

  from = find_file(from)
  if from.is_a? FileList
    from.each do |f|
      cp_r f, to.to_s, remove_destination: true
    end
  else
    cp_r from, to.to_s, remove_destination: true
  end
end

def copy_resource_(from, to)
  return if from.nil?

  if from.is_a? Hash
    from.each do |key, value|
      copy_single_resource_ key, "#{to}/#{value}"
    end
  elsif from.is_a? Array
    from.each do |res|
      copy_resource_ res, to
    end
  else
    copy_single_resource_ from, to
  end
end

def copy_prebuilt(prebuilt, out)
  dir = out.split('/')[0..-2].join('/')

  if prebuilt.nil?
    mkdir_p dir
    File.open(out, 'w') { |f| f.write('') }
  elsif File.directory? prebuilt
    from = "#{prebuilt}/#{out}".sub(/\/build\//, '/')

    if File.exist?(from)
      puts "Falling back to copy of: #{from}"
      mkdir_p dir
      if File.directory? from
        cp_r "#{from}/.", out
      else
        cp_r from, out
      end
    else
      puts "Unable to locate prebuilt copy of #{out}"
    end
  elsif File.exist?(prebuilt)
    puts "Falling back to copy of: #{prebuilt}"
    mkdir_p dir
    cp prebuilt, out
  else
    puts "Unable to locate prebuilt copy of #{out}"
  end
end

def copy_to_prebuilt(src, prebuilt)
  dest = "#{prebuilt}/#{src}".sub(/\/build\//, '/')

  if File.directory?(src)
    cp_r "#{src}/.", dest
  else
    if File.exist?(prebuilt)
      cp src, prebuilt
    else
      cp src, dest
    end
  end
end
