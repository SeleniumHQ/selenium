# frozen_string_literal: true

def node_version
  File.foreach('javascript/selenium-webdriver/package.json') do |line|
    return line.split(':').last.strip.tr('",', '') if line.include?('version')
  end
end

def manager_npm_version
  File.foreach('javascript/selenium-manager/package.json') do |line|
    return line.split(':').last.strip.tr('",', '') if line.include?('version')
  end
end

unless defined?(MANAGER_NPM_FILES)
  MANAGER_NPM_FILES = %w[
    javascript/selenium-manager/package.json
    javascript/selenium-manager/BUILD.bazel
    javascript/selenium-manager-darwin/package.json
    javascript/selenium-manager-darwin/BUILD.bazel
    javascript/selenium-manager-linux-x64/package.json
    javascript/selenium-manager-linux-x64/BUILD.bazel
    javascript/selenium-manager-win32/package.json
    javascript/selenium-manager-win32/BUILD.bazel
  ].freeze
end

def setup_github_npm_auth
  token = ENV.fetch('GITHUB_TOKEN', nil)
  raise 'Missing GitHub token: set GITHUB_TOKEN for nightly npm publish' if token.nil? || token.empty?

  # Configure npm for GitHub Packages
  npmrc = File.join(Dir.home, '.npmrc')
  npmrc_content = [
    "//npm.pkg.github.com/:_authToken=#{token}",
    '@seleniumhq:registry=https://npm.pkg.github.com',
    'always-auth=true'
  ].join("\n")

  if File.exist?(npmrc)
    File.open(npmrc, 'a') { |f| f.puts("\n#{npmrc_content}") }
  else
    File.write(npmrc, "#{npmrc_content}\n")
  end
  File.chmod(0o600, npmrc)

  # Update package.json for GitHub Packages
  package_json = 'javascript/selenium-webdriver/package.json'
  content = File.read(package_json)
  content = content.gsub('https://registry.npmjs.org/', 'https://npm.pkg.github.com')
  content = content.gsub('"name": "selenium-webdriver"', '"name": "@seleniumhq/selenium-webdriver"')
  File.write(package_json, content)
end

desc 'Build Node npm package'
task :build do |_task, arguments|
  args = arguments.to_a
  Bazel.execute('build', args, '//javascript/selenium-webdriver')
end

desc 'Pin JavaScript dependencies via pnpm lockfile'
task :pin do
  Bazel.execute('run', ['--', 'install', '--dir', Dir.pwd, '--lockfile-only'], '@pnpm//:pnpm')
end

desc 'Update JavaScript dependencies and refresh lockfile'
task :update do
  Bazel.execute('run', ['--', 'update', '-r', '--dir', Dir.pwd], '@pnpm//:pnpm')
  Rake::Task['node:pin'].invoke
end

desc 'Validate Node release credentials'
task :check_credentials do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  next if nightly

  npmrc = File.join(Dir.home, '.npmrc')
  has_file = File.exist?(npmrc) && File.read(npmrc).include?('//registry.npmjs.org/:_authToken=')
  has_oidc = ENV.fetch('ACTIONS_ID_TOKEN_REQUEST_URL', nil) && !ENV['ACTIONS_ID_TOKEN_REQUEST_URL'].empty?
  unless has_file || has_oidc
    raise 'Missing npm credentials: configure ~/.npmrc via `npm login` or run via npm trusted publishing'
  end
end

desc 'Release Node npm package (use dry-run to test without publishing)'
task :release do |_task, arguments|
  args = arguments.to_a
  nightly = args.delete('nightly')
  dry_run = args.delete('dry-run')

  Rake::Task['node:check_credentials'].invoke(*(nightly ? ['nightly'] : [])) unless dry_run

  if nightly
    puts 'Updating Node version to nightly...'
    Rake::Task['node:version'].invoke('nightly')
    setup_github_npm_auth unless dry_run
  end

  puts dry_run ? 'Running Node package dry-run...' : 'Running Node package release...'
  target = '//javascript/selenium-webdriver:selenium-webdriver.publish'
  bazel_args = ['--config=release']
  bazel_args += ['--', '--dry-run=true'] if dry_run
  Bazel.execute('run', bazel_args, target)
end

