# frozen_string_literal: true

require 'find'

def python_version
  SeleniumRake.version('python')
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
  config = arguments.to_a.include?('rbe') ? 'rbe_release' : 'release'

  Rake::Task['py:check_credentials'].invoke(*arguments.to_a)

  if nightly
    puts 'Updating Python version to nightly...'
    Rake::Task['py:version'].invoke('nightly')
    # Each nightly publish needs its own version; the committed one is dev0
    SeleniumRake.write_version('python', python_version.sub(/dev0$/, "dev#{Time.now.strftime('%Y%m%d%H%M')}"))
    ENV['TWINE_PASSWORD'] = ENV.fetch('TWINE_NIGHTLY_PASSWORD', nil)
  end

  command = nightly ? '//py:selenium-release-nightly' : '//py:selenium-release'
  puts "Running Python release command: #{command}"
  Bazel.execute('run', ["--config=#{config}"], command)
end

desc 'Verify Python package is published on PyPI'
task :verify do
  SeleniumRake.verify_package_published("https://pypi.org/pypi/selenium/#{python_version}/json")
end

desc 'Copy known generated files for local development (use `./go py:local_dev all` to copy everything)'
task :local_dev, [:all] do |_task, arguments|
  Bazel.execute('build', [], %w[//py:selenium-wheel //py:version-py-release])
  FileUtils.rm_f('py/selenium/_version.py')
  FileUtils.cp(File.realpath('bazel-bin/py/release/selenium/_version.py'), 'py/selenium/_version.py')

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
      common/linux-x86_64/selenium-manager common/linux-arm64/selenium-manager
      common/macos/selenium-manager common/windows/selenium-manager.exe
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
  if python_version.include?('dev') && !arguments.to_a.include?('force')
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

desc 'Update Python dependencies to latest versions within specified range'
task :update do
  Bazel.execute('run', ['--', '--upgrade'], '//py:requirements.update')
end

desc 'Update Python changelog'
task :changelogs do
  header = "Selenium #{python_version}"
  SeleniumRake.update_changelog(python_version, 'python', 'py/selenium/webdriver', 'py/CHANGES', header)
end

desc 'Update Python version'
task :version, [:version] do |_task, arguments|
  old_version = python_version
  new_version = SeleniumRake.updated_version(old_version, arguments[:version], '.dev0')
  puts "Updating Python from #{old_version} to #{new_version}"
  SeleniumRake.write_version('python', new_version)
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
