require 'rake'
require 'rake-tasks/browsers.rb'
require 'rake-tasks/crazy_fun/mappings/common'

class PythonMappings
  def add_all(fun)
    fun.add_mapping("py_test", Python::CheckPreconditions.new)
    fun.add_mapping("py_test", Python::PrepareTests.new)
    fun.add_mapping("py_test", Python::AddDependencies.new)
    fun.add_mapping("py_test", Python::RunTests.new)

    fun.add_mapping("py_env", Python::VirtualEnv.new)
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

  class PrepareTests < PyTask
    def copy_common_tests(dir, tests, browser)
      general_tests = Dir.glob(tests.map { |test| dir + Platform.dir_separator + test })
      general_tests.each do |general_test|
        create_test_file_for(general_test, browser)
      end
    end

    def create_test_file_for(general_test, browser)
      browser_data = BROWSERS[browser][:python]
      browser_class = browser_data[:class]
      filename_parts = general_test.split(/[\\\/]/) # Split on / or \
      package_name = filename_parts[1..-2].join('.') # Drop py/ prefix, and filename
      general_filename = filename_parts.last
      file = IO.read(general_test)
      general_test_class = file[/class ([A-Za-z]+)/, 1] or raise "could not find class name in #{file.inspect}"
      browser_specific_test_class = browser_class + general_test_class

      template = IO.read("py/test/selenium/webdriver/browser_specific_template.py")

      {
        "##BROWSER_CONSTRUCTOR##" => "#{browser_class}(#{browser_data[:constructor_args] || ''})",
        "##GENERAL_TEST_CLASS##" => general_test_class,
        "##BROWSER_SPECIFIC_TEST_CLASS##" => browser_specific_test_class,
        "##PACKAGE_NAME##" => package_name,
        "##GENERAL_FILENAME##" => general_filename.split('.').first,
        "##CUSTOM_TEST_SETUP##" => browser_data[:custom_test_setup] || "",
        "##CUSTOM_TEST_TEARDOWN##" => browser_data[:custom_test_teardown] || "",
        "##CUSTOM_TEST_IMPORT##" => browser_data[:custom_test_import] || "",
      }.each do |old,new|
        template = template.gsub(old, new)
      end

      #This path should be somehow passed through the py_env dep, rather than hard-coded
      path = "#{Python::lib_dir}/selenium/test/selenium/webdriver/#{browser_data[:dir]}"
      unless File.exists?(path)
        mkdir_p path
        touch "#{path}/__init__.py"
      end
      File.open("#{path}/#{browser_data[:file_string]}_#{general_filename}", "w") { |f| f.write(template) }
    end

    def copy_browser_specific_tests(dir, test_files, browser)
      tests = Dir.glob(test_files.map { |test| dir + Platform.dir_separator + test })
      tests.each do |test_file|
        #This path should be somehow passed through the py_env dep, rather than hard-coded
        cp test_file, "#{Python::lib_dir}/selenium/test/selenium/webdriver/#{BROWSERS[browser][:python][:dir]}"
      end
    end

    def handle(fun, dir, args)
      base_task_name = task_name(dir, args[:name])
      browsers = args[:browsers] || ['ff']

      browsers.each do |browser|
        browser_data = BROWSERS[browser][:python]
        task_name = "#{base_task_name}_#{browser}"
        task task_name do
          resources = get_resources(browser, args)
          copy_resources dir, resources, Python::lib_dir
          copy_common_tests(dir, args[:common_tests], browser) if args[:common_tests]

          browser_specific_tests = args[:"#{browser}_specific_tests"]
          copy_browser_specific_tests(dir, browser_specific_tests, browser) if browser_specific_tests
        end
      end
    end
  end

  class RunTests
    def python_path
      #This path should be passed through the py_env dep, rather than hard-coded
      windows? ? "build\\python\\Scripts\\" : "build/python/bin/"
    end

    def pytest_path
      py_test_path = python_path + 'py.test'
      py_test_path = py_test_path + ".exe" if windows?
      if File.exists?(py_test_path)
        py_test = py_test_path
      else
        py_test = 'py.test'
      end
    end

    def copy_source_to_env
      py_setup = python_path + 'python setup.py build'
      sh py_setup , :verbose => true
    end

    def handle(fun, dir, args)
      base_task_name = Tasks.new.task_name(dir, args[:name])
      browsers = args[:browsers] || ['ff']

      browsers.each do |browser|
        browser_data = BROWSERS[browser][:python]

        deps = ["//py:test_env", "#{base_task_name}_#{browser}"] + (browser_data[:deps] || [])
        task_name = "#{base_task_name}_#{browser}:run"
        task task_name => deps do
          copy_source_to_env

          tests = ["#{Python::lib_dir}/selenium/test/selenium/webdriver/#{browser_data[:dir]}/*_tests.py"]
          pytest_args = [pytest_path] + tests
          pytest_args += ["-k", "-ignore_#{browser_data[:ignore]}"] if browser_data[:ignore]
          pytest_args += ["-k" , ENV['method']] if ENV['method']
          pytest_args += ["--junitxml=build/test_logs/python-#{browser}-#{Time.now.to_i}.xml"]
          mkdir_p "build/test_logs"
          sh pytest_args.join(' '), :verbose => true
        end
      end

      #Also generate test with exactly this name, if only one browser specified
      task "#{base_task_name}:run" => [ :"#{base_task_name}_#{browsers.first}:run" ] if browsers.length == 1

    end
  end

  class VirtualEnv
    def handle(fun, dir, args)
      task Tasks.new.task_name(dir, args[:name]) do
        dest = Platform.path_for(args[:dest])
        pip_pkg = "pip install #{args[:packages].join(' ')}"
        virtualenv = "virtualenv --no-site-packages" + " #{dest}"
        sh virtualenv, :verbose => true do |ok, res|
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
end

