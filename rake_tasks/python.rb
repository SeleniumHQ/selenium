
def py_exe
  if ENV.key?('python')
    ENV['python']
  else
    SeleniumRake::Checks.windows? ? 'C:\\Python27\\python.exe' : '/usr/bin/python'
  end
end

def tox_test(driver)
  python_version = ENV['pyversion'] || 'py27'
  tox_args = ['tox', '-c', 'py/tox.ini', '-r']
  tox_args += ['-e', "#{python_version}-#{driver}".downcase]
  tox_args += ['--']
  tox_args += ['-k=' + ENV['method']] if ENV['method']
  tox_args += ['--tb=' + ENV['traceback']] if ENV['traceback']
  tox_args += ["--junitxml=build/test_logs/python-#{Time.now.to_i}.xml"]
  mkdir_p 'build/test_logs'
  sh tox_args.join(' '), verbose: true
end
