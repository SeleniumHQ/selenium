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

    fun.add_mapping("py_docs", Python::GenerateDocs.new)

    fun.add_mapping("py_install", Python::Install.new)

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

          # Test file pattern has been specified in the pytest.ini file at project root dir
          test_dir = ["#{Python::lib_dir}/selenium/test/selenium/webdriver/#{browser_data[:dir]}/"]
          pytest_args = [pytest_path] + test_dir
          mark_filter = "-m=\"not ignore_#{browser_data[:ignore]}\"" if browser_data[:ignore]
          pytest_args += [mark_filter]
          keyword_filter = "-k=" + ENV['method'] if ENV['method']
          traceback_level = "--tb=" + ENV['traceback'] if ENV['traceback']
          pytest_args += [keyword_filter, traceback_level]
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

  class Prep < Tasks
    def handle(fun, dir, args)
	    task Tasks.new.task_name(dir, args[:name]) do
	      firefox_py_home = "py/selenium/webdriver/firefox/"
	      firefox_build_dir = 'build/javascript/firefox-driver/'
	      x86 = firefox_py_home + "x86/"
	      amd64 = firefox_py_home + "amd64/"

	      if (windows?) then
		      firefox_build_dir = firefox_build_dir.gsub(/\//, "\\")
		      firefox_py_home = firefox_py_home .gsub(/\//, "\\")
		      x86 = x86.gsub(/\//,"\\")
		      amd64 = amd64.gsub(/\//,"\\")
	      end

	      mkdir_p x86 unless File.exists?(x86)
	      mkdir_p amd64 unless File.exists?(amd64)

	      cp "cpp/prebuilt/i386/libnoblur.so", x86+"x_ignore_nofocus.so", :verbose => true
	      cp "cpp/prebuilt/amd64/libnoblur64.so", amd64+"x_ignore_nofocus.so", :verbose => true

	      cp firefox_build_dir + "webdriver.xpi" , firefox_py_home, :verbose => true
        cp firefox_build_dir + "webdriver_prefs.json" , firefox_py_home, :verbose => true
      end
    end
  end

end