desc 'Release @selenium/manager standalone packages to npm (use dry-run to test without publishing)'
task :release_manager do |_task, arguments|
  args = arguments.to_a
  nightly = args.delete('nightly')
  dry_run = args.delete('dry-run')

  Rake::Task['node:check_credentials'].invoke(*(nightly ? ['nightly'] : [])) unless dry_run

  if nightly
    puts 'Updating @selenium/manager version to nightly...'
    old_version = manager_npm_version
    nightly_suffix = "-nightly#{Time.now.strftime('%Y%m%d%H%M')}"
    base = old_version.split('-').first
    new_version = "#{base}#{nightly_suffix}"
    Rake::Task['node:version_manager'].invoke(new_version)
    setup_github_npm_auth unless dry_run
  end

  bazel_args = ['--config=release']
  bazel_args += ['--', '--dry-run=true'] if dry_run

  targets = [
    '//javascript/selenium-manager-linux-x64:selenium-manager-linux-x64.publish',
    '//javascript/selenium-manager-darwin:selenium-manager-darwin.publish',
    '//javascript/selenium-manager-win32:selenium-manager-win32.publish',
    '//javascript/selenium-manager:selenium-manager.publish'
  ]

  targets.each do |target|
    puts dry_run ? "Dry-run: #{target}" : "Publishing: #{target}"
    Bazel.execute('run', bazel_args, target)
  end
end

desc 'Verify Node package is published on npm'
task :verify do
  SeleniumRake.verify_package_published("https://registry.npmjs.org/selenium-webdriver/#{node_version}")
end

desc 'Alias for node:release'
task deploy: :release

desc 'Generate and stage Node documentation'
task :docs do |_task, arguments|
  if node_version.include?('nightly') && !arguments.to_a.include?('force')
    abort('Aborting documentation update: nightly versions should not update docs.')
  end

  Rake::Task['node:docs_generate'].invoke
end

desc 'Generate Node documentation without staging'
task :docs_generate do
  puts 'Generating Node documentation'
  FileUtils.rm_rf('build/docs/api/javascript/')
  Bazel.execute('run', [], '//javascript/selenium-webdriver:docs')
end

desc 'Install Node package locally via pnpm link'
task :install do
  Bazel.execute('build', [], '//javascript/selenium-webdriver')
  pkg_dir = File.expand_path('bazel-bin/javascript/selenium-webdriver/selenium-webdriver')
  Bazel.execute('run', ['--', '--dir', pkg_dir, 'link', '--global'], '@pnpm//:pnpm')
end

desc 'Update JavaScript changelog'
task :changelogs do
  header = "## #{node_version}\n"
  SeleniumRake.update_changelog(node_version, 'javascript', 'javascript/selenium-webdriver/',
                                'javascript/selenium-webdriver/CHANGES.md', header)
end

desc 'Update Node version'
task :version, [:version] do |_task, arguments|
  old_version = node_version
  nightly = "-nightly#{Time.now.strftime('%Y%m%d%H%M')}"
  new_version = SeleniumRake.updated_version(old_version, arguments[:version], nightly)
  puts "Updating Node from #{old_version} to #{new_version}"

  %w[javascript/selenium-webdriver/package.json javascript/selenium-webdriver/BUILD.bazel].each do |file|
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
  end

  Rake::Task['node:version_manager'].invoke(new_version)
end

desc 'Update @selenium/manager package versions'
task :version_manager, [:new_version] do |_task, arguments|
  new_version = arguments[:new_version]
  raise 'new_version argument required' if new_version.nil? || new_version.empty?

  old_version = manager_npm_version
  puts "Updating @selenium/manager packages from #{old_version} to #{new_version}"

  MANAGER_NPM_FILES.each do |file|
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
  end
end

desc 'Format JavaScript code with prettier'
task :format do
  node_dir = File.expand_path('javascript/selenium-webdriver')
  prettier_config = File.join(node_dir, '.prettierrc')
  puts '  Running prettier...'
  Bazel.execute('run', ['--', node_dir, '--write', "--config=#{prettier_config}", '--log-level=warn'],
                '//javascript:prettier')
end

desc 'Run JavaScript linter (docs only for now, eslint needs bazel integration work)'
task :lint do
  # TODO: Add eslint once bazel target properly resolves workspace modules
  Rake::Task['node:docs_generate'].invoke
end
