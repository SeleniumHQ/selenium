# frozen_string_literal: true

def rust_version
  File.foreach('rust/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('",', '') if line.include?('version =')
  end
end

desc 'Build Selenium Manager'
task :build do |_task, arguments|
  args = arguments.to_a
  Bazel.execute('build', args, '//rust:selenium-manager')
end

desc 'Update the rust lock files'
task :update do
  puts 'pinning cargo versions'
  ENV['CARGO_BAZEL_REPIN'] = 'true'
  Bazel.execute('fetch', [], '@crates//:all')
end

desc 'Pin Rust dependencies'
task pin: :update

desc 'Format Rust code with rustfmt'
task :format do
  puts '  Running rustfmt...'
  Bazel.execute('run', [], '@rules_rust//:rustfmt')
end

desc 'Run Rust linter (no-op, clippy not configured)'
task :lint do
  puts '  Rust linting not configured'
end

desc 'Update Rust changelog'
task :changelogs do
  header = "#{rust_version}\n======"
  version = rust_version.split('.').tap(&:shift).join('.')
  SeleniumRake.update_changelog(version, 'rust', 'rust/src', 'rust/CHANGELOG.md', header)
end

# Rust versioning is currently difficult compared to the others because we are using the 0.4.x pattern
# until Selenium Manager comes out of beta
desc 'Update Rust version'
task :version, [:version] do |_task, arguments|
  old_version = rust_version.dup
  equivalent_version = if old_version.include?('nightly')
                         "#{old_version.split(/\.|-/)[0...-1].tap(&:shift).join('.')}.0-nightly"
                       else
                         old_version.split('.').tap(&:shift).append('0').join('.')
                       end
  updated = SeleniumRake.updated_version(equivalent_version, arguments[:version], '-nightly')
  new_version = updated.split(/\.|-/).tap { |v| v.delete_at(2) }.unshift('0').join('.').gsub('.nightly', '-nightly')
  puts "Updating Rust from #{old_version} to #{new_version}"

  ['rust/Cargo.toml', 'rust/BUILD.bazel'].each do |file|
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
  end
end
