module Python
  class RunTests
    def handle(fun, dir, args)
      base_task_name = Tasks.new.task_name(dir, args[:name])
      browsers = args[:browsers] || ['ff']
      deps = []
      drivers = []

      browsers.each do |browser|
        browser_data = SeleniumRake::Browsers::BROWSERS[browser]
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
end
