require 'antwrap'
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
    fun.add_mapping("java_library", CrazyFunJava::RunBinary.new)
    fun.add_mapping("java_library", CrazyFunJava::CreateSourceJar.new)
    fun.add_mapping("java_library", CrazyFunJava::CreateUberJar.new)
    fun.add_mapping("java_library", CrazyFunJava::CreateProjectJar.new)

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
    fun.add_mapping("java_test", CrazyFunJava::CreateSourceJar.new)
  end
end

# Monkey-patch ant wrap so it works with where we store ant
module Antwrap
  module AntwrapClassLoader
    def load_ant_libs(ant_home)
      jars = match(ant_home) {|p| ext = p[-4...p.size]; ext && ext.downcase == '.jar'} 
      jars.push 'third_party/java/eclipse_compiler/ecj-3.5.2.jar'
      jars.push 'third_party/java/junit/junit-dep-4.8.1.jar'
      
      if(RUBY_PLATFORM == 'java')
        jars.each {|jar| require jar }
      else
        Rjb::load(jars.join(File::PATH_SEPARATOR), [])
      end
    end
    
    module_function :load_ant_libs
  end
end

module CrazyFunJava
  @ant = Antwrap::AntProject.new(:name => 'selenium', 
    :ant_home => 'third_party/java/ant', :basedir => '.')
  @ant.project.setProperty('XmlLogger.file', 'build/build_log.xml')
  @ant.project.setProperty('build.compiler', 'org.eclipse.jdt.core.JDTCompilerAdapter');
  @ant.taskdef(:name => 'jarjar', :classname => 'com.tonicsystems.jarjar.JarJarTask',
               :classpath => 'third_party/java/jarjar/jarjar-1.0.jar')

  # Silence logging to the console, and output to the xml build file
  @ant.project.getBuildListeners().get(0).setMessageOutputLevel(verbose ? 2 : 0)

  def self.import(class_name)
    if RUBY_PLATFORM == 'java'
      clazz = include_class(class_name)
    else
      clazz = Rjb::import(class_name)
    end
    clazz
  end

  logger = CrazyFunJava::import('org.apache.tools.ant.XmlLogger').new
  logger.setMessageOutputLevel(2)
  logger.buildStarted(nil)
  
  at_exit do
    if File.exists? 'build'
      final_event = CrazyFunJava::import('org.apache.tools.ant.BuildEvent').new(@ant.project)
      logger.buildFinished(final_event)
    end
  end
  @ant.project.addBuildListener(logger)

  def self.ant
    @ant
  end
  
