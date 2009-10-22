def find_file(file) 
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
  mkdir_p "#{dir}", :verbose => false

  from = find_file(from)
  if from.kind_of? FileList
    from.each do |f|
      cp_r f, "#{to}"
    end
  else
    cp_r from, "#{to}"
  end
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

def copy_prebuilt(prebuilt, out)
  dir = out.split('/')[0..-2].join('/') 

  if prebuilt.nil?
    mkdir_p dir, :verbose => false
    File.open(out, 'w') {|f| f.write('')}    
  elsif File.directory? prebuilt
    from = prebuilt + "/" + out
    from = from.sub(/\/build\//, "/")
    if (File.exists?(from))
      puts "Falling back to copy of: #{out}"
      mkdir_p dir, :verbose => false
      cp_r from, out
    else
      puts "Unable to locate prebuilt copy of #{out}"
    end
  else
    puts "Unable to locate prebuilt copy of #{out}"
  end
end

def copy_to_prebuilt(out, prebuilt)
  dest = "#{prebuilt}/#{out}".sub(/\/build\//, "/")
  src = out

  cp src, dest
end
