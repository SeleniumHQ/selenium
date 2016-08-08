require 'rake'
require 'rake-tasks/browsers.rb'
require 'rake-tasks/crazy_fun/mappings/common'

class PythonMappings
  def add_all(fun)
    fun.add_mapping("py_test", Python::CheckPreconditions.new)
    fun.add_mapping("py_test", Python::AddDependencies.new)
    fun.add_mapping("py_test", Python::RunTests.new)

    fun.add_mapping("py_env", Python::VirtualEnv.new)

    fun.add_mapping("py_docs", Python::GenerateDocs.new)

    fun.add_mapping("py_install", Python::Install.new)

    fun.add_mapping("py_prep", Python::AddNormalDependencies.new)
    fun.add_mapping("py_prep", Python::Prep.new)
  end
end

module Python
  class CheckPreconditions
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
    end
  end

  def self.lib_dir
     Dir::glob('build/lib*')[0] || 'build/lib'
  end

  class PyTask < Tasks
    def get_resources(browser, args)
      resources = []
      resources.concat(args[:resources]) if args[:resources]
      browser_specific_resources = BROWSERS[browser][:python][:resources]
      resources.concat(browser_specific_resources) if browser_specific_resources
      return resources
    end
  end

  class AddDependencies < PyTask
    def handle(fun, dir, args)
      (args[:browsers] || [:ff]).each do |browser|
        target = Rake::Task[task_name(dir, "#{args[:name]}_#{browser}")]
        add_dependencies(target, dir, args[:deps])
        resources = get_resources(browser, args)
        add_dependencies(target, dir, resources)
      end
    end
  end

  class RunTests
    def handle(fun, dir, args)
      base_task_name = Tasks.new.task_name(dir, args[:name])
      browsers = args[:browsers] || ['ff']
      deps = []
      drivers = []

      browsers.each do |browser|
        browser_data = BROWSERS[browser][:python]
        deps += browser_data[:deps] if browser_data[:deps]
        drivers += [browser_data[:driver]] if browser_data[:driver]
      end

      task_name = "#{base_task_name}:run"
      task task_name => deps do
        python_version = ENV['pyversion'] || "py27"
        tox_args = ['tox', '-r']
        drivers.each do |driver|
          tox_args += ['-e', "#{python_version}-#{driver}".downcase]
        tox_args += ["--"]
        tox_args += ["-k=" + ENV['method']] if ENV['method']
        tox_args += ["--tb=" + ENV['traceback']] if ENV['traceback']
        tox_args += ["--junitxml=build/test_logs/python-#{Time.now.to_i}.xml"]
        mkdir_p "build/test_logs"
        sh tox_args.join(' '), :verbose => true
        end
      end
    end
  end

  class VirtualEnv
    def handle(fun, dir, args)
      task Tasks.new.task_name(dir, args[:name]) do
        dest = Platform.path_for(args[:dest])
        pip_pkg = "pip install #{args[:packages].join(' ')}"
        virtualenv = ["virtualenv", "--no-site-packages", " #{dest}"]
        virtualenv += ["-p", ENV['pyversion']] if ENV['pyversion']
        sh virtualenv.join(' '), :verbose => true do |ok, res|
          unless ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
          end
        end

        slash = Platform.dir_separator
        python_dir = dest + slash + (windows? ? "Scripts" : "bin")
        pip_install = python_dir + slash + pip_pkg
        sh pip_install, :verbose => true

        sh "#{python_dir}#{slash}python setup.py install", :verbose => true
      end
    end
  end

  class GenerateDocs < Tasks

    def python_path
      #This path should be passed through the py_env dep, rather than hard-coded
      windows? ? "build\\python\\Scripts\\" : "build/python/bin/"
    end

    def handle(fun, dir, args)
      task Tasks.new.task_name(dir, args[:name]) => args[:deps] do

        source_folder = Platform.path_for args[:source_folder]
        target_folder = Platform.path_for args[:target_folder]

        sphinx_build = "#{python_path}sphinx-build"
        sphinx_build =  sphinx_build + ".exe" if windows?

        sh "#{sphinx_build} -b html -d build/doctrees #{source_folder} #{target_folder}", :verbose => true
      end
    end
  end

  class Install < Tasks
    def py_exe
      if ENV.key? 'python'
        return ENV['python']
      else
        windows? ? "C:\\Python27\\python.exe" : "/usr/bin/python"
      end
    end

    def handle(fun, dir, args)
      task Tasks.new.task_name(dir, args[:name]) do
        sh py_exe + " setup.py install", :verbose => true
      end
    end
  end

  class AddDependencies < PyTask
    def handle(fun, dir, args)
      (args[:browsers] || [:ff]).each do |browser|
        target = Rake::Task[task_name(dir, "#{args[:name]}_#{browser}")]
        add_dependencies(target, dir, args[:deps])
        resources = get_resources(browser, args)
        add_dependencies(target, dir, resources)
      end
    end
  end

  class AddNormalDependencies < PyTask
    def handle(fun, dir, args)
      target = Rake::Task[task_name(dir, "#{args[:name]}")]
      add_dependencies(target, dir, args[:deps])
    end
  end

  class Prep < Tasks
    def handle(fun, dir, args)
	    task Tasks.new.task_name(dir, args[:name]) do
	      remote_py_home = "py/selenium/webdriver/remote/"
	      firefox_py_home = "py/selenium/webdriver/firefox/"
	      firefox_build_dir = 'build/javascript/firefox-driver/'
	      x86 = firefox_py_home + "x86/"
	      amd64 = firefox_py_home + "amd64/"

	      if (windows?) then
		      remote_py_home = remote_py_home.gsub(/\//, "\\")
		      firefox_build_dir = firefox_build_dir.gsub(/\//, "\\")
		      firefox_py_home = firefox_py_home .gsub(/\//, "\\")
		      x86 = x86.gsub(/\//,"\\")
		      amd64 = amd64.gsub(/\//,"\\")
	      end

	      mkdir_p x86 unless File.exists?(x86)
	      mkdir_p amd64 unless File.exists?(amd64)

	      cp Rake::Task['//cpp:noblur'].out, x86+"x_ignore_nofocus.so", :verbose => true
	      cp Rake::Task['//cpp:noblur64'].out, amd64+"x_ignore_nofocus.so", :verbose => true
	      cp Rake::Task['//javascript/atoms/fragments:is-displayed'].out, remote_py_home+"isDisplayed.js", :verbose => true
	      cp Rake::Task['//javascript/webdriver/atoms:getAttribute'].out, remote_py_home+"getAttribute.js", :verbose => true

	      cp Rake::Task['//javascript/firefox-driver:webdriver'].out, firefox_py_home, :verbose => true
	      cp Rake::Task['//javascript/firefox-driver:webdriver_prefs'].out, firefox_py_home, :verbose => true
      end
    end
  end

end