class BaseJava < Tasks
      
  def jar_name(dir, name)
    name = task_name(dir, name)
    jar = "build/" + (name.slice(2 ... name.length))
    jar = jar.sub(":", "/")
    jar << ".jar"

    jar.gsub("/", Platform.dir_separator)
  end

  def custom_name(dir, name, custom)
    name = task_name(dir, name)
    jar = "build/" + (name.slice(2 ... name.length)) + "-" + custom
    jar = jar.sub(":", "/")
    jar << ".jar"

    jar.gsub("/", Platform.dir_separator)
  end

  def temp_dir(dir, name)
    jar_name(dir, name) + "_temp"
  end
  
  def package_name(file)
    fragments = file.gsub('\\', '/').split("/")
    while fragments[0] and /^(com|net|org|uk|de)$/.match(fragments[0]).nil?
      fragments.shift
    end
    fragments[0 .. -2].join("/")
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
  
  def ant_java_task(task_name, classname, classpath, args = nil)
    # Ugly. We do this because CrazyFunJava.ant.java complains about too many arguments 
    path = Java.org.apache.tools.ant.types.Path.new(CrazyFunJava.ant.project)      
    classpath.all.each do |jar|
      elem = path.createPathElement()
      elem.setPath(jar)
      path.add(elem)
    end

    task = Java.org.apache.tools.ant.taskdefs.Java.new()
    task.setProject(CrazyFunJava.ant.project)
    task.setTaskName(task_name)
    task.setFork(true)
    task.setClassname(classname)
    task.setClasspath(path)
    
    if (args)
      arg = task.createArg()
      arg.setLine(args)
    end
    
    task.execute()
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
    else
      task jar_name(dir, args[:name])
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

    if (args[:srcs].nil?)
      target_name = jar_name(dir, args[:name])
      target = Rake::Task[target_name]
      add_dependencies(target, dir, args[:deps])
      add_dependencies(target, dir, args[:resources])
    end

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
      
      cp = ClassPath.new(jar_name(dir, args[:name])).all
      
      # Compile
      CrazyFunJava.ant.path(:id => "#{args[:name]}.path") do |ant|
        cp.each do |jar|
          ant.pathelement(:location => jar)
        end
      end
      CrazyFunJava.ant.javac(:srcdir => '.', :destdir => out_dir, :includeAntRuntime => false, 
			     :optimize => true, :debug => true, :nowarn => true,
			     :source => '1.5', :target => '1.5') do |ant|
        ant.classpath(:refid => "#{args[:name]}.path")
        args[:srcs].each do |src_glob|
          ant.include(:name => [dir, src_glob].join(File::SEPARATOR))
        end
      end
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
            possible_task = task_name(dir, from)
            if Rake::Task.task_defined?(possible_task) and Rake::Task[possible_task].out
              target = Rake::Task[possible_task].out
              
              if File.directory? target
                dest = File.join(out_dir, to)
                mkdir_p dest
                cp_r target, dest
              else
                dest = File.join(out_dir, to)
                mkdir_p File.dirname(dest)
                cp_r target, dest
              end
            else
              tdir = to.gsub(/\/.*?$/, "")
              mkdir_p "#{out_dir}/#{tdir}"
              src = find_file(File.join(dir, from))
            
              begin
                if File.directory? src
                  mkdir_p "#{out_dir}/#{to}"
                else 
                  mkdir_p File.join(out_dir, File.dirname(to))
                end
                cp_r src, "#{out_dir}/#{to}"
              rescue
                Dir["#{out_dir}/**/.svn"].each { |file| rm_rf file }
                cp_r src, "#{out_dir}/#{to}"
              end
            end
          end
          
          next
        else
          if File.exists? res
            out = res
          else
            out = File.join(dir, res)
          end
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
      CrazyFunJava.ant.jar(:jarfile => jar, :basedir => temp_dir(dir, args[:name]), 
          :excludes => '.svn') do |ant|
        if (args[:main])
          ant.manifest do |ant|
            ant.attribute(:name => 'Main-Class', :value => args[:main])
          end
        end
      end
    end
  end
end

class RunBinary < BaseJava  
  def handle(fun, dir, args)
    if (args[:main].nil?)
      return
    end  
  
    task_name = task_name(dir, args[:name])
  
    desc "Run the binary for #{task_name}"
    task "#{task_name}:run" => [task_name] do
      puts "Running: #{task_name}"
    
      cp = ClassPath.new(task_name)
      cp.push jar_name(dir, args[:name])
    
      CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel(2) if ENV['log']

      ant_java_task(task_name, args[:main], cp)
    
      CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel(verbose ? 2 : 0)
    end
  end
end

class RunTests < BaseJava
  def handle(fun, dir, args)
#    raise FailedPrecondition, "java_test targets need :srcs defined" if args[:srcs].nil || ar?
    
    task_name = task_name(dir, args[:name])
    
    desc "Run the tests for #{task_name}"
    task "#{task_name}:run" => [task_name] do
      puts "Testing: #{task_name}"
      # Find the list of tests
      tests = [] 
      (args[:srcs] || []).each do |src|
        srcs = to_filelist(dir, src).each do |f|
          next if f.to_s =~ /SingleTestSuite\.java$/
          tests.push f if f.to_s =~ /TestSuite\.java$/
        end
      end
      
      cp = ClassPath.new(task_name)
      cp.push jar_name(dir, args[:name])
      
      tests = args[:class].nil? ? tests : "#{args[:class]}.java"
      mkdir_p 'build/test_logs'
      
      if (args[:test_suite])
        tests = [ args[:test_suite] ]
      end      
      
      if (args[:main]) 
        ant_java_task(task_name, args[:main], cp, args[:args])
      else
        tests.each do |test|
          CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel(2) if ENV['log']
  	      CrazyFunJava.ant.junit(:fork => true, :forkmode => 'once', :showoutput => true,
	  	                          :printsummary => 'on', :haltonerror => true, :haltonfailure => true) do |ant|
  	        ant.classpath do |ant_cp|
	            cp.all.each do |jar|
                ant_cp.pathelement(:location => jar)
              end
  	        end

	          ant.formatter(:type => 'plain')
  	        ant.formatter(:type => 'xml')

	          class_name = test.gsub('\\', '/').split('/')[-1]
  	        name = "#{package_name(test)}.#{class_name}".gsub('\\', '/').gsub('/', '.').gsub('.java', '')
	        
	          if name =~ /^\./
	            name = test
            end
	        
            ant.test(:name => name, :todir => 'build/test_logs')
          end
          CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel(verbose ? 2 : 0)
        end
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
  
  def all
    @cp
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

