
# Modify String to add start_with and end_with methods
if (!"".methods.include? :start_with)
  class String
    def start_with? (start)
      str = start.to_s
      self[0, str.length] == str
    end

    def end_with? (end_str)
      str = end_str.to_s
      self[-str.length, str.length] == str
    end
  end
end

module Platform
  def Platform.windows?
    (/mswin|msys|mingw32/ =~ RbConfig::CONFIG['host_os']) != nil
  end

  def windows?
   Platform.windows?
  end

  def mac?
    (/darwin|mac os/ =~ RbConfig::CONFIG['host_os']) != nil
  end

  def linux?
    (/linux/ =~ RbConfig::CONFIG['host_os']) != nil
  end

  def cygwin?
    RUBY_PLATFORM.downcase.include?("cygwin")
  end

  def Platform.dir_separator
    windows? ? "\\" : "/"
  end

  def Platform.env_separator
    windows? ? ";" : ":"
  end
end

class Tasks
  include Platform

  def task_name(dir, name)
    if name.to_s.start_with? "//"
      return name
    end

    # Strip any leading ".", "./" or ".\\"
    # I am ashamed
    use = dir.gsub /\\/, '/'
    use = use.sub(/^\./, '').sub(/^\//, '')

    "//#{use}:#{name}"    
  end  
  
  def add_dependencies(target, dir, all_deps)
    return if all_deps.nil?
    
    all_deps.each do |dep|
      target.enhance dep_type(dir, dep)
    end
  end
  
  def copy_prebuilt(fun, out)
    src = fun.find_prebuilt(out)
    
    mkdir_p File.dirname(out)
    cp src, out
  end
  
  def copy_all(dir, srcs, dest)
    if srcs.is_a? Array
      copy_array(dir, srcs, dest)
    elsif srcs.is_a? String
      copy_string(dir, srcs, dest)
    elsif srcs.is_a? Hash
      copy_hash(dir, srcs, dest)
    elsif srcs.is_a? Symbol
      copy_symbol(dir, srcs, dest)
    else
      raise StandardError, "Undetermined type: #{srcs.class}"
    end
  end
  
  def zip(src, dest)
    out = File.expand_path(dest)
    
    sh "cd #{src} && jar cMf #{out} *"
  end

  def to_filelist(dir, src)
    str = dir + "/" + src
    FileList[str].collect do |file|
      file.gsub("/", Platform.dir_separator)
    end
  end

  private
  def copy_string(dir, src, dest)
    if Rake::Task.task_defined? src
      from = Rake::Task[src].out
    else
      from = to_filelist(dir, src)
    end
    
    cp_r from, to_dir(dest), :remove_destination => true
  end
  
  def copy_symbol(dir, src, dest)
    from = Rake::Task[task_name(dir, src)].out
    
    if File.directory? from
      cp_r from, to_dir(dest)
    else
      mkdir_p File.dirname(dest)
      cp from, dest
    end
  end

  def copy_array(dir, src, dest)
    src.each do |item|
      if item.is_a? Hash
        copy_hash(dir, item, dest)
      elsif item.is_a? Array
        raise StandardError, "Undetermined type: #{item.class}"
      elsif item.is_a? String
        copy_string(dir, item, dest)
      elsif item.is_a? Symbol
        copy_symbol(dir, item, dest)
      else 
        raise StandardError, "Undetermined type: #{item.class}"
      end
    end
  end
  
  def copy_hash(dir, src, dest)
    src.each do |key, value|
      if key.is_a? Symbol
        copy_symbol(dir, key, dest + Platform.dir_separator + value)
      else
        cp_r dir + Platform.dir_separator + key, dest + Platform.dir_separator + value
      end
    end
    
  end
  
  def to_dir(name)
    if !File.exists? name
      mkdir_p name
    end
    name
  end
  
  def dep_type(dir, dep)
    if dep.is_a? String
      if (dep.start_with? "//")
        return [ dep ]
      else
        return to_filelist(dir, dep)
      end
    end
  
    if dep.is_a? Symbol
      return [ task_name(dir, dep) ]
    end
    
    if dep.is_a? Hash
      dep.each do |k, v|
        # We only care about the keys
        return dep_type(dir, k)
      end
    end
    
    throw "Unmatched dependency type: #{dep.class}"
  end
end
