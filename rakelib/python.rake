require 'rake-tasks/browsers.rb'

py_home = "py/"

def py_exe
  if ENV.key? 'python'
    return ENV['python']
  else
    windows? ? "C:\\Python27\\python.exe" : "/usr/bin/python"
  end
end

namespace :py do
  task :prep => [
    '//javascript/atoms/fragments:is-displayed',
    '//javascript/webdriver/atoms:get-attribute',
    '//third_party/js/selenium:webdriver_xpi',
  ] do
    remote_py_home = py_home + "selenium/webdriver/remote/"
    firefox_py_home = py_home + "selenium/webdriver/firefox/"

    if (windows?) then
      remote_py_home = remote_py_home.gsub(/\//, "\\")
      firefox_py_home = firefox_py_home .gsub(/\//, "\\")
    end

    cp Rake::Task['//javascript/atoms/fragments:is-displayed'].out, remote_py_home+"isDisplayed.js", :verbose => true
    cp Rake::Task['//javascript/webdriver/atoms:get-attribute'].out, remote_py_home+"getAttribute.js", :verbose => true

    cp Rake::Task['//third_party/js/selenium:webdriver_xpi'].out, firefox_py_home, :verbose => true
    cp 'third_party/js/selenium/webdriver.json', firefox_py_home+"webdriver_prefs.json", :verbose => true
    cp "LICENSE", py_home + "LICENSE", :verbose => true
  end

  bazel :unit do
    Bazel::execute('test', [], '//py:unit')
  end

  task :docs => :prep do
    sh "tox -c py/tox.ini -e docs", :verbose => true
  end

  task :install => :prep do
    Dir.chdir('py') do
      sh py_exe + " setup.py install", :verbose => true
    end
  end

  ["chrome", "ff", "marionette", "ie", "edge", "blackberry", "remote_firefox", "safari",].each do |browser|
    browser_data = BROWSERS[browser][:python]
    deps = browser_data[:deps] || []
    deps += [:prep]
    driver = browser_data[:driver]

    task "#{browser}_test" => deps do
      tox_test driver
    end
  end
end

def tox_test(driver)
  python_version = ENV['pyversion'] || "py27"
  tox_args = ['tox', '-c', 'py/tox.ini', '-r']
  tox_args += ['-e', "#{python_version}-#{driver}".downcase]
  tox_args += ["--"]
  tox_args += ["-k=" + ENV['method']] if ENV['method']
  tox_args += ["--tb=" + ENV['traceback']] if ENV['traceback']
  tox_args += ["--junitxml=build/test_logs/python-#{Time.now.to_i}.xml"]
  mkdir_p "build/test_logs"
  sh tox_args.join(' '), :verbose => true
end