class CreateSourceJar < BaseJava
  def handle(fun, dir, args)
    return if args[:srcs].nil?

    jar = custom_name(dir, args[:name], "src")
    temp_dir = "#{jar}_temp"

    file jar do
      puts "Preparing sources: #{task_name(dir, args[:name])}:srcs as #{jar}"
      rm_rf temp_dir
      mkdir_p temp_dir
      args[:srcs].each do |src|
        files = FileList[dir + "/" + src]
        Rake::Task[jar].enhance(files)
        files.each do |file|
          next unless File.file? file
          dir = package_name file
          mkdir_p "#{temp_dir}/#{dir}"
          cp_r file, "#{temp_dir}/#{dir}"
        end
      end
      zip(temp_dir, jar)
      rm_rf temp_dir
    end
    
    task "#{task_name(dir, args[:name])}:srcs" => [jar]
  end
end

class CreateUberJar < BaseJava
  def handle(fun, dir, args)
    jar = custom_name(dir, args[:name], "standalone")

    if (args[:srcs])
      deps = jar_name(dir, args[:name])
    else
      deps = args[:deps].collect do |dep|
        task_name(dir, dep)
      end
    end
    
    file jar => deps do
      puts "Uber-jar: #{task_name(dir, args[:name])} as #{jar}"
      
      mkdir_p File.dirname(jar)
      
      cp = ClassPath.new(jar_name(dir, args[:name])).all
      cp.push(jar_name(dir, args[:name])) if args[:srcs]
      
      CrazyFunJava.ant.jarjar(:jarfile => jar) do |ant|
        cp.each do |j|
          ant.zipfileset(:src => j, :excludes => "META-INF/BCKEY.DSA,META-INF/BCKEY.SF")
        end
        if (args[:main])
          ant.manifest do |ant|
            ant.attribute(:name => 'Main-Class', :value => args[:main])
          end
        end
      end
    end
    task task_name(dir, args[:name]) + ":uber" => jar
  end
end

class CreateProjectJar < BaseJava
  def handle(fun, dir, args)
    jar = custom_name(dir, args[:name], "nodeps")

    if (args[:srcs])
      deps = jar_name(dir, args[:name])
    else
      deps = args[:deps].collect do |dep|
        task_name(dir, dep)
      end
    end

    file jar => deps do
      puts "Project-jar: #{task_name(dir, args[:name])} as #{jar}"

      mkdir_p File.dirname(jar)

      cp = ClassPath.new(jar_name(dir, args[:name])).all
      cp.push(jar_name(dir, args[:name])) if args[:srcs]

      CrazyFunJava.ant.jarjar(:jarfile => jar) do |ant|
        cp.each do |j|
          unless (j.to_s =~ /^third_party/)
            ant.zipfileset(:src => j, :excludes => "META-INF/BCKEY.DSA,META-INF/BCKEY.SF")
          end
        end
        if (args[:main])
          ant.manifest do |ant|
            ant.attribute(:name => 'Main-Class', :value => args[:main])
          end
        end
      end
    end
    task task_name(dir, args[:name]) + ":project" => jar
    Rake::Task[jar].out = jar
  end
end

end # End of java module
