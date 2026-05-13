# frozen_string_literal: true

require 'English'
$LOAD_PATH.unshift File.expand_path('.')

require 'base64'
require 'json'
require 'rake'
require 'rbconfig'
require 'net/http'
require 'net/telnet'
require 'stringio'
require 'fileutils'
require 'open-uri'
require 'git'
require 'find'

Rake.application.instance_variable_set(:@name, 'go')
orig_verbose = verbose
verbose(false)

require 'rake_tasks/bazel'
require 'rake_tasks/common'

$DEBUG = orig_verbose != Rake::FileUtilsExt::DEFAULT ||
         ENV['debug'] == 'true' ||
         ENV.fetch('DEBUG', nil) ||
         ENV.fetch('SE_DEBUG', nil)

verbose($DEBUG)
SeleniumRake.git = Git.open(__dir__)

# Load language-specific rake files within namespaces
namespace(:java) { load 'rake_tasks/java.rake' }
namespace(:rb) { load 'rake_tasks/ruby.rake' }
namespace(:ruby) { load 'rake_tasks/ruby.rake' }
namespace(:py) { load 'rake_tasks/python.rake' }
namespace(:python) { load 'rake_tasks/python.rake' } # alias
namespace(:node) { load 'rake_tasks/node.rake' }
namespace(:js) { load 'rake_tasks/node.rake' } # alias
namespace(:javascript) { load 'rake_tasks/node.rake' } # alias
namespace(:dotnet) { load 'rake_tasks/dotnet.rake' }
namespace(:rust) { load 'rake_tasks/rust.rake' }
namespace(:bazel) { load 'rake_tasks/bazel.rake' }
namespace(:appium) { load 'rake_tasks/appium.rake' }

