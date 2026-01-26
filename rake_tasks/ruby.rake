# frozen_string_literal: true

require 'digest'
require 'net/http'

def ruby_version
  File.foreach('rb/lib/selenium/webdriver/version.rb') do |line|
    return line.split('=').last.strip.tr("'", '') if line.include?('VERSION')
  end
end

def setup_gem_credentials
  gem_dir = File.join(Dir.home, '.gem')
  credentials = File.join(gem_dir, 'credentials')
  return if File.exist?(credentials) && File.read(credentials).include?(':rubygems_api_key:')

  token = ENV.fetch('GEM_HOST_API_KEY', nil)
  if token.nil? || token.empty?
    raise 'Missing RubyGems credentials: set GEM_HOST_API_KEY or configure ~/.gem/credentials'
  end

  FileUtils.mkdir_p(gem_dir)
  if File.exist?(credentials)
    File.open(credentials, 'a') { |f| f.puts(":rubygems_api_key: #{token}") }
  else
    File.write(credentials, ":rubygems_api_key: #{token}\n")
  end
  File.chmod(0o600, credentials)
end

desc 'Generate Ruby gems'
task :build do |_task, arguments|
  args = arguments.to_a
  webdriver = args.delete('webdriver')
  devtools = args.delete('devtools')

  Bazel.execute('build', args, '//rb:selenium-webdriver') if webdriver || !devtools
  Bazel.execute('build', args, '//rb:selenium-devtools') if devtools || !webdriver
end

desc 'Update generated Ruby files for local development'
task :local_dev do
  puts 'installing ruby, this may take a minute'
  Bazel.execute('build', [], '@bundle//:bundle')
  Rake::Task['rb:build'].invoke
  Rake::Task['grid'].invoke
  # A command like this is required to move ruby binary into working directory
  Bazel.execute('build', %w[--test_arg --dry-run], '@bundle//bin:rubocop')
end

desc 'Validate Ruby release credentials'
task :check_credentials do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  next if nightly

  credentials = File.join(Dir.home, '.gem', 'credentials')
  has_file = File.exist?(credentials) && File.read(credentials).include?(':rubygems_api_key:')
  has_env = ENV.fetch('GEM_HOST_API_KEY', nil) && !ENV['GEM_HOST_API_KEY'].empty?
  raise 'Missing RubyGems credentials: set GEM_HOST_API_KEY or configure ~/.gem/credentials' unless has_file || has_env
end

desc 'Push Ruby gems to rubygems'
task :release do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  Rake::Task['rb:check_credentials'].invoke(*arguments.to_a)

  if nightly
    puts 'Bumping Ruby nightly version...'
    Bazel.execute('run', [], '//rb:selenium-webdriver-bump-nightly-version')

    puts 'Releasing nightly WebDriver gem...'
    Bazel.execute('run', ['--config=release'], '//rb:selenium-webdriver-release-nightly')
  else
    setup_gem_credentials
    patch_release = ruby_version.split('.').fetch(2, '0').to_i.positive?

    puts 'Releasing Ruby gems...'
    Bazel.execute('run', ['--config=release'], '//rb:selenium-webdriver-release')
    Bazel.execute('run', ['--config=release'], '//rb:selenium-devtools-release') unless patch_release
  end
end

desc 'Verify Ruby packages are published on RubyGems'
task :verify do
  patch_release = ruby_version.split('.').fetch(2, '0').to_i.positive?

  SeleniumRake.verify_package_published("https://rubygems.org/api/v2/rubygems/selenium-webdriver/versions/#{ruby_version}.json")
  unless patch_release
    SeleniumRake.verify_package_published("https://rubygems.org/api/v2/rubygems/selenium-devtools/versions/#{ruby_version}.json")
  end
end

desc 'Generate Ruby documentation'
task :docs do |_task, arguments|
  if ruby_version.include?('nightly') && !arguments.to_a.include?('force')
    abort('Aborting documentation update: nightly versions should not update docs.')
  end
  puts 'Generating Ruby documentation'

  FileUtils.rm_rf('build/docs/api/rb/')
  Bazel.execute('run', [], '//rb:docs')
  FileUtils.mkdir_p('build/docs/api')
  FileUtils.cp_r('bazel-bin/rb/docs.sh.runfiles/_main/docs/api/rb/.', 'build/docs/api/rb')
