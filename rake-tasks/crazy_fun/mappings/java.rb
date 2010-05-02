
require 'rake-tasks/crazy_fun/mappings/common'

class JavaMappings
  def add_all(fun)
    fun.add_mapping("java_library", CrazyFunJava::CheckPreconditions.new)
    fun.add_mapping("java_library", CrazyFunJava::CreateTask.new)
    fun.add_mapping("java_library", CrazyFunJava::CreateShortNameTask.new)
    fun.add_mapping("java_library", CrazyFunJava::AddDepedencies.new)
    fun.add_mapping("java_library", CrazyFunJava::TidyTempDir.new)
    fun.add_mapping("java_library", CrazyFunJava::Javac.new)
    fun.add_mapping("java_library", CrazyFunJava::CopyResources.new)
    fun.add_mapping("java_library", CrazyFunJava::Jar.new)
    fun.add_mapping("java_library", CrazyFunJava::TidyTempDir.new)
    
    fun.add_mapping("java_test", CrazyFunJava::CheckPreconditions.new)
    fun.add_mapping("java_test", CrazyFunJava::CreateTask.new)
    fun.add_mapping("java_test", CrazyFunJava::CreateShortNameTask.new)
    fun.add_mapping("java_test", CrazyFunJava::AddDepedencies.new)
    fun.add_mapping("java_test", CrazyFunJava::TidyTempDir.new)
    fun.add_mapping("java_test", CrazyFunJava::Javac.new)
    fun.add_mapping("java_test", CrazyFunJava::CopyResources.new)
    fun.add_mapping("java_test", CrazyFunJava::Jar.new)
    fun.add_mapping("java_test", CrazyFunJava::TidyTempDir.new)
    fun.add_mapping("java_test", CrazyFunJava::RunTests.new)
  end
end

module CrazyFunJava
  
class BaseJava < Tasks
      
  def jar_name(dir, name)
    name = task_name(dir, name)
    jar = "build/" + (name.slice(2 ... name.length))
    jar = jar.sub(":", "/")
    jar << ".jar"

    jar.gsub("/", Platform.dir_separator)
  end

  def temp_dir(dir, name)
    jar_name(dir, name) + "_temp"
  end
  
  def class_name(file_name)
    paths = file_name.split(Platform.dir_separator)
    
    while !paths.empty? 
      # This is a fairly arbitrary list of TLDs
      if paths[0] =~ /com|org|net|uk|de/
        break
      end
      paths.shift
    end
    
    paths[-1] = paths[-1].sub /\.(class|java)$/, ""
    
    paths.join(".")
  end
end
  
class FailedPrecondition < StandardError
end
  
class CheckPreconditions
  def handle(fun, dir, args)
    if args[:name].nil?
      raise FailedPrecondition, ":name property must be set" 
    end
    
    if args[:srcs].nil? and args[:deps].nil?
      raise FailedPrecondition, "At least one of :srcs or :deps must be set"
    end
  end
end

class CreateTask < BaseJava
  def handle(fun, dir, args)
    task task_name(dir, args[:name])
    
    if args[:srcs]
      file jar_name(dir, args[:name])
    end
  end
end

class CreateShortNameTask < BaseJava
  def handle(fun, dir, args)
    name = task_name(dir, args[:name])
    
    if (name.end_with? "#{args[:name]}:#{args[:name]}")
      name = name.sub(/:.*$/, "")
      task name => task_name(dir, args[:name])
      
      if (!args[:srcs].nil?)
        Rake::Task[name].out = jar_name(dir, args[:name])
      end
    end
  end
end

class AddDepedencies < BaseJava
  def handle(fun, dir, args)
    # What are we adding the dependencies to? If we have a :src arg,
    # use the jar, otherwise use the target name.
    target_name = args[:srcs].nil? ? task_name(dir, args[:name]) : jar_name(dir, args[:name])
    target = Rake::Task[target_name]
    add_dependencies(target, dir, args[:deps])
    add_dependencies(target, dir, args[:srcs])
    add_dependencies(target, dir, args[:resources])
  end
end

class TidyTempDir < BaseJava
  def handle(fun, dir, args)
    return if args[:srcs].nil?
    
    file jar_name(dir, args[:name]) do
      rm_rf temp_dir(dir, args[:name])
    end
  end
end

