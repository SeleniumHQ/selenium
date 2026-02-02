# frozen_string_literal: true

require 'find'

def python_version
  File.foreach('py/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end

def setup_pypirc
  pypirc = File.join(Dir.home, '.pypirc')
  return if File.exist?(pypirc) && File.read(pypirc).match?(/^\[pypi\]/m)

  token = ENV.fetch('TWINE_PASSWORD', nil)
  raise 'Missing PyPI credentials: set TWINE_PASSWORD or configure ~/.pypirc' if token.nil? || token.empty?

  pypi_section = <<~PYPIRC
    [pypi]
    username = __token__
    password = #{token}
  PYPIRC

  if File.exist?(pypirc)
    File.open(pypirc, 'a') { |f| f.puts("\n#{pypi_section}") }
  else
    File.write(pypirc, pypi_section)
  end
  File.chmod(0o600, pypirc)
end

desc 'Build Python wheel and sdist with optional arguments'
task :build do |_task, arguments|
  args = arguments.to_a
  Bazel.execute('build', args, '//py:selenium-wheel')
  Bazel.execute('build', args, '//py:selenium-sdist')
end

desc 'Validate Python release credentials'
task :check_credentials do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  next if nightly

  pypirc = File.join(Dir.home, '.pypirc')
  has_pypirc = File.exist?(pypirc) && File.read(pypirc).match?(/^\[pypi\]/m)
  has_env = ENV.fetch('TWINE_PASSWORD', nil) && !ENV['TWINE_PASSWORD'].empty?
  raise 'Missing PyPI credentials: set TWINE_PASSWORD or configure ~/.pypirc' unless has_pypirc || has_env
end

desc 'Release Python wheel and sdist to pypi'
task :release do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  Rake::Task['py:check_credentials'].invoke(*arguments.to_a)
  setup_pypirc unless nightly

  if nightly
    puts 'Updating Python version to nightly...'
    Rake::Task['py:version'].invoke('nightly')
  end

  command = nightly ? '//py:selenium-release-nightly' : '//py:selenium-release'
  puts "Running Python release command: #{command}"
  Bazel.execute('run', ['--config=release'], command)
end

desc 'Verify Python package is published on PyPI'
task :verify do
  SeleniumRake.verify_package_published("https://pypi.org/pypi/selenium/#{python_version}/json")
end

desc 'Copy known generated files for local development (use `./go py:local_dev all` to copy everything)'
task :local_dev, [:all] do |_task, arguments|
  Bazel.execute('build', [], '//py:selenium')

  bazel_bin = 'bazel-bin/py/selenium/webdriver'
  lib_path = 'py/selenium/webdriver'

  copy_all = arguments[:all] == 'all'
  if copy_all
    FileUtils.rm_rf("#{lib_path}/common/devtools")
    FileUtils.cp_r("#{bazel_bin}/.", lib_path, remove_destination: true)
  else
    %w[common/devtools common/linux common/mac common/windows].each do |dir|
      src = "#{bazel_bin}/#{dir}"
      dest = "#{lib_path}/#{dir}"
      next unless Dir.exist?(src)

      FileUtils.rm_rf(dest)
      FileUtils.cp_r(src, dest)
    end

    %w[getAttribute.js isDisplayed.js findElements.js].each do |atom|
      FileUtils.cp("#{bazel_bin}/remote/#{atom}", "#{lib_path}/remote/#{atom}")
    end
  end
end

desc 'Generate and stage Python documentation'
task :docs do |_task, arguments|
  if python_version.match?(/^\d+\.\d+\.\d+\.\d+$/) && !arguments.to_a.include?('force')
    abort('Aborting documentation update: nightly versions should not update docs.')
  end

  Rake::Task['py:docs_generate'].invoke

  FileUtils.mkdir_p('build/docs/api')
  FileUtils.cp_r('bazel-bin/py/docs/_build/html/.', 'build/docs/api/py')
end

desc 'Generate Python documentation without staging'
task :docs_generate do
  puts 'Generating Python documentation'

  FileUtils.rm_rf('build/docs/api/py/')

  # Generate API listing and stub files in source tree
  Bazel.execute('run', [], '//py:generate-api-listing')
  Bazel.execute('run', [], '//py:sphinx-autogen')

  # Build docs (outputs to bazel-bin)
  Bazel.execute('build', [], '//py:docs')
end

desc 'Install Python wheel locally'
task :install do
  Bazel.execute('build', [], '//py:selenium-wheel')
  sh 'pip install bazel-bin/py/selenium-*.whl'
end

desc 'Pin Python dependencies'
task :pin do
  Bazel.execute('run', [], '//scripts:update_py_deps')
  Bazel.execute('run', [], '//py:requirements.update')
  SeleniumRake.git.add('py/requirements.txt')
  SeleniumRake.git.add('py/requirements_lock.txt')
end

desc 'Update Python dependencies (alias for pin)'
task update: :pin

desc 'Update Python changelog'
task :changelogs do
  header = "Selenium #{python_version}"
  SeleniumRake.update_changelog(python_version, 'py', 'py/selenium/webdriver', 'py/CHANGES', header)
end

desc 'Update Python version'
task :version, [:version] do |_task, arguments|
  old_version = python_version
  nightly = ".#{Time.now.strftime('%Y%m%d%H%M')}"
  new_version = SeleniumRake.updated_version(old_version, arguments[:version], nightly)
  puts "Updating Python from #{old_version} to #{new_version}"

  ['py/pyproject.toml',
   'py/BUILD.bazel',
   'py/selenium/__init__.py',
   'py/selenium/webdriver/__init__.py',
   'py/docs/source/conf.py'].each do |file|
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
  end

  old_short_version = old_version.split('.')[0..1].join('.')
  new_short_version = new_version.split('.')[0..1].join('.')

  conf = 'py/docs/source/conf.py'
  text = File.read(conf).gsub(old_short_version, new_short_version)
  File.open(conf, 'w') { |f| f.puts text }
end

desc 'Format Python code with ruff'
task :format do
  puts '  Running ruff format...'
  Bazel.execute('run', [], '//py:ruff-format')
end

desc 'Run Python linters (ruff check, mypy, docs)'
task :lint do
  puts '  Running ruff check...'
  Bazel.execute('run', %w[-- --fix --show-fixes], '//py:ruff-check')
  puts '  Running mypy...'
  Bazel.execute('run', [], '//py:mypy')
  Rake::Task['py:docs_generate'].invoke
end
