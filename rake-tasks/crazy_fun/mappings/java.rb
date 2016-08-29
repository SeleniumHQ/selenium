require 'rake-tasks/buck.rb'
require 'rake-tasks/checks.rb'
require 'rake-tasks/crazy_fun/mappings/common'

class JavaMappings
  def add_all(fun)
    ["java_library", "java_binary"].each do |rule|
      fun.add_mapping(rule, CrazyFunJava::CheckPreconditions.new)
      fun.add_mapping(rule, CrazyFunJava::CreateTask.new)
      fun.add_mapping(rule, CrazyFunJava::CreateShortNameTask.new)
      fun.add_mapping(rule, CrazyFunJava::AddDepedencies.new)
      fun.add_mapping(rule, CrazyFunJava::TidyTempDir.new)
      fun.add_mapping(rule, CrazyFunJava::Javac.new)
      fun.add_mapping(rule, CrazyFunJava::CopyResources.new)
      fun.add_mapping(rule, CrazyFunJava::Jar.new)
      fun.add_mapping(rule, CrazyFunJava::WriteClassPath.new)
      fun.add_mapping(rule, CrazyFunJava::TidyTempDir.new)
      fun.add_mapping(rule, CrazyFunJava::RunBinary.new)
      fun.add_mapping(rule, CrazyFunJava::CreateSourceJar.new)
      fun.add_mapping(rule, CrazyFunJava::CreateProjectSourceJar.new)
      fun.add_mapping(rule, CrazyFunJava::CreateUberJar.new)
      fun.add_mapping(rule, CrazyFunJava::CreateProjectJar.new)
      fun.add_mapping(rule, CrazyFunJava::Zip.new)
    end

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
    fun.add_mapping("java_test", CrazyFunJava::CreateUberJar.new)
    fun.add_mapping("java_test", CrazyFunJava::CreateProjectJar.new)
  end
end

class Ant
  def self.load_bundled
    dir = 'third_party/java/ant'

    Dir[File.join(dir, '*.jar')].each { |jar| require jar }

    # we set ANT_HOME to avoid JRuby trying to load its own Ant
    ENV['ANT_HOME'] = dir
    require "ant"
  end

end

