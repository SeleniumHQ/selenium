def find_file(file)
  puts "Copying #{file}" if $DEBUG
  
  if Rake::Task.task_defined?(file) and Rake::Task[file].out
    # Grab the "out" of the task represented by this symbol
    t = Rake::Task[file]
    file = t.out
  end
  
  if (file.is_a? Symbol)
    file = file.to_s
  end
  
  if File.exists?(file)
    return file
  elsif File.exists?("build/#{file}")
    return "build/#{file}"
  else
    fl = FileList.new(file).existing!()
    if fl.length > 0
      return fl
    end

    fl = FileList.new("build/#{file}").existing!()
    if fl.length > 0
      return fl
    end

    puts "Unable to locate #{file}"
    exit -1
  end
end

def copy_single_resource_(from, to)
  dir = to.sub(/(.*)\/.*?$/, '\1')
  mkdir_p "#{dir}"

  from = find_file(from)
  if from.kind_of? FileList
    from.each do |f|
      cp_r f, "#{to}", :remove_destination => true 
    end
  else
    cp_r from, "#{to}", :remove_destination => true 
  end
end

def copy_resource_(from, to)
  if !from.nil? 
    if (from.kind_of? Hash) 
      from.each do |key,value|
        copy_single_resource_ key, to + "/" + value
      end
    elsif (from.kind_of? Array)
      from.each do |res|
        copy_resource_ res, to
      end
    else
      copy_single_resource_ from, to
    end
  end
end

def copy_prebuilt(prebuilt, out)
  dir = out.split('/')[0..-2].join('/') 

  if prebuilt.nil?
    mkdir_p dir
    File.open(out, 'w') {|f| f.write('')}    
  elsif File.directory? prebuilt
    from = prebuilt + "/" + out
    from = from.sub(/\/build\//, "/")

    if (File.exists?(from))
      puts "Falling back to copy of: #{from}"
      mkdir_p dir
      if File.directory? from
        cp_r from + "/.", out
      else
        cp_r from, out
      end
    else
      puts "Unable to locate prebuilt copy of #{out}"
    end
  elsif File.exists?(prebuilt)
    puts "Falling back to copy of: #{prebuilt}"
    mkdir_p dir
    cp prebuilt, out
  else
    puts "Unable to locate prebuilt copy of #{out}"
  end
end

def copy_to_prebuilt(out, prebuilt)
  dest = "#{prebuilt}/#{out}".sub(/\/build\//, "/")
  src = out

  if File.directory? src
    cp_r src + "/.", dest
  else
    if File.exist? prebuilt
      cp src, prebuilt
    else
      cp src, dest
    end
  end
end
