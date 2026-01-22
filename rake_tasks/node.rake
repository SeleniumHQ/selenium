# frozen_string_literal: true

def node_version
  File.foreach('javascript/selenium-webdriver/package.json') do |line|
    return line.split(':').last.strip.tr('",', '') if line.include?('version')
  end
end

def setup_npm_auth
  npmrc = File.join(Dir.home, '.npmrc')
  return if File.exist?(npmrc) && File.read(npmrc).include?('//registry.npmjs.org/:_authToken=')

  token = ENV.fetch('NODE_AUTH_TOKEN', nil)
  raise 'Missing npm credentials: set NODE_AUTH_TOKEN or configure ~/.npmrc' if token.nil? || token.empty?

  auth_line = "//registry.npmjs.org/:_authToken=#{token}"
  if File.exist?(npmrc)
    File.open(npmrc, 'a') { |f| f.puts(auth_line) }
  else
    File.write(npmrc, "#{auth_line}\n")
  end
  File.chmod(0o600, npmrc)
end

desc 'Build Node npm package'
task :build do |_task, arguments|
  args = arguments.to_a
  Bazel.execute('build', args, '//javascript/selenium-webdriver')
end

desc 'Pin JavaScript dependencies via pnpm lockfile'
task :pin do
  Bazel.execute('run', ['--', 'install', '--dir', Dir.pwd, '--lockfile-only'], '@pnpm//:pnpm')
  SeleniumRake.git.add('pnpm-lock.yaml')
end

desc 'Update JavaScript dependencies and refresh lockfile (use "latest" to bump ranges)'
task :update, [:latest] do |_task, arguments|
  args = ['--', 'update', '-r']
  args << '--latest' if arguments[:latest] == 'latest'
  args += ['--dir', Dir.pwd]
  Bazel.execute('run', args, '@pnpm//:pnpm')
  Rake::Task['node:pin'].invoke
end

desc 'Validate Node release credentials'
task :check_credentials do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  next if nightly

  npmrc = File.join(Dir.home, '.npmrc')
  has_file = File.exist?(npmrc) && File.read(npmrc).include?('//registry.npmjs.org/:_authToken=')
  has_env = ENV.fetch('NODE_AUTH_TOKEN', nil) && !ENV['NODE_AUTH_TOKEN'].empty?
  raise 'Missing npm credentials: set NODE_AUTH_TOKEN or configure ~/.npmrc' unless has_file || has_env
end

desc 'Release Node npm package (use dry-run to test without publishing)'
task :release do |_task, arguments|
  args = arguments.to_a
  nightly = args.delete('nightly')
  dry_run = args.delete('dry-run')

  Rake::Task['node:check_credentials'].invoke(*(nightly ? ['nightly'] : [])) unless dry_run
  setup_npm_auth unless nightly || dry_run

  if nightly
    puts 'Updating Node version to nightly...'
    Rake::Task['node:version'].invoke('nightly')
  end

  puts dry_run ? 'Running Node package dry-run...' : 'Running Node package release...'
  target = '//javascript/selenium-webdriver:selenium-webdriver.publish'
  bazel_args = ['--config=release']
  bazel_args += ['--', '--dry-run=true'] if dry_run
  Bazel.execute('run', bazel_args, target)
end

desc 'Verify Node package is published on npm'
task :verify do
  SeleniumRake.verify_package_published("https://registry.npmjs.org/selenium-webdriver/#{node_version}")
end

desc 'Alias for node:release'
task deploy: :release

desc 'Generate Node documentation'
task :docs do |_task, arguments|
  if node_version.include?('nightly') && !arguments.to_a.include?('force')
    abort('Aborting documentation update: nightly versions should not update docs.')
  end

  puts 'Generating Node documentation'
  FileUtils.rm_rf('build/docs/api/javascript/')
  Bazel.execute('run', [], '//javascript/selenium-webdriver:docs')
end

desc 'Install Node package locally via npm link'
task :install do
  Bazel.execute('build', [], '//javascript/selenium-webdriver')
  Dir.chdir('bazel-bin/javascript/selenium-webdriver/selenium-webdriver') do
    sh 'npm', 'link'
  end
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
    SeleniumRake.git.add(file)
  end
end

desc 'Run Node linter (prettier)'
task :lint do |_task, arguments|
  args = arguments.to_a
  node_dir = File.expand_path('javascript/selenium-webdriver')
  prettier_config = File.join(node_dir, '.prettierrc')
  puts '  Running prettier...'
  Bazel.execute('run', args + ['--', node_dir, '--write', "--config=#{prettier_config}", '--log-level=warn'],
                '//javascript:prettier')
end