module CrazyFunJava

  def self.ant
    @ant ||= (
      require 'third_party/java/eclipse_compiler/ecj-4.3.2.jar'
      require 'third_party/java/junit/junit-4.12.jar'

      Ant.load_bundled

      ant = Ant.new(:basedir => ".", :name => "selenium")

      ant.taskdef :name      => 'jarjar',
      :classname => 'com.tonicsystems.jarjar.JarJarTask',
      :classpath => 'third_party/java/jarjar/jarjar-1.4.jar'
      ant.taskdef :resource  => 'testngtasks' do |t|
        t.classpath do |cp|
          cp.pathelement :location => 'third_party/java/testng/testng-6.9.9.jar'
          cp.pathelement :location => 'third_party/java/jcommander/jcommander-1.29.jar'
          cp.pathelement :location => 'third_party/java/beanshell/bsh-2.0b4.jar'
        end
      end

      ant.project.setProperty 'XmlLogger.file', 'build/build_log.xml'
      ant.project.setProperty 'build.compiler', 'org.eclipse.jdt.core.JDTCompilerAdapter'

      unless ENV['log']
        ant.project.getBuildListeners().get(0).setMessageOutputLevel($DEBUG ? 2 : 0)
      end
      ant.project.addBuildListener logger

      ant
    )
  end

  def self.import(class_name)
    if RUBY_PLATFORM == 'java'
      clazz = include_class(class_name)
    else
      clazz = Rjb::import(class_name)
    end
    clazz
  end

  def self.logger
    @logger ||= (
      logger = Java.org.apache.tools.ant.XmlLogger.new
      logger.setMessageOutputLevel(2)
      logger.buildStarted(nil)

      at_exit do
        if File.exists? 'build'
          final_event = Java.org.apache.tools.ant.BuildEvent.new(ant.project)
          logger.buildFinished(final_event)
        end
      end

      logger
    )
  end

  class BaseJava < Tasks

    def jar_name(dir, name)
      name = task_name(dir, name)
      jar = "build/" + (name.slice(2 ... name.length))
      jar = jar.sub(":", "/")
      jar << ".jar"

      Platform.path_for(jar)
    end

    def custom_name(dir, name, custom)
      name = task_name(dir, name)
      jar = "build/" + (name.slice(2 ... name.length)) + "-" + custom
      jar = jar.sub(":", "/")
      jar << ".jar"

      Platform.path_for(jar)
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
        if paths[0] =~ /^(com|org|net|uk|de)$/
          break
        end
        paths.shift
      end

      return nil if paths[-1].nil?

      paths[-1] = paths[-1].sub(/\.(class|java)$/, "")

      paths.join(".")
    end

    def ant_java_task(task_name, classname, cp, args = nil, props = {})
      sysprops = props || {}
      CrazyFunJava.ant.java :classname => classname, :fork => true do
        arg :line => args

        if ($DEBUG)
          jvmarg(:line => "-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005")
        end

        classpath do
          cp.all.each do |jar|
            pathelement :location => jar
          end
        end

        sysprops.each do |map|
          map.each do |key, value|
            sysproperty :key => key, :value => value
          end
        end
      end
    end

    def modify_manifest(manifest)
      manifest.section(:name => 'Build-Info') do |section|
        section.attribute(:name => 'Selenium-Version', :value => version)
        section.attribute(:name => 'Selenium-Revision', :value => vcs_revision)
        section.attribute(:name => 'Selenium-Build-Time', :value => Time.new.gmtime.strftime('%F %T'))
      end
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
      name = task_name(dir, args[:name])
      task name

      if args[:srcs] or args[:resources] or args[:embedded]
        jar_name = jar_name(dir, args[:name])
        file jar_name
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
      add_dependencies(target, dir, args[:embedded])

      if (args[:srcs].nil?)
        target_name = jar_name(dir, args[:name])
        target = Rake::Task[target_name]
        add_dependencies(target, dir, args[:deps])
        add_dependencies(target, dir, args[:resources])
        add_dependencies(target, dir, args[:embedded])
      end

    end
  end

  class WriteClassPath < BaseJava
    def handle(fun, dir, args)
      task_name = task_name(dir, args[:name])
      jar_name = jar_name(dir, args[:name])

      out_file = jar_name.sub(/\.jar$/, '.classpath')

      desc "Write out the classpath for #{jar_name}"
      task "#{task_name}:classpath" => jar_name do
        puts "Writing: #{out_file}"
        cp = ClassPath.new(jar_name)
        cp.push jar_name
        File.open(out_file, "w") do |file|
          file << cp.to_s
        end
      end
    end
  end

  class TidyTempDir < BaseJava
    def handle(fun, dir, args)
      return if args[:srcs].nil? and args[:resources].nil? and args[:embedded].nil?

      file jar_name(dir, args[:name]) do
        rm_rf temp_dir(dir, args[:name])
      end
    end
  end

  class Javac < BaseJava
    def handle(fun, dir, args)
      return if args[:srcs].nil? and args[:resources].nil? and args[:embedded].nil?

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

        if args[:srcs]
          CrazyFunJava.ant.javac(
            :srcdir               => '.',
            :destdir              => out_dir,
            :includeAntRuntime    => false,
            :optimize             => true,
            :debug                => true,
            :nowarn               => true,
            :source               => '1.7',
            :target               => '1.7'
          ) { |ant|
            ant.classpath(:refid => "#{args[:name]}.path")

            args[:srcs].each do |src_glob|
              ant.include(:name => [dir, src_glob].join(File::SEPARATOR))
            end
          }
        end
      end

      desc "Build #{jar}"
      task task_name(dir, args[:name]) => jar

      Rake::Task[task_name(dir, args[:name])].out = jar
    end
  end

  class CopyResources < BaseJava
    def handle(fun, dir, args)
      unless args[:embedded].nil?
        file jar_name(dir, args[:name]) do
          args[:embedded].each do |to_copy|
            path_to_file = "#{dir}/#{to_copy}"
            if File.exists?(path_to_file)
              from = path_to_file
              to_prefix = File.dirname(to_copy.to_s)
            else
              from = Rake::Task[task_name(dir, to_copy)].out
              to_prefix = '.'
            end
            package_dir = package_name("#{dir}/#{to_prefix}/.") # Append a . because package_name expects file names not folder names
            to = "#{temp_dir(dir, args[:name])}/#{package_dir}"
            mkdir_p to
            cp_r from, to
          end
        end
      end

      unless args[:resources].nil?
        file jar_name(dir, args[:name]) do
          out_dir = temp_dir(dir, args[:name])
          copy_resources(dir, args[:resources], out_dir)
        end
      end
    end
  end

  class Jar < BaseJava
    def handle(fun, dir, args)
      return if args[:srcs].nil? and args[:resources].nil? and args[:embedded].nil?

      jar = jar_name(dir, args[:name])

      file jar do
        CrazyFunJava.ant.jar(:jarfile => jar, :basedir => temp_dir(dir, args[:name]),
                             :excludes => '.svn', :duplicate => 'preserve') do |ant|
          ant.manifest do |ant|
            if (args[:main_class])
              ant.attribute(:name => 'Main-Class', :value => args[:main_class])
            end
            modify_manifest(ant)
          end
        end
      end
    end
  end

  class RunBinary < BaseJava
    def handle(fun, dir, args)
      if (args[:main_class].nil?)
        return
      end

      task_name = task_name(dir, args[:name])

      desc "Run the binary for #{task_name}"
      task "#{task_name}:run" => [task_name] do
        puts "Running: #{task_name}"

        cp = ClassPath.new(task_name)
        cp.push jar_name(dir, args[:name])

        CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel(2) if ENV['log']

        ant_java_task(task_name, args[:main_class], cp, nil, args[:sysproperties])

        CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel($DEBUG ? 2 : 0)
      end
    end
  end

  class RunTests < BaseJava

    def handle(fun, dir, args)
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
            tests.push f if f.to_s =~ /Tests\.java$/
          end
        end

        if tests.empty? and args[:srcs] and args[:srcs][0] == "SingleTestSuite.java"
          tests.push to_filelist(dir, "SingleTestSuite.java")[0]
        end

        if tests.empty?

        end

        cp = ClassPath.new(task_name)
        cp.push jar_name(dir, args[:name])

        tests = args[:class].nil? ? tests : "#{args[:class]}.java"
        mkdir_p 'build/test_logs'

        if (args[:test_suite])
          tests = [ args[:test_suite] ]
        end

        if ("org.testng.TestNG" == args[:main_class])
          CrazyFunJava.ant.testng :outputdir => "build/test_logs", :haltOnFailure => halt_on_failure? do |ant|
            ant.classpath do |ant_cp|
              cp.all.each do |jar|
                ant_cp.pathelement(:location => jar)
              end
            end

            sysprops = args[:sysproperties] || []
            sysprops.each do |map|
              map.each do |key, value|
                ant.sysproperty :key => key, :value => value
              end
            end

            ant.xmlfileset :dir => dir, :includes => args[:args]
          end
        elsif (args[:main_class])
          ant_java_task(task_name, args[:main_class], cp, args[:args], args[:sysproperties])
        else
          tests.each do |test|
            CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel(2) if ENV['log']
            CrazyFunJava.ant.junit(
              :fork          => true,
              :forkmode      => 'once',
              :showoutput    => true,
              :printsummary  => 'on',
              :haltonerror   => halt_on_error?,
              :haltonfailure => halt_on_failure?,
              :maxmemory     => "1024m"
            ) do |ant|
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

              sysprops = args[:sysproperties] || []
              sysprops.each do |map|
                map.each do |key, value|
                  ant.sysproperty :key => key, :value => value
                end
              end

              if only_run_class
                ant.sysproperty :key => 'only_run', :value => only_run_class
              end

              if only_run_method
                ant.sysproperty :key => 'method', :value => only_run_method
              end

              if chromedriver
                ant.sysproperty :key => 'webdriver.chrome.driver', :value => chromedriver
              end

              if safaridriver
                ant.sysproperty :key => 'webdriver.safari.driver', :value => safaridriver
              end

              if chrome
                ant.sysproperty :key => 'webdriver.chrome.binary', :value => chrome
              end

              if firefox
                ant.sysproperty :key => 'webdriver.firefox.bin', :value => firefox
              end

              if remote_url
                ant.sysproperty :key => 'selenium.external.serverUrl', :value => remote_url
                ant.sysproperty :key => 'selenium.browser.remote', :value => 'true'
                if remote_browser
                  ant.sysproperty :key => 'selenium.browser', :value => remote_browser
                end
              end

              if marionette?
                ant.sysproperty :key => 'webdriver.firefox.marionette', :value => 'true'
              end

              if ipv4only?
                ant.sysproperty :key => 'java.net.preferIPv4Stack', :value => 'true'
              end

              if ignored_only?
                ant.sysproperty :key => 'ignored_only', :value => 'true'
              end

              if local_only?
                ant.sysproperty :key => 'local_only', :value => 'true'
              end

              # Log levels can be any of {'DEBUG', 'INFO', 'WARNING', 'ERROR'}
              levels = Array.[]("INFO", "DEBUG", "WARNING", "ERROR")
              if log_level
                if levels.include? log_level.upcase
                  ant.sysproperty :key => 'log_level', :value => log_level
                else
                  raise FailedPrecondition, "log_level should be any of #{levels.inspect}"
                end
              end

              if leave_running?
                ant.sysproperty :key => 'webdriver.singletestsuite.leaverunning', :value => 'true'
              end

              if (debug?)
                ant.jvmarg(:line => "-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=#{suspend?},address=5005")
              end

              if shorten_log_messages?
                ant.sysproperty :key => 'webdriver.remote.shorten_log_messages', :value => 'true'
              end

              if grid_test_browser
                ant.sysproperty :key => 'webdriver.gridtest.browser', :value => grid_test_browser
              end

              if (args[:args])
                ant.jvmarg(:line => args[:args])
              end

              if (jvm_args)
                ant.jvmarg(:line => jvm_args)
              end

              logfile = "TEST-#{args[:name]}-#{name}"
              ant.test(:name => name, :todir => 'build/test_logs', :outfile => logfile)
            end
            CrazyFunJava.ant.project.getBuildListeners().get(0).setMessageOutputLevel($DEBUG ? 2 : 0)
          end
        end
      end
    end

    def suspend?
      ENV['suspend'] == 'true' ? 'y' : 'n'
    end

    def debug?
      $DEBUG
    end

    def only_run_class
      return ENV['onlyrun']
    end

    def only_run_method
      return ENV['method']
    end

    def log_level
      return ENV['log_level']
    end

    def chromedriver
      return ENV['chromedriver']
    end

    def safaridriver
      return ENV['safaridriver']
    end

    def chrome
      return ENV['chrome']
    end

    def firefox
      return ENV['firefox']
    end

    def remote_url
      return ENV['remote_url']
    end

    def remote_browser
      return ENV['remote_browser']
    end

    def jvm_args
      return ENV['jvmargs']
    end

    def marionette?
      # we set marionette true if the commandline argument is set and it is not 'false'
      !([nil, 'false'].include? ENV['marionette'])
    end

    def ipv4only?
      # we set ipv4only true if the commandline argument is set and it is not 'false'
      !([nil, 'false'].include? ENV['ipv4only'])
    end

    def ignored_only?
      # we set ignored_only true if the commandline argument is set and it is not 'false'
      !([nil, 'false'].include? ENV['ignoredonly'])
    end

    def local_only?
      # we set local_only true if the commandline argument is set and it is not 'false'
      !([nil, 'false'].include? ENV['localonly'])
    end

    def leave_running?
      # we set leaverunning true if the commandline argument is set and it is not 'false'
      !([nil, 'false'].include? ENV['leaverunning'])
    end

    def shorten_log_messages?
      # we set shorten_log_messages true if the commandline argument is set and it is not 'false'
      !([nil, 'false'].include? ENV['shortenlogmessages'])
    end

    def grid_test_browser
      return ENV['gridtestbrowser']
    end

  end

  class ClassPath
    @@CACHE = {}

    def initialize(task_name)
      t = Rake::Task[task_name]

      @cp = build_classpath([], t)
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
      return @@CACHE[dep.to_s] if @@CACHE[dep.to_s]

      ret = []

      dep.prerequisites.each do |prereq|
        if prereq.to_s =~ /\.jar$/
          ret.push(prereq)
          ret += build_classpath(cp, Rake::Task[prereq])
        end

        next unless Rake::Task.task_defined? prereq

        t = Rake::Task[prereq]
        if (t.respond_to?(:out) and t.out.to_s =~ /\.jar$/)
          Buck::buck_cmd.call('audit', ['classpath', prereq]) do |output|
            output.split.each do |line|
              ret.push(line) if line =~ /\.jar$/
            end
          end
        end

        ret += build_classpath(cp, Rake::Task[prereq])
      end

      @@CACHE[dep.to_s] = ret.sort.uniq
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

      listed_deps = args[:deps] || []
      deps = listed_deps.collect do |dep|
        real_file = File.join(dir, dep.to_s)
        File.exists?(real_file) ? real_file : task_name(dir, dep)
      end
      deps << jar_name(dir, args[:name]) if (args[:srcs] or args[:resources] or args[:embedded])

      file jar => deps do
        puts "Uber-jar: #{task_name(dir, args[:name])} as #{jar}"

        mkdir_p File.dirname(jar)

        cp = ClassPath.new(jar_name(dir, args[:name])).all
        cp.push(jar_name(dir, args[:name])) if args[:srcs] or args[:resources] or args[:embedded]

        CrazyFunJava.ant.jarjar(:jarfile => jar, :duplicate => 'preserve') do |ant|
          cp.each do |j|
            ant.zipfileset(:src => j, :excludes => "META-INF/BCKEY.DSA,META-INF/BCKEY.SF")
          end
          ant.manifest do |ant|
            if (args[:main_class])
              ant.attribute(:name => 'Main-Class', :value => args[:main_class])
            end
            modify_manifest(ant)
          end
        end
      end
      task task_name(dir, args[:name]) + ":uber" => jar

      Rake::Task[task_name(dir, args[:name]) + ":uber"].out = jar
      Rake::Task[jar].out = jar
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

        CrazyFunJava.ant.jarjar(:jarfile => jar, :duplicate => 'preserve') do |ant|
          cp.each do |j|
            unless (j.to_s =~ /^third_party/ || j.to_s =~ /^build\/third_party/)
              ant.zipfileset(:src => j, :excludes => "META-INF/BCKEY.DSA,META-INF/BCKEY.SF")
            end
          end
          ant.manifest do |ant|
            if (args[:main_class])
              ant.attribute(:name => 'Main-Class', :value => args[:main_class])
            end
            modify_manifest(ant)
          end
        end
      end
      task task_name(dir, args[:name]) + ":project" => jar
      Rake::Task[task_name(dir, args[:name]) + ":project"].out = jar
      Rake::Task[jar].out = jar
    end
  end

  class CreateProjectSourceJar < BaseJava
    def handle(fun, dir, args)
      src_jar = custom_name(dir, args[:name], "nodeps-srcs")
      project_jar = custom_name(dir, args[:name], "nodeps")

      file src_jar => [project_jar] do
        # Grab the dependencies of the project_jar, and if they have sources
        # add them to a map of doom (after expansion)

        srcs = gather_sources([], Rake::Task[project_jar])

        temp_dir = "#{src_jar}_temp"

        puts "Preparing sources: #{custom_name(dir, args[:name], "all-srcs")}:srcs as #{src_jar}"
        rm_rf temp_dir
        mkdir_p temp_dir
        copied = []
        srcs.each do |src|
          class_name = class_name(src)
          next if class_name.nil?

          dest = temp_dir + "/" + class_name.gsub(".", "/") + ".java"
          dest.gsub!("/", File::SEPARATOR)

          if (!copied.index(src))
            mkdir_p File.dirname(dest)
            cp_r src, dest
            copied << src
          end
        end
        zip(temp_dir, src_jar)
        rm_rf temp_dir
      end

      task task_name(dir, args[:name]) + ":project-srcs" => src_jar
      Rake::Task[task_name(dir, args[:name]) + ":project-srcs"].out = src_jar
    end

    private
    def gather_sources(srcs, dep)
      dep.prerequisites.each do |dep|
        if dep.to_s =~ /\.java$/
          srcs.push dep
        end

        if Rake::Task.task_defined? dep
          gather_sources(srcs, Rake::Task[dep])
        end
      end
      srcs
    end
  end

  class Zip < BaseJava
    def handle(fun, dir, args)
      # Copy third party deps and the output of the rule into a zip
      # Also collect source jar

      task_name = task_name(dir, args[:name])
      zip = jar_name(dir, args[:name]).sub(/\.jar/, '.zip')
      uber = task_name + ":uber"
      project = task_name + ":project"
      srcs = task_name + ":project-srcs"

      file zip => [uber, project, srcs] do
        puts "Zip: #{task_name}:zip as #{zip}"

        temp = zip + "temp"
        mkdir_p File.join(temp, "libs")

        cp Rake::Task[project].out, temp
        cp Rake::Task[srcs].out, temp

        # we only need the third_party deps
        libs = File.join(temp, "libs")
        ClassPath.new(zip).all.each do |dep|
          next unless /^third_party/.match(dep)

          cp dep, libs
        end

        zip(temp, zip)
        rm_rf temp
      end

      task task_name + ":zip" => [zip]
      Rake::Task[task_name + ":zip"].out = zip
    end
  end

end # End of java module
