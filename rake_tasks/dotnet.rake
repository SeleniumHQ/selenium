# frozen_string_literal: true

def dotnet_version
  File.foreach('dotnet/version.bzl') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end

desc 'Build nupkg files'
task :build do |_task, arguments|
  Bazel.execute('build', arguments.to_a, '//dotnet:all')
end

desc 'Package .NET bindings into zipped assets and stage for release'
task :package do |_task, arguments|
  args = arguments.to_a.empty? ? ['--stamp'] : arguments.to_a
  Rake::Task['dotnet:build'].invoke(*args)
  mkdir_p 'build/dist'
  FileUtils.rm_f(Dir.glob('build/dist/*dotnet*'))

  FileUtils.copy('bazel-bin/dotnet/release.zip', "build/dist/selenium-dotnet-#{dotnet_version}.zip")
  FileUtils.chmod(0o644, "build/dist/selenium-dotnet-#{dotnet_version}.zip")
  FileUtils.copy('bazel-bin/dotnet/strongnamed.zip', "build/dist/selenium-dotnet-strongnamed-#{dotnet_version}.zip")
  FileUtils.chmod(0o644, "build/dist/selenium-dotnet-strongnamed-#{dotnet_version}.zip")
end

desc 'Validate .NET release credentials'
task :check_credentials do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  if nightly && (ENV['GITHUB_TOKEN'].nil? || ENV['GITHUB_TOKEN'].empty?)
    raise 'Missing GitHub token: set GITHUB_TOKEN for nightly releases'
  elsif !nightly && (ENV['NUGET_API_KEY'].nil? || ENV['NUGET_API_KEY'].empty?)
    raise 'Missing NuGet API key: set NUGET_API_KEY'
  end
end

desc 'Build, package, and push nupkg files to NuGet'
task :release do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')
  Rake::Task['dotnet:check_credentials'].invoke(*arguments.to_a)

  if nightly
    puts 'Updating .NET version to nightly...'
    Rake::Task['dotnet:version'].invoke('nightly')
    ENV['NUGET_API_KEY'] = ENV.fetch('GITHUB_TOKEN', nil)
    ENV['NUGET_SOURCE'] = 'https://nuget.pkg.github.com/seleniumhq/index.json'
  else
    ENV['NUGET_SOURCE'] = 'https://api.nuget.org/v3/index.json'
  end

  puts 'Building and packaging .NET artifacts...'
  Rake::Task['dotnet:package'].invoke('--config=release')

  puts "Pushing .NET packages to #{ENV.fetch('NUGET_SOURCE', nil)}..."
  Bazel.execute('run', ['--config=release'], '//dotnet:publish')
end

desc 'Verify .NET packages are published on NuGet'
task :verify do
  SeleniumRake.verify_package_published("https://api.nuget.org/v3/registration5-semver1/selenium.webdriver/#{dotnet_version}.json")
  SeleniumRake.verify_package_published("https://api.nuget.org/v3/registration5-semver1/selenium.support/#{dotnet_version}.json")
end

desc 'Generate and stage .NET documentation'
task :docs do |_task, arguments|
  if dotnet_version.include?('nightly') && !arguments.to_a.include?('force')
    abort('Aborting documentation update: nightly versions should not update docs.')
  end

  Rake::Task['dotnet:docs_generate'].invoke
end

desc 'Generate .NET documentation without staging'
task :docs_generate do
  puts 'Generating .NET documentation'
  FileUtils.rm_rf('build/docs/api/dotnet/')
  Bazel.execute('run', [], '//dotnet:docs')
end

desc 'Install .NET packages to local NuGet cache'
task :install do
  Bazel.execute('build', [], '//dotnet/src/webdriver:webdriver-pack')
  Bazel.execute('build', [], '//dotnet/src/support:support-pack')
  Dir.glob('bazel-bin/dotnet/src/**/*.nupkg').each do |nupkg|
    sh 'dotnet', 'nuget', 'push', nupkg, '--source', "#{Dir.home}/.nuget/packages"
  end
end

desc 'Update .NET changelog'
task :changelogs do
  header = "v#{dotnet_version}\n======"
  SeleniumRake.update_changelog(dotnet_version, 'dotnet', 'dotnet/src/', 'dotnet/CHANGELOG', header)
end

desc 'Update .NET version'
task :version, [:version] do |_task, arguments|
  old_version = dotnet_version
  nightly = "-nightly#{Time.now.strftime('%Y%m%d%H%M')}"
  new_version = SeleniumRake.updated_version(old_version, arguments[:version], nightly)
  puts "Updating .NET from #{old_version} to #{new_version}"

  file = 'dotnet/version.bzl'
  text = File.read(file).gsub(old_version, new_version)
  File.open(file, 'w') { |f| f.puts text }
end

desc 'Update .NET dependencies to latest versions'
task :update do
  Bazel.execute('run', [], '//dotnet:paket-update')
  Rake::Task['dotnet:pin'].invoke
end

desc 'Pin .NET dependencies (sync lockfile)'
task :pin do
  Bazel.execute('run', [], '//dotnet:paket-install')
  Bazel.execute('run', ['--', '--dependencies-file', "#{Dir.pwd}/dotnet/paket.dependencies",
                        '--output-folder', "#{Dir.pwd}/dotnet"],
                '@rules_dotnet//tools/paket2bazel:paket2bazel')
end

desc 'Format .NET code (whitespace and style)'
task :format do
  # style needs to run before whitespace
  puts '  Running dotnet format style...'
  Bazel.execute('run', ['--', 'style', '--severity', 'warn'], '//dotnet:format')
  puts '  Running dotnet format whitespace...'
  Bazel.execute('run', ['--', 'whitespace'], '//dotnet:format')
end

desc 'Run .NET linter (dotnet format analyzers, docs)'
task :lint do
  puts '  Running dotnet format analyzers...'
  Bazel.execute('run', ['--', 'analyzers', '--verify-no-changes'], '//dotnet:format')
  Rake::Task['dotnet:docs_generate'].invoke

  # TODO: Identify specific diagnostics that we want to enforce but can't be auto-corrected (e.g., 'IDE0060'):
  enforced_diagnostics = []
  next if enforced_diagnostics.empty?

  arguments = %w[-- style --severity info --verify-no-changes --diagnostics] + enforced_diagnostics
  Bazel.execute('run', arguments, '//dotnet:format')
end
