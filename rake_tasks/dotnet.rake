# frozen_string_literal: true

def dotnet_version
  File.foreach('dotnet/selenium-dotnet-version.bzl') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end

namespace :dotnet do
  desc 'Build nupkg files'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('build', args, '//dotnet:all')
  end

  desc 'Package .NET bindings into zipped assets and stage for release'
  task :package do |_task, arguments|
    args = arguments.to_a.compact.empty? ? ['--stamp'] : arguments.to_a.compact
    Rake::Task['dotnet:build'].invoke(*args)
    mkdir_p 'build/dist'
    FileUtils.rm_f(Dir.glob('build/dist/*dotnet*'))

    FileUtils.copy('bazel-bin/dotnet/release.zip', "build/dist/selenium-dotnet-#{dotnet_version}.zip")
    FileUtils.chmod(0o666, "build/dist/selenium-dotnet-#{dotnet_version}.zip")
    FileUtils.copy('bazel-bin/dotnet/strongnamed.zip', "build/dist/selenium-dotnet-strongnamed-#{dotnet_version}.zip")
    FileUtils.chmod(0o666, "build/dist/selenium-dotnet-strongnamed-#{dotnet_version}.zip")
  end

  desc 'Build, package, and push nupkg files to NuGet'
  task :release do |_task, arguments|
    nightly = arguments.to_a.include?('nightly')
    SeleniumRake.check_credentials(nightly ? %i[dotnet_nightly] : %i[dotnet])

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

  desc 'Generate .NET documentation'
  task :docs do |_task, arguments|
    if dotnet_version.include?('nightly') && !arguments.to_a.include?('force')
      abort('Aborting documentation update: nightly versions should not update docs.')
    end

    puts 'Generating .NET documentation'
    FileUtils.rm_rf('build/docs/api/dotnet/')
    Bazel.execute('run', [], '//dotnet:docs')

    SeleniumRake.update_gh_pages unless arguments.to_a.include?('skip_update')
  end

  desc 'Update .NET changelog'
  task :changelog do
    header = "v#{dotnet_version}\n======"
    SeleniumRake.update_changelog(dotnet_version, 'dotnet', 'dotnet/src/', 'dotnet/CHANGELOG', header)
  end

  desc 'Update .NET version'
  task :version, [:version] do |_task, arguments|
    old_version = dotnet_version
    nightly = "-nightly#{Time.now.strftime('%Y%m%d%H%M')}"
    new_version = SeleniumRake.updated_version(old_version, arguments[:version], nightly)
    puts "Updating .NET from #{old_version} to #{new_version}"

    file = 'dotnet/selenium-dotnet-version.bzl'
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
    SeleniumRake.git.add(file)
  end
end
