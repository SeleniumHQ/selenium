require 'rake'
require 'rake-tasks/browsers.rb'
require 'rake-tasks/buck.rb'
require 'rake-tasks/crazy_fun/mappings/common'

class PythonMappings
  def add_all(fun)
    fun.add_mapping("py_test", Python::AddDependencies.new)
    fun.add_mapping("py_test", Python::RunTests.new)
  end
end

module Python

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
end