class Javac < BaseJava
  def handle(fun, dir, args)
    return if args[:srcs].nil?
    
    jar = jar_name(dir, args[:name])
    out_dir = temp_dir(dir, args[:name])
    
    file jar do
      puts "Compiling: #{task_name(dir, args[:name])} as #{jar}"
      
      mkdir_p out_dir
      
      cp = ClassPath.new(jar_name(dir, args[:name]))
      
      cmd = "javac -target 5 -source 5 "
      cmd << "-d #{out_dir} "
      cmd << "-cp " + cp.to_s + " " unless cp.empty?

      args[:srcs].each do |src|
        cmd << to_filelist(dir, src).join(" ")
        cmd << " "
      end

      sh cmd
    end
    
    desc "Build #{jar}"
    task task_name(dir, args[:name]) => jar
    
    Rake::Task[task_name(dir, args[:name])].out = jar
  end
end

class CopyResources < BaseJava
  def handle(fun, dir, args)
    if (args[:resources].nil?)
      return
    end
    
    file jar_name(dir, args[:name]) do
      out_dir = temp_dir(dir, args[:name])
      
      args[:resources].each do |res|
        if (res.is_a? Symbol)
          out = Rake::Task[task_name(dir, res)].out
        elsif (Rake::Task.task_defined?(res)) 
          out = Rake::Task[res].out
        elsif (res.is_a? Hash)
          # Copy the key to "out_dir + value"
          res.each do |from, to|
            if from.is_a? Symbol
              cp Rake::Task[task_name(dir, from)].out, out_dir + "/" + to;
            else
              Dir["#{out_dir}/#{to}/**.svn"].each { |file| rm_rf file }
              tdir = to.gsub(/\/.*?$/, "")
              mkdir_p "#{out_dir}/#{tdir}"
            
              begin
                if File.directory? from
                  mkdir_p "#{out_dir}/#{to}"
                end
                cp_r find_file(dir + "/" + from), "#{out_dir}/#{to}"
              rescue
                Dir["#{out_dir}/**/.svn"].each { |file| rm_rf file }
                cp_r find_file(dir + "/" + from), "#{out_dir}/#{to}"
              end
            end
          end
          
          next
        else
          out = res
        end
        
        cp_r out, out_dir
      end
    end
  end
end

class Jar < BaseJava
  def handle(fun, dir, args)
    return if args[:srcs].nil?

    jar = jar_name(dir, args[:name])

    file jar do
      zip(temp_dir(dir, args[:name]), jar)
    end
  end
end

class RunTests < BaseJava
  def handle(fun, dir, args)
#    raise FailedPrecondition, "java_test targets need :srcs defined" if args[:srcs].nil || ar?
    
    task_name = task_name(dir, args[:name])
    
    desc "Run the tests for #{task_name}"
    task "#{task_name}:run" => [task_name] do
      # Find the list of tests
      tests = [] 
      (args[:srcs] || []).each do |src|
        srcs = to_filelist(dir, src).each do |f|
          tests.push f if f.to_s =~ /TestSuite\.java$/
        end
      end
      
      cp = ClassPath.new(task_name)
      cp.push jar_name(dir, args[:name])
      
      tests = args[:class].nil? ? tests : "#{args[:class]}.java"
      
      tests.each do |test|
        cmd = "java -Xmx128m -Xms128m "
        cmd << '-cp ' + cp.to_s
        cmd << " junit.textui.TestRunner "
        cmd << class_name(test)
        
        sh cmd
      end
    end
  end
end

class ClassPath
  def initialize(task_name)
    t = Rake::Task[task_name]
    
    all = build_classpath([], t)
    @cp = []
    all.each do |jar|
      if jar.is_a? String
        @cp.push jar
      else
        @cp += jar
      end
    end
    @cp = @cp.sort.uniq
  end

  def length
    @cp.length
  end
  
  def empty?
    length == 0
  end
  
  def push(jar)
    @cp.push jar
  end
  
  def to_s
    @cp.join(Platform.env_separator)
  end
  
  private 
  
  def build_classpath(cp, dep)
    dep.prerequisites.each do |dep|
      if dep.to_s =~ /\.jar$/
        cp.push dep
      end
      
      if Rake::Task.task_defined? dep
        build_classpath(cp, Rake::Task[dep])
      end
    end
    
    cp
  end
end


end # End of java module