require 'rake'
require 'rake-tasks/browsers.rb'
require 'rake-tasks/buck.rb'
require 'rake-tasks/crazy_fun/mappings/common'

class PythonMappings
  def add_all(fun)
    fun.add_mapping("py_test", Python::CheckPreconditions.new)
    fun.add_mapping("py_test", Python::AddDependencies.new)
    fun.add_mapping("py_test", Python::RunTests.new)

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
        tox_args = ['tox', '-c', 'py/tox.ini', '-r']
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

  class GenerateDocs < Tasks
    def handle(fun, dir, args)
      task Tasks.new.task_name(dir, args[:name]) do
        sh "tox -c py/tox.ini -e docs", :verbose => true
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
	      py_home = "py/"
	      remote_py_home = py_home + "selenium/webdriver/remote/"
	      firefox_py_home = py_home + "selenium/webdriver/firefox/"

	      if (windows?) then
		      remote_py_home = remote_py_home.gsub(/\//, "\\")
		      firefox_py_home = firefox_py_home .gsub(/\//, "\\")
	      end

	      cp Rake::Task['//javascript/atoms/fragments:is-displayed'].out, remote_py_home+"isDisplayed.js", :verbose => true
	      cp Rake::Task['//javascript/webdriver/atoms:get-attribute'].out, remote_py_home+"getAttribute.js", :verbose => true

	      cp Rake::Task['//third_party/js/selenium:webdriver'].out, firefox_py_home, :verbose => true
	      cp Rake::Task['//third_party/js/selenium:webdriver_prefs'].out, firefox_py_home+"webdriver_prefs.json", :verbose => true
	      cp "LICENSE", py_home + "LICENSE", :verbose => true
      end
    end
  end

end
