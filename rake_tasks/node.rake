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

namespace :node do
  atom_list = %w[
    //javascript/atoms/fragments:find-elements
    //javascript/atoms/fragments:is-displayed
    //javascript/webdriver/atoms:get-attribute
  ]

  task atoms: atom_list do
    base_dir = 'javascript/selenium-webdriver/lib/atoms'
    mkdir_p base_dir

    ['bazel-bin/javascript/atoms/fragments/is-displayed.js',
     'bazel-bin/javascript/webdriver/atoms/get-attribute.js',
     'bazel-bin/javascript/atoms/fragments/find-elements.js'].each do |atom|
      name = File.basename(atom)
      puts "Generating #{atom} as #{name}"
      File.open(File.join(base_dir, name), 'w') do |f|
        f << "// GENERATED CODE - DO NOT EDIT\n"
        f << 'module.exports = '
        f << File.read(atom).strip
        f << ";\n"
      end
    end
  end

  desc 'Build Node npm package'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
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

  task :'dry-run' do
    Bazel.execute('run', ['--stamp'],
                  '//javascript/selenium-webdriver:selenium-webdriver.publish  -- --dry-run=true')
  end

  desc 'Release Node npm package'
  task :release do |_task, arguments|
    nightly = arguments.to_a.include?('nightly')
    setup_npm_auth unless nightly

    if nightly
      puts 'Updating Node version to nightly...'
      Rake::Task['node:version'].invoke('nightly') if nightly
    end

    puts 'Running Node package release...'
    Bazel.execute('run', ['--config=release'], '//javascript/selenium-webdriver:selenium-webdriver.publish')
  end

  desc 'Verify Node package is published on npm'
  task :verify do
    SeleniumRake.verify_package_published("https://registry.npmjs.org/selenium-webdriver/#{node_version}")
  end

  task deploy: :release

  desc 'Generate Node documentation'
  task :docs do |_task, arguments|
    if node_version.include?('nightly') && !arguments.to_a.include?('force')
      abort('Aborting documentation update: nightly versions should not update docs.')
    end

    puts 'Generating Node documentation'
    FileUtils.rm_rf('build/docs/api/javascript/')
    Bazel.execute('run', [], '//javascript/selenium-webdriver:docs')

    SeleniumRake.update_gh_pages unless arguments.to_a.include?('skip_update')
  end

  desc 'Update JavaScript changelog'
  task :changelog do
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
end