# If it looks like a bazel target, build it with bazel
rule(%r{//.*}) do |task|
  Bazel.execute('build', %w[], task.name)
end

task default: [:grid]
task grid: [:'java:grid']

# ./go update_browser stable
# ./go update_browser beta
desc 'Update pinned browser versions'
task :update_browsers, [:channel] do |_task, arguments|
  chrome_channel = arguments[:channel] || 'Stable'
  chrome_channel = 'beta' if chrome_channel == 'early-stable'
  args = ['--', "--chrome_channel=#{chrome_channel.capitalize}"]

  puts 'pinning updated browsers and drivers'
  Bazel.execute('run', args, '//scripts:pinned_browsers')
end

desc 'Update Selenium Manager to latest release'
task :update_manager do |_task, _arguments|
  puts 'Updating Selenium Manager references'
  Bazel.execute('run', [], '//scripts:selenium_manager')
end

desc 'Update multitool binaries to latest releases'
task :update_multitool do |_task, _arguments|
  puts 'Updating multitool binary versions'
  Bazel.execute('run', [], '//scripts:update_multitool_binaries')
end

desc 'Update dependencies for release'
task :release_update do |_task, _arguments|
  Rake::Task[:update_multitool].invoke
end

desc 'Update Chrome DevTools support'
task :update_cdp, [:channel] do |_task, arguments|
  chrome_channel = arguments[:channel] || 'stable'
  chrome_channel = 'beta' if chrome_channel == 'early-stable'
  args = ['--', "--chrome_channel=#{chrome_channel.capitalize}"]

  puts "Updating Chrome DevTools references to include latest from #{chrome_channel} channel"
  Bazel.execute('run', args, '//scripts:update_cdp')
end

task ios_driver: 'appium:build'

desc 'Update AUTHORS file'
task :authors do
  puts 'Updating AUTHORS file'
  sh "(git log --use-mailmap --format='%aN <%aE>' ; " \
     'cat .OLD_AUTHORS ; cat AUTHORS) | ' \
     'sort -uf > AUTHORS.tmp && mv AUTHORS.tmp AUTHORS'
end

# Example: `./go release_updates selenium-4.31.0 early-stable`
# Example: `./go release_updates selenium-4.31.1-ruby`
desc 'Update everything in preparation for a release'
task :release_updates, [:tag, :channel] do |_task, arguments|
  parsed = SeleniumRake.parse_tag(arguments[:tag])
  version = parsed[:version]
  language = parsed[:language]

  if parsed[:patch].zero?
    Rake::Task['update_browsers'].invoke(arguments[:channel])
    Rake::Task['update_cdp'].invoke(arguments[:channel])
    Rake::Task['update_manager'].invoke
    Rake::Task['update_multitool'].invoke
    Rake::Task['authors'].invoke
    Rake::Task['rust:version'].invoke(version)
    Rake::Task['rust:update'].invoke
    Rake::Task['rust:changelogs'].invoke
  end

  Rake::Task["#{language}:version"].invoke(version)
  Rake::Task["#{language}:update"].invoke
  Rake::Task["#{language}:changelogs"].invoke
end

desc 'Format code (auto-fix issues across project, skip with -<lang>)'
task :format do |_task, arguments|
  args = arguments.to_a

  puts 'Formatting Bazel files...'
  Bazel.execute('run', [], '//:buildifier')

  puts 'Updating copyright headers...'
  Bazel.execute('run', [], '//scripts:update_copyright')

  unless args.delete('-rust')
    puts 'Formatting rust...'
    Rake::Task['rust:format'].invoke
  end

  Rake::Task['all:format'].invoke(*args)
end

desc 'Run linters (may auto-fix some issues; stricter checks than :format)'
task :lint do
  puts 'Linting shell scripts and GitHub Actions...'
  shellcheck = Bazel.execute('build', [], '@multitool//tools/shellcheck')
  Bazel.execute('run', ['--', '-shellcheck', shellcheck], '@multitool//tools/actionlint:cwd')

  Rake::Task['all:lint'].invoke
end

# Legacy aliases - call namespaced tasks
task 'selenium-server-standalone' => 'java:grid'
task 'selenium-java' => 'java:client'
task javadocs: 'java:docs'
task 'java-release-zip': 'java:package'
task 'maven-install': 'java:install'
task 'publish-maven' => 'java:release'
task 'publish-maven-snapshot' do
  Rake::Task['java:release'].invoke('nightly')
end
task 'release-java' => 'java:release'

LANG_ALIASES = {
  'python' => 'py', 'ruby' => 'rb', 'javascript' => 'node', 'js' => 'node'
}.freeze

namespace :all do
  desc 'Pin dependencies for all language bindings'
  task :pin do
    Rake::Task['java:pin'].invoke
    Rake::Task['rb:pin'].invoke
    Rake::Task['node:pin'].invoke
    Rake::Task['dotnet:pin'].invoke
  end

  desc 'Update dependencies for all language bindings'
  task :update do
    Rake::Task['java:update'].invoke
    Rake::Task['rb:update'].invoke
    Rake::Task['node:update'].invoke
    Rake::Task['dotnet:update'].invoke
  end

  desc 'Build all API Documentation'
  task :docs do |_task, arguments|
    args = arguments.to_a
    Rake::Task['java:docs'].invoke(*args)
    Rake::Task['py:docs'].invoke(*args)
    Rake::Task['rb:docs'].invoke(*args)
    Rake::Task['dotnet:docs'].invoke(*args)
    Rake::Task['node:docs'].invoke(*args)
  end

  desc 'Build all artifacts for all language bindings'
  task :build do |_task, arguments|
    Rake::Task['java:build'].invoke(*arguments.to_a)
    Rake::Task['py:build'].invoke(*arguments.to_a)
    Rake::Task['rb:build'].invoke(*arguments.to_a)
    Rake::Task['dotnet:build'].invoke(*arguments.to_a)
    Rake::Task['node:build'].invoke(*arguments.to_a)
  end

  desc 'Package or build stamped artifacts for distribution in GitHub Release assets'
  task :package do |_task, arguments|
    Rake::Task['java:package'].invoke(*arguments.to_a)
    Rake::Task['dotnet:package'].invoke(*arguments.to_a)
  end

  desc 'Validate release credentials for all languages'
  task :check_credentials do |_task, arguments|
    args = arguments.to_a
    failures = []
    %w[java py rb dotnet node].each do |lang|
      Rake::Task["#{lang}:check_credentials"].invoke(*args)
    rescue StandardError => e
      failures << "#{lang}: #{e.message}"
    end
    raise "Credential check failed:\n#{failures.join("\n")}" unless failures.empty?
  end

  desc 'Verify all packages are published to their registries'
  task :verify do
    failures = []
    %w[java py rb dotnet node].each do |lang|
      Rake::Task["#{lang}:verify"].invoke
    rescue StandardError => e
      failures << "#{lang}: #{e.message}"
    end
    raise "Verification failed:\n#{failures.join("\n")}" unless failures.empty?
  end

  desc 'Release all artifacts for all language bindings'
  task :release do |_task, arguments|
    args = arguments.to_a.include?('nightly') ? ['nightly'] : []
    Rake::Task['java:release'].invoke(*args)
    Rake::Task['py:release'].invoke(*args)
    Rake::Task['rb:release'].invoke(*args)
    Rake::Task['dotnet:release'].invoke(*args)
    Rake::Task['node:release'].invoke(*args)
  end

  desc 'Format code for all language bindings (skip with -java -py -rb -dotnet -node)'
  task :format do |_task, arguments|
    all_langs = %w[java py rb dotnet node]
    skip = arguments.to_a.map { |a| LANG_ALIASES.fetch(a.delete_prefix('-'), a.delete_prefix('-')) }
    (all_langs - skip).each do |lang|
      puts "Formatting #{lang}..."
      Rake::Task["#{lang}:format"].invoke
    end
  end

  desc 'Run linters for all language bindings'
  task :lint do
    all_langs = %w[java py rb dotnet node]
    failures = []
    all_langs.each do |lang|
      puts "Linting #{lang}..."
      Rake::Task["#{lang}:lint"].invoke
    rescue StandardError => e
      failures << "#{lang}: #{e.message}"
    end
    raise "Lint failed:\n#{failures.join("\n")}" unless failures.empty?
  end

  desc 'Update versions for all language bindings'
  task :version, [:version] do |_task, arguments|
    version = arguments[:version] || 'nightly'
    puts "Updating all versions to #{version}"

    Rake::Task['java:version'].invoke(version)
    Rake::Task['rb:version'].invoke(version)
    Rake::Task['node:version'].invoke(version)
    Rake::Task['py:version'].invoke(version)
    Rake::Task['dotnet:version'].invoke(version)

    unless version == 'nightly'
      major_minor = arguments[:version][/^\d+\.\d+/]
      file = '.github/ISSUE_TEMPLATE/bug-report.yml'
      old_version_pattern = /The latest released version of Selenium is (\d+\.\d+)/

      text = File.read(file).gsub(old_version_pattern, "The latest released version of Selenium is #{major_minor}")
      File.write(file, text)
    end
  end

  desc 'Update changelogs for all language bindings'
  task :changelogs do |_task, _arguments|
    puts 'Updating all changelogs'
    Rake::Task['java:changelogs'].invoke
    Rake::Task['rb:changelogs'].invoke
    Rake::Task['node:changelogs'].invoke
    Rake::Task['py:changelogs'].invoke
    Rake::Task['dotnet:changelogs'].invoke
  end
end
