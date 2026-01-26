# frozen_string_literal: true

desc 'Build Grid Server'
task :build do |_task, arguments|
  Bazel.execute('build', arguments.to_a, '//java/src/org/openqa/selenium/grid:executable-grid')
end

desc 'Package Grid server into releasable artifacts'
task :package do |_task, arguments|
  args = arguments.to_a.empty? ? ['--config=release'] : arguments.to_a
  Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:server-zip')
  Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:executable-grid')

  mkdir_p 'build/dist'
  Dir.glob('build/dist/*server*').each { |file| FileUtils.rm_f(file) }

  FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/server-zip.zip',
                 "build/dist/selenium-server-#{java_version}.zip")
  FileUtils.chmod(0o644, "build/dist/selenium-server-#{java_version}.zip")
  FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/selenium',
                 "build/dist/selenium-server-#{java_version}.jar")
  FileUtils.chmod(0o755, "build/dist/selenium-server-#{java_version}.jar")
end

desc 'Package Grid for nightly release'
task :release do |_task, _arguments|
  # Grid doesn't publish to a registry, just packages artifacts for GitHub release
  Rake::Task['grid:package'].invoke('--config=release')
end
