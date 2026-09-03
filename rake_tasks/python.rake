# frozen_string_literal: true

require 'find'

def python_version
  File.foreach('py/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
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

  unless nightly
    already_published = begin
      Rake::Task['py:verify'].invoke
      true
    rescue StandardError
      false
    ensure
      Rake::Task['py:verify'].reenable
    end

    if already_published
      puts 'Python package already published — skipping release.'
      next
    end
  end

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
  Bazel.execute('build', [], '//py:selenium-wheel')

  bazel_bin = 'bazel-bin/py/selenium/webdriver'
  lib_path = 'py/selenium/webdriver'

  if arguments[:all] == 'all'
    dirs = Dir.children(bazel_bin)
    files = []
  else
    dirs = %w[common/bidi common/_bidi common/devtools]
    files = %w[
      remote/getAttribute.js remote/isDisplayed.js remote/findElements.js
      common/mutation-listener.js common/bidi-mutation-listener.js
      common/linux/selenium-manager common/macos/selenium-manager common/windows/selenium-manager.exe
      firefox/webdriver_prefs.json
    ]
  end

  dirs.each do |dir|
    src_dir = "#{bazel_bin}/#{dir}"
    dest_dir = "#{lib_path}/#{dir}"

    FileUtils.rm_rf(dest_dir)
    # Restore any git tracked files in the directory we just deleted
    SeleniumRake.git.checkout_file('HEAD', dest_dir) unless SeleniumRake.git.ls_files(dest_dir).empty?

    # Copy each file individually to resolve Bazel's cache symlinks
    Dir.glob(File.join(src_dir, '**', '*')).each do |src|
      next unless File.file?(src)

      dest = File.join(dest_dir, src.delete_prefix("#{src_dir}/"))
      FileUtils.mkdir_p(File.dirname(dest))
      FileUtils.cp(File.realpath(src), dest)
    end
  end

  files.each do |file|
    dest = "#{lib_path}/#{file}"
    FileUtils.mkdir_p(File.dirname(dest))
    FileUtils.rm_f(dest)
    FileUtils.cp(File.realpath("#{bazel_bin}/#{file}"), dest)
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

  # Generate API listing, deprecation data, and stub files in source tree
  Bazel.execute('run', [], '//py:generate-api-listing')
  Bazel.execute('run', [], '//py:generate-deprecations')
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

desc 'Update Python dependencies to latest versions within specified range'
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
end

desc 'Format Python code with ruff'
task :format do
  puts '  Running ruff format...'
  Bazel.execute('run', [], '//py:ruff-format')
end

desc 'Run Python linters (ruff check --no-fix, mypy, docs)'
task :lint do
  SeleniumRake.aggregate_errors(
    ruff_check: -> { Bazel.execute('run', ['--', '--no-fix'], '//py:ruff-check') },
    mypy: -> { Bazel.execute('run', [], '//py:mypy') },
    python_docs: -> { Rake::Task['py:docs_generate'].invoke }
  )
end
