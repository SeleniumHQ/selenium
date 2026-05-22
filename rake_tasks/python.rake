# frozen_string_literal: true

require 'find'

def python_version
  File.foreach('py/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end

def manager_python_version
  File.foreach('py/selenium-manager/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SM_VERSION')
  end
end

MANAGER_PYTHON_FILES = %w[
  py/selenium-manager/pyproject.toml
  py/selenium-manager/BUILD.bazel
  py/selenium-manager-linux-x86-64/pyproject.toml
  py/selenium-manager-linux-x86-64/BUILD.bazel
  py/selenium-manager-macos/pyproject.toml
  py/selenium-manager-macos/BUILD.bazel
  py/selenium-manager-windows/pyproject.toml
  py/selenium-manager-windows/BUILD.bazel
].freeze unless defined?(MANAGER_PYTHON_FILES)

MANAGER_PYTHON_WHEEL_TARGETS = %w[
  //py/selenium-manager-linux-x86-64:selenium-manager-linux-x86-64-wheel
  //py/selenium-manager-macos:selenium-manager-macos-wheel
  //py/selenium-manager-windows:selenium-manager-windows-wheel
  //py/selenium-manager:selenium-manager-wheel
].freeze unless defined?(MANAGER_PYTHON_WHEEL_TARGETS)

desc 'Build Python wheel and sdist with optional arguments'
task :build do |_task, arguments|
  args = arguments.to_a
  Bazel.execute('build', args, '//py:selenium-wheel')
  Bazel.execute('build', args, '//py:selenium-sdist')
end

desc 'Validate Python release credentials'
task :check_credentials do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  token_env = nightly ? 'TWINE_NIGHTLY_PASSWORD' : 'TWINE_PASSWORD'
  section = nightly ? 'testpypi' : 'pypi'

  pypirc = File.join(Dir.home, '.pypirc')
  has_pypirc = File.exist?(pypirc) && File.read(pypirc).match?(/^\[#{section}\]/m)
  has_env = ENV.fetch(token_env, nil) && !ENV[token_env].empty?
  raise "Missing PyPI credentials: set #{token_env} or configure ~/.pypirc" unless has_pypirc || has_env
end

desc 'Release Python wheel and sdist to pypi'
task :release do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  Rake::Task['py:check_credentials'].invoke(*arguments.to_a)

  if nightly
    puts 'Updating Python version to nightly...'
    Rake::Task['py:version'].invoke('nightly')
    ENV['TWINE_PASSWORD'] = ENV.fetch('TWINE_NIGHTLY_PASSWORD', nil)
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
    bidi_src = "#{bazel_bin}/common/bidi"
    bidi_dest = "#{lib_path}/common/bidi"
    if Dir.exist?(bidi_src)
      FileUtils.mkdir_p(bidi_dest)
      Dir.children(bidi_src).sort.each do |entry|
        src = File.join(bidi_src, entry)
        dest = File.join(bidi_dest, entry)
        next unless File.file?(src) || File.symlink?(src)

        resolved_src = File.symlink?(src) ? File.realpath(src) : src
        FileUtils.rm_f(dest)
        FileUtils.cp(resolved_src, dest)
      end
    end

    %w[common/devtools common/linux common/macos common/windows].each do |dir|
      src = "#{bazel_bin}/#{dir}"
      dest = "#{lib_path}/#{dir}"
      next unless Dir.exist?(src)

      FileUtils.rm_rf(dest)
      FileUtils.cp_r(src, dest)
    end

    %w[getAttribute.js isDisplayed.js findElements.js].each do |atom|
      dest = "#{lib_path}/remote/#{atom}"
      FileUtils.rm_f(dest)
      FileUtils.cp("#{bazel_bin}/remote/#{atom}", dest)
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
  Bazel.execute('run', [], '//py:requirements.update')
end

desc 'Update Python dependencies within declared ranges'
task :update do
  Bazel.execute('run', ['--', '--upgrade'], '//py:requirements.update')
end

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

  Rake::Task['py:version_manager'].invoke(new_version)
end

desc 'Update selenium-manager Python package versions'
task :version_manager, [:new_version] do |_task, arguments|
  new_version = arguments[:new_version]
  raise 'new_version argument required' if new_version.nil? || new_version.empty?

  old_version = manager_python_version
  puts "Updating selenium-manager Python packages from #{old_version} to #{new_version}"

  MANAGER_PYTHON_FILES.each do |file|
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
  end
end

desc 'Build and release selenium-manager Python packages to PyPI'
task :release_manager do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  Rake::Task['py:check_credentials'].invoke(*arguments.to_a)

  if nightly
    puts 'Updating selenium-manager version to nightly...'
    old_version = manager_python_version
    nightly_suffix = ".#{Time.now.strftime('%Y%m%d%H%M')}"
    base = old_version.split('.')[0..2].join('.')
    new_version = "#{base}#{nightly_suffix}"
    Rake::Task['py:version_manager'].invoke(new_version)
    ENV['TWINE_PASSWORD'] = ENV.fetch('TWINE_NIGHTLY_PASSWORD', nil)
  end

  MANAGER_PYTHON_WHEEL_TARGETS.each do |target|
    puts "Building: #{target}"
    Bazel.execute('build', ['--config=release'], target)
  end
end

desc 'Format Python code with ruff'
task :format do
  puts '  Running ruff format...'
  Bazel.execute('run', [], '//py:ruff-format')
end

desc 'Run Python linters (ruff check, mypy, docs)'
task :lint do
  puts '  Running ruff check...'
  Bazel.execute('run', [], '//py:ruff-check')
  puts '  Running mypy...'
  Bazel.execute('run', [], '//py:mypy')
  Rake::Task['py:docs_generate'].invoke
end