end

desc 'Install Ruby gem locally'
task :install do
  Bazel.execute('build', [], '//rb:selenium-webdriver')
  Dir.glob('bazel-bin/rb/selenium-webdriver-*.gem').each do |gem|
    sh 'gem', 'install', gem
  end
end

desc 'Update Ruby changelog'
task :changelogs do
  header = "#{ruby_version} (#{Time.now.strftime('%Y-%m-%d')})\n========================="
  SeleniumRake.update_changelog(ruby_version, 'rb', 'rb/lib/', 'rb/CHANGES', header)
end

desc 'Update Ruby version'
task :version, [:version] do |_task, arguments|
  old_version = ruby_version
  new_version = SeleniumRake.updated_version(old_version, arguments[:version], '.nightly')
  puts "Updating Ruby from #{old_version} to #{new_version}"

  file = 'rb/lib/selenium/webdriver/version.rb'
  text = File.read(file).gsub(old_version, new_version)
  File.open(file, 'w') { |f| f.puts text }
end

desc 'Run Ruby linting'
task :lint do |_task, arguments|
  args = arguments.to_a
  puts '  Running rubocop...'
  Bazel.execute('run', args, '//rb:lint')
  puts '  Running steep type checker...'
  Bazel.execute('run', args, '//rb:steep')
end

desc 'Sync gem checksums from Gemfile.lock to MODULE.bazel (use force to re-download all)'
task :pin, [:force] do |_task, arguments|
  gemfile_lock = 'rb/Gemfile.lock'
  module_bazel = 'MODULE.bazel'
  force = arguments[:force] == 'force'

  lock_content = File.read(gemfile_lock)
  gem_section = lock_content[/GEM\n\s+remote:.*?\n\s+specs:\n(.*?)(?=\n[A-Z]|\Z)/m, 1]
  gems = gem_section.scan(/^    ([a-zA-Z0-9_-]+) \(([^)]+)\)$/)
  needed_gems = gems.map { |name, version| "#{name}-#{version}" }

  # Parse existing checksums from MODULE.bazel
  module_content = File.read(module_bazel)
  existing = module_content.scan(/"([^"]+)":\s*"([a-f0-9]{64})"/).to_h

  # Keep existing checksums for gems still in Gemfile.lock (unless force)
  checksums = force ? {} : existing.slice(*needed_gems)
  to_download = needed_gems - checksums.keys

  puts "Found #{gems.size} gems: #{checksums.size} cached, #{to_download.size} to download..."

  failed = []
  to_download.each do |key|
    uri = URI("https://rubygems.org/gems/#{key}.gem")
    response = nil

    5.times do
      response = Net::HTTP.get_response(uri)
      break unless response.is_a?(Net::HTTPRedirection)

      uri = URI(response['location'])
    end

    unless response.is_a?(Net::HTTPSuccess)
      puts "  #{key}: failed (HTTP #{response.code})"
      failed << key
      next
    end

    sha = Digest::SHA256.hexdigest(response.body)
    checksums[key] = sha
    puts "  #{key}: #{sha[0, 16]}..."
  rescue StandardError => e
    puts "  #{key}: failed (#{e.message})"
    failed << key
  end

  raise "Failed to download checksums for: #{failed.join(', ')}" if failed.any?

  checksums_lines = checksums.keys.sort.map { |k| "        \"#{k}\": \"#{checksums[k]}\"," }
  formatted = "    gem_checksums = {\n#{checksums_lines.join("\n")}\n    },"

  new_content = module_content.sub(/    gem_checksums = \{[^}]+\},/m, formatted)
  File.write(module_bazel, new_content)
end

desc 'Update Ruby dependencies and sync checksums to MODULE.bazel'
task :update do
  puts 'updating and pinning gem versions'
  Bazel.execute('run', [], '//rb:bundle-update')
  Bazel.execute('run', [], '//rb:rbs-update')
  Rake::Task['rb:pin'].invoke
end
