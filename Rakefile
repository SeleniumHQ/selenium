# frozen_string_literal: true

require 'English'
$LOAD_PATH.unshift File.expand_path('.')

require 'rake'
require 'net/telnet'
require 'stringio'
require 'fileutils'
require 'open-uri'
require 'git'
require 'find'

Rake.application.instance_variable_set(:@name, 'go')
orig_verbose = verbose
verbose(false)

# The CrazyFun build grammar. There's no magic here, just ruby
require 'rake_tasks/crazy_fun/main'
require 'rake_tasks/selenium_rake/detonating_handler'
require 'rake_tasks/selenium_rake/crazy_fun'

# The CrazyFun builders - Most of these are either partially or fully obsolete
# Note the order here is important - The top 2 are used in inheritance chains
require 'rake_tasks/crazy_fun/mappings/file_copy_hack'
require 'rake_tasks/crazy_fun/mappings/tasks'
require 'rake_tasks/crazy_fun/mappings/rake_mappings'

# Location of all new (non-CrazyFun) methods
require 'rake_tasks/selenium_rake/browsers'
require 'rake_tasks/selenium_rake/checks'
require 'rake_tasks/selenium_rake/cpp_formatter'
require 'rake_tasks/selenium_rake/ie_generator'
require 'rake_tasks/selenium_rake/java_formatter'
require 'rake_tasks/selenium_rake/type_definitions_generator'

# Our modifications to the Rake / Bazel libraries
require 'rake/task'
require 'rake_tasks/rake/task'
require 'rake_tasks/rake/dsl'
require 'rake_tasks/bazel/task'

# These are the final items mixed into the global NS
# These need moving into correct namespaces, and not be globally included
require 'rake_tasks/bazel'
require 'rake_tasks/python'

$DEBUG = orig_verbose != Rake::FileUtilsExt::DEFAULT
$DEBUG = true if ENV['debug'] == 'true'

verbose($DEBUG)
@git = Git.open(__dir__)

def java_version
  File.foreach('java/version.bzl') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end

# The build system used by webdriver is layered on top of rake, and we call it
# "crazy fun" for no readily apparent reason.

# First off, create a new CrazyFun object.
crazy_fun = SeleniumRake::CrazyFun.new

# Secondly, we add the handlers, which are responsible for turning a build
# rule into a (series of) rake tasks. For example if we're looking at a file
# in subdirectory "subdir" contains the line:
#
# java_library(:name => "example", :srcs => ["foo.java"])
#
# we would generate a rake target of "//subdir:example" which would generate
# a Java JAR at "build/subdir/example.jar".
#
# If crazy fun doesn't know how to handle a particular output type ("java_library"
# in the example above) then it will throw an exception, stopping the build
CrazyFun::Mappings::RakeMappings.new.add_all(crazy_fun)

# Finally, find every file named "build.desc" in the project, and generate
# rake tasks from them. These tasks are normal rake tasks, and can be invoked
# from rake.
# FIXME: the rules for the targets were removed and build files won't load
# crazy_fun.create_tasks(Dir['**/build.desc'])

# If it looks like a bazel target, build it with bazel
rule(%r{//.*}) do |task|
  task.out = Bazel.execute('build', %w[], task.name)
end

# Spoof tasks to get CI working with bazel
task '//java/test/org/openqa/selenium/environment/webserver:webserver:uber' => [
  '//java/test/org/openqa/selenium/environment:webserver'
]

# Java targets required for release. These should all be java_export targets.
# Generated from: bazel query 'kind(maven_publish, set(//java/... //third_party/...))' | sort
JAVA_RELEASE_TARGETS = %w[
  //java/src/org/openqa/selenium/chrome:chrome.publish
  //java/src/org/openqa/selenium/chromium:chromium.publish
  //java/src/org/openqa/selenium/devtools/v128:v128.publish
  //java/src/org/openqa/selenium/devtools/v129:v129.publish
  //java/src/org/openqa/selenium/devtools/v127:v127.publish
  //java/src/org/openqa/selenium/devtools/v85:v85.publish
  //java/src/org/openqa/selenium/edge:edge.publish
  //java/src/org/openqa/selenium/firefox:firefox.publish
  //java/src/org/openqa/selenium/grid/sessionmap/jdbc:jdbc.publish
  //java/src/org/openqa/selenium/grid/sessionmap/redis:redis.publish
  //java/src/org/openqa/selenium/grid:bom-dependencies.publish
  //java/src/org/openqa/selenium/grid:bom.publish
  //java/src/org/openqa/selenium/grid:grid.publish
  //java/src/org/openqa/selenium/ie:ie.publish
  //java/src/org/openqa/selenium/json:json.publish
  //java/src/org/openqa/selenium/manager:manager.publish
  //java/src/org/openqa/selenium/os:os.publish
  //java/src/org/openqa/selenium/remote/http:http.publish
  //java/src/org/openqa/selenium/remote:remote.publish
  //java/src/org/openqa/selenium/safari:safari.publish
  //java/src/org/openqa/selenium/support:support.publish
  //java/src/org/openqa/selenium:client-combined.publish
  //java/src/org/openqa/selenium:core.publish
].freeze

# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task default: [:grid]

task all: [
  :'selenium-java',
  '//java/test/org/openqa/selenium/environment:webserver'
]

task tests: [
  '//java/test/org/openqa/selenium/htmlunit:htmlunit',
  '//java/test/org/openqa/selenium/firefox:test-synthesized',
  '//java/test/org/openqa/selenium/ie:ie',
  '//java/test/org/openqa/selenium/chrome:chrome',
  '//java/test/org/openqa/selenium/edge:edge',
  '//java/test/org/openqa/selenium/support:small-tests',
  '//java/test/org/openqa/selenium/support:large-tests',
  '//java/test/org/openqa/selenium/remote:small-tests',
  '//java/test/org/openqa/selenium/remote/server/log:test',
  '//java/test/org/openqa/selenium/remote/server:small-tests'
]
task chrome: ['//java/src/org/openqa/selenium/chrome']
task grid: [:'selenium-server-standalone']
task ie: ['//java/src/org/openqa/selenium/ie']
task firefox: ['//java/src/org/openqa/selenium/firefox']
task remote: %i[remote_server remote_client]
task remote_client: ['//java/src/org/openqa/selenium/remote']
task remote_server: ['//java/src/org/openqa/selenium/remote/server']
task safari: ['//java/src/org/openqa/selenium/safari']
task selenium: ['//java/src/org/openqa/selenium:core']
task support: ['//java/src/org/openqa/selenium/support']

desc 'Build the standalone server'
task 'selenium-server-standalone' => '//java/src/org/openqa/selenium/grid:executable-grid'

task test_javascript: [
  '//javascript/atoms:test-chrome:run',
  '//javascript/webdriver:test-chrome:run',
  '//javascript/selenium-atoms:test-chrome:run',
  '//javascript/selenium-core:test-chrome:run'
]
task test_chrome: ['//java/test/org/openqa/selenium/chrome:chrome:run']
task test_edge: ['//java/test/org/openqa/selenium/edge:edge:run']
task test_chrome_atoms: [
  '//javascript/atoms:test-chrome:run',
  '//javascript/chrome-driver:test-chrome:run',
  '//javascript/webdriver:test-chrome:run'
]
task test_htmlunit: [
  '//java/test/org/openqa/selenium/htmlunit:htmlunit:run'
]
task test_grid: [
  '//java/test/org/openqa/grid/common:common:run',
  '//java/test/org/openqa/grid:grid:run',
  '//java/test/org/openqa/grid/e2e:e2e:run',
  '//java/test/org/openqa/selenium/remote:remote-driver-grid-tests:run'
]
task test_ie: [
  '//cpp/iedriverserver:win32',
  '//cpp/iedriverserver:x64',
  '//java/test/org/openqa/selenium/ie:ie:run'
]
task test_jobbie: [:test_ie]
task test_firefox: ['//java/test/org/openqa/selenium/firefox:marionette:run']
task test_remote_server: [
  '//java/test/org/openqa/selenium/remote/server:small-tests:run',
  '//java/test/org/openqa/selenium/remote/server/log:test:run'
]
task test_remote: [
  '//java/test/org/openqa/selenium/json:small-tests:run',
  '//java/test/org/openqa/selenium/remote:common-tests:run',
  '//java/test/org/openqa/selenium/remote:client-tests:run',
  '//java/test/org/openqa/selenium/remote:remote-driver-tests:run',
  :test_remote_server
]
task test_safari: ['//java/test/org/openqa/selenium/safari:safari:run']
task test_support: [
  '//java/test/org/openqa/selenium/support:small-tests:run',
  '//java/test/org/openqa/selenium/support:large-tests:run'
]

task :test_java_webdriver do
  if SeleniumRake::Checks.windows?
    Rake::Task['test_ie'].invoke
  elsif SeleniumRake::Checks.chrome?
    Rake::Task['test_chrome'].invoke
  elsif SeleniumRake::Checks.edge?
    Rake::Task['test_edge'].invoke
  else
    Rake::Task['test_htmlunit'].invoke
    Rake::Task['test_firefox'].invoke
    Rake::Task['test_remote_server'].invoke
  end
end

task test_java: [
  '//java/test/org/openqa/selenium/atoms:test:run',
  :test_java_small_tests,
  :test_support,
  :test_java_webdriver,
  :test_selenium,
  'test_grid'
]

task test_java_small_tests: [
  '//java/test/org/openqa/selenium:small-tests:run',
  '//java/test/org/openqa/selenium/json:small-tests:run',
  '//java/test/org/openqa/selenium/support:small-tests:run',
  '//java/test/org/openqa/selenium/remote:common-tests:run',
  '//java/test/org/openqa/selenium/remote:client-tests:run',
  '//java/test/org/openqa/grid/selenium/node:node:run',
  '//java/test/org/openqa/grid/selenium/proxy:proxy:run',
  '//java/test/org/openqa/selenium/remote/server:small-tests:run',
  '//java/test/org/openqa/selenium/remote/server/log:test:run'
]

task :test do
  if SeleniumRake::Checks.python?
    Rake::Task['test_py'].invoke
  else
    Rake::Task['test_javascript'].invoke
    Rake::Task['test_java'].invoke
  end
end

task test_py: [:py_prep_for_install_release, 'py:marionette_test']
task build: %i[all firefox remote selenium tests]

desc 'Clean build artifacts.'
task :clean do
  rm_rf 'build/'
  rm_rf 'java/build/'
  rm_rf 'dist/'
end

# Create a new IEGenerator instance
ie_generator = SeleniumRake::IEGenerator.new

# Generate a C++ Header file for mapping between magic numbers and #defines
# in the C++ code.
ie_generator.generate_type_mapping(
  name: 'ie_result_type_cpp',
  src: 'cpp/iedriver/result_types.txt',
  type: 'cpp',
  out: 'cpp/iedriver/IEReturnTypes.h'
)

desc 'Generate Javadocs'
task javadocs: %i[//java/src/org/openqa/selenium/grid:all-javadocs] do
  FileUtils.rm_rf('build/docs/api/java')
  FileUtils.mkdir_p('build/docs/api/java')
  out = 'bazel-bin/java/src/org/openqa/selenium/grid/all-javadocs.jar'

  cmd = %(cd build/docs/api/java && jar xf "../../../../#{out}" 2>&1)
  cmd = cmd.tr('/', '\\').tr(':', ';') if SeleniumRake::Checks.windows?
  raise 'could not unpack javadocs' unless system(cmd)

  File.open('build/docs/api/java/stylesheet.css', 'a') do |file|
    file.write(<<~STYLE
      /* Custom selenium-specific styling */
      .blink {
        animation: 2s cubic-bezier(0.5, 0, 0.85, 0.85) infinite blink;
      }

      @keyframes blink {
        50% {
          opacity: 0;
        }
      }

    STYLE
              )
  end
end

file 'cpp/iedriver/sizzle.h' => ['//third_party/js/sizzle:sizzle:header'] do
  cp 'build/third_party/js/sizzle/sizzle.h', 'cpp/iedriver/sizzle.h'
end

task sizzle_header: ['cpp/iedriver/sizzle.h']

task ios_driver: [
  '//javascript/atoms/fragments:get_visible_text:ios',
  '//javascript/atoms/fragments:click:ios',
  '//javascript/atoms/fragments:back:ios',
  '//javascript/atoms/fragments:forward:ios',
  '//javascript/atoms/fragments:submit:ios',
  '//javascript/atoms/fragments:xpath:ios',
  '//javascript/atoms/fragments:xpaths:ios',
  '//javascript/atoms/fragments:type:ios',
  '//javascript/atoms/fragments:get_attribute:ios',
  '//javascript/atoms/fragments:clear:ios',
  '//javascript/atoms/fragments:is_selected:ios',
  '//javascript/atoms/fragments:is_enabled:ios',
  '//javascript/atoms/fragments:is_shown:ios',
  '//javascript/atoms/fragments:stringify:ios',
  '//javascript/atoms/fragments:link_text:ios',
  '//javascript/atoms/fragments:link_texts:ios',
  '//javascript/atoms/fragments:partial_link_text:ios',
  '//javascript/atoms/fragments:partial_link_texts:ios',
  '//javascript/atoms/fragments:get_interactable_size:ios',
  '//javascript/atoms/fragments:scroll_into_view:ios',
  '//javascript/atoms/fragments:get_effective_style:ios',
  '//javascript/atoms/fragments:get_element_size:ios',
  '//javascript/webdriver/atoms/fragments:get_location_in_view:ios'
]

# This task does not allow running RBE, to run stamped with RBE use
# ./go java:package['--config=release']
desc 'Create stamped zipped assets for Java for uploading to GitHub'
task :'java-release-zip' do
  Rake::Task['java:package'].invoke('--config=remote_release')
end

task 'release-java': %i[java-release-zip publish-maven]

def read_m2_user_pass
  puts 'Maven environment variables not set, inspecting /.m2/settings.xml.'
  settings = File.read("#{Dir.home}/.m2/settings.xml")
  found_section = false
  settings.each_line do |line|
    if !found_section
      found_section = line.include? '<id>sonatype-nexus-staging</id>'
    elsif line.include?('<username>')
      ENV['MAVEN_USER'] = line[%r{<username>(.*?)</username>}, 1]
    elsif line.include?('<password>')
      ENV['MAVEN_PASSWORD'] = line[%r{<password>(.*?)</password>}, 1]
    end
    break if ENV['MAVEN_PASSWORD'] && ENV['MAVEN_USER']
  end
end

desc 'Publish all Java jars to Maven as stable release'
task 'publish-maven' do
  Rake::Task['java:release'].invoke
end

desc 'Publish all Java jars to Maven as nightly release'
task 'publish-maven-snapshot' do
  Rake::Task['java:release'].invoke('nightly')
end

desc 'Install jars to local m2 directory'
task :'maven-install' do
  JAVA_RELEASE_TARGETS.each do |p|
    Bazel.execute('run',
                  ['--stamp',
                   '--define',
                   "maven_repo=file://#{Dir.home}/.m2/repository",
                   '--define',
                   'gpg_sign=false'],
                  p)
  end
end

desc 'Build the selenium client jars'
task 'selenium-java' => '//java/src/org/openqa/selenium:client-combined'

desc 'Update AUTHORS file'
task :authors do
  sh "(git log --use-mailmap --format='%aN <%aE>' ; cat .OLD_AUTHORS) | sort -uf > AUTHORS"
end

namespace :side do
  task atoms: [
    '//javascript/atoms/fragments:find-element'
  ] do
    # TODO: move directly to IDE's directory once the repositories are merged
    mkdir_p 'build/javascript/atoms'

    atom = 'bazel-bin/javascript/atoms/fragments/find-element.js'
    name = File.basename(atom)

    puts "Generating #{atom} as #{name}"
    File.open(File.join(baseDir, name), 'w') do |f|
      f << "// GENERATED CODE - DO NOT EDIT\n"
      f << 'module.exports = '
      f << File.read(atom).strip
      f << ";\n"
    end
  end
end

def node_version
  File.foreach('javascript/node/selenium-webdriver/package.json') do |line|
    return line.split(':').last.strip.tr('",', '') if line.include?('version')
  end
end
namespace :node do
  atom_list = %w[
    //javascript/atoms/fragments:find-elements
    //javascript/atoms/fragments:is-displayed
    //javascript/webdriver/atoms:get-attribute
  ]

  task atoms: atom_list do
    base_dir = 'javascript/node/selenium-webdriver/lib/atoms'
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
    Bazel.execute('build', args, '//javascript/node/selenium-webdriver')
  end

  task :'dry-run' do
    Bazel.execute('run', ['--stamp'],
                  '//javascript/node/selenium-webdriver:selenium-webdriver.publish  -- --dry-run=true')
  end

  desc 'Release Node npm package'
  task :release do |_task, arguments|
    args = arguments.to_a.compact
    nightly = args.delete('nightly')
    Rake::Task['node:version'].invoke('nightly') if nightly

    Bazel.execute('run', ['--config=release'], '//javascript/node/selenium-webdriver:selenium-webdriver.publish')
  end

  desc 'Release Node npm package'
  task deploy: :release

  desc 'Generate Node documentation'
  task :docs, [:skip_update] do |_task, arguments|
    FileUtils.rm_rf('build/docs/api/javascript/')
    begin
      sh 'npm run generate-docs --prefix javascript/node/selenium-webdriver || true', verbose: true
    rescue StandardError
      puts 'Ensure that npm is installed on your system'
      raise
    end

    update_gh_pages unless arguments[:skip_update]
  end

  desc 'Update JavaScript changelog'
  task :changelog do
    header = "## #{node_version}"
    update_changelog(node_version, 'javascript', 'javascript/node/selenium-webdriver/',
                     'javascript/node/selenium-webdriver/CHANGES.md', header)
  end

  desc 'Update Node version'
  task :version, [:version] do |_task, arguments|
    old_version = node_version
    nightly = "-nightly#{Time.now.strftime('%Y%m%d%H%M')}"
    new_version = updated_version(old_version, arguments[:version], nightly)

    ['javascript/node/selenium-webdriver/package.json',
     'package-lock.json',
     'javascript/node/selenium-webdriver/BUILD.bazel'].each do |file|
      text = File.read(file).gsub(old_version, new_version)
      File.open(file, 'w') { |f| f.puts text }
    end

    Rake::Task['node:changelog'].invoke unless new_version.include?(nightly)
  end
end

def python_version
  File.foreach('py/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end
namespace :py do
  desc 'Build Python wheel and sdist with optional arguments'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('build', args, '//py:selenium-wheel')
    Bazel.execute('build', args, '//py:selenium-sdist')
  end

  desc 'Release Python wheel and sdist to pypi'
  task :release do |_task, arguments|
    args = arguments.to_a.compact
    nightly = args.delete('nightly')
    Rake::Task['py:version'].invoke('nightly') if nightly

    command = nightly ? '//py:selenium-release-nightly' : '//py:selenium-release'
    Bazel.execute('run', ['--config=release'], command)
  end

  desc 'generate and copy files required for local development'
  task :local_dev do
    Bazel.execute('build', [], '//py:selenium')
    Rake::Task['grid'].invoke

    FileUtils.rm_rf('py/selenium/webdriver/common/devtools/')
    FileUtils.cp_r('bazel-bin/py/selenium/webdriver/.', 'py/selenium/webdriver', remove_destination: true)
  end

  desc 'Update generated Python files for local development'
  task :clean do
    Bazel.execute('build', [], '//py:selenium')
    bazel_bin_path = 'bazel-bin/py/selenium/webdriver'
    lib_path = 'py/selenium/webdriver'

    dirs = %w[devtools linux mac windows]
    dirs.each { |dir| FileUtils.rm_rf("#{lib_path}/common/#{dir}") }

    Find.find(bazel_bin_path) do |path|
      if File.directory?(path) && dirs.any? { |dir| path.include?("common/#{dir}") }
        Find.prune
        next
      end
      next if File.directory?(path)

      target_file = File.join(lib_path, path.sub(%r{^#{bazel_bin_path}/}, ''))
      if File.exist?(target_file)
        puts "Removing target file: #{target_file}"
        FileUtils.rm(target_file)
      end
    end
  end

  desc 'Generate Python documentation'
  task :docs, [:skip_update] do |_task, arguments|
    FileUtils.rm_rf('build/docs/api/py/')
    FileUtils.rm_rf('build/docs/doctrees/')
    begin
      sh 'tox -c py/tox.ini -e docs', verbose: true
    rescue StandardError
      puts 'Ensure that tox is installed on your system'
      raise
    end

    update_gh_pages unless arguments[:skip_update]
  end

  desc 'Install Python wheel locally'
  task :install do
    Bazel.execute('build', [], '//py:selenium-wheel')
    begin
      sh 'pip install bazel-bin/py/selenium-*.whl'
    rescue StandardError
      puts 'Ensure that Python and pip are installed on your system'
      raise
    end
  end

  desc 'Update Python changelog'
  task :changelog do
    header = "Selenium #{python_version}"
    update_changelog(python_version, 'py', 'py/selenium/webdriver', 'py/CHANGES', header)
  end

  desc 'Update Python version'
  task :version, [:version] do |_task, arguments|
    old_version = python_version
    nightly = ".dev#{Time.now.strftime('%Y%m%d%H%M')}"
    new_version = updated_version(old_version, arguments[:version], nightly)

    ['py/setup.py',
     'py/BUILD.bazel',
     'py/selenium/__init__.py',
     'py/selenium/webdriver/__init__.py',
     'py/docs/source/conf.py'].each do |file|
      text = File.read(file).gsub(old_version, new_version)
      File.open(file, 'w') { |f| f.puts text }
    end

    old_short_version = old_version.split('.')[0..1].join('.')
    new_short_version = new_version.split('.')[0..1].join('.')

    text = File.read('py/docs/source/conf.py').gsub(old_short_version, new_short_version)
    File.open('py/docs/source/conf.py', 'w') { |f| f.puts text }

    Rake::Task['py:changelog'].invoke unless new_version.include?(nightly)
  end

  desc 'Update Python Syntax'
  task :lint do
    sh 'tox -c py/tox.ini -e linting'
  end

  namespace :test do
    desc 'Python unit tests'
    task :unit do
      Rake::Task['py:clean'].invoke
      Bazel.execute('test', ['--test_size_filters=small'], '//py/...')
    end

    %i[chrome edge firefox safari].each do |browser|
      desc "Python #{browser} tests"
      task browser do
        Rake::Task['py:clean'].invoke
        Bazel.execute('test', [], "//py:common-#{browser}")
        Bazel.execute('test', [], "//py:test-#{browser}")
      end
    end

    desc 'Python Remote tests with Firefox'
    task :remote do
      Rake::Task['py:clean'].invoke
      Bazel.execute('test', [], '//py:test-remote')
    end
  end

  namespace :test do
    desc 'Python unit tests'
    task :unit do
      Rake::Task['py:clean'].invoke
      Bazel.execute('test', ['--test_size_filters=small'], '//py/...')
    end

    %i[chrome edge firefox safari].each do |browser|
      desc "Python #{browser} tests"
      task browser do
        Rake::Task['py:clean'].invoke
        Bazel.execute('test', %w[--test_output all], "//py:common-#{browser}")
        Bazel.execute('test', %w[--test_output all], "//py:test-#{browser}")
      end
    end
  end
end

def ruby_version
  File.foreach('rb/lib/selenium/webdriver/version.rb') do |line|
    return line.split('=').last.strip.tr("'", '') if line.include?('VERSION')
  end
end
namespace :rb do
  desc 'Generate Ruby gems'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    webdriver = args.delete('webdriver')
    devtools = args.delete('devtools')

    Bazel.execute('build', args, '//rb:selenium-webdriver') if webdriver || !devtools
    Bazel.execute('build', args, '//rb:selenium-devtools') if devtools || !webdriver
  end

  desc 'Update generated Ruby files for local development'
  task :local_dev do
    Bazel.execute('build', [], '@bundle//:bundle')
    Rake::Task['rb:build'].invoke
    Rake::Task['grid'].invoke
  end

  desc 'Push Ruby gems to rubygems'
  task :release do |_task, arguments|
    args = arguments.to_a.compact
    nightly = args.delete('nightly')

    if nightly
      Bazel.execute('run', [], '//rb:selenium-webdriver-bump-nightly-version')
      Bazel.execute('run', ['--config=release'], '//rb:selenium-webdriver-release-nightly')
    else
      Bazel.execute('run', ['--config=release'], '//rb:selenium-webdriver-release')
      Bazel.execute('run', ['--config=release'], '//rb:selenium-devtools-release')
    end
  end

  desc 'Generate Ruby documentation'
  task :docs, [:skip_update] do |_task, arguments|
    FileUtils.rm_rf('build/docs/api/rb/')
    Bazel.execute('run', [], '//rb:docs')
    FileUtils.mkdir_p('build/docs/api')
    FileUtils.cp_r('bazel-bin/rb/docs.sh.runfiles/_main/docs/api/rb/.', 'build/docs/api/rb')

    update_gh_pages unless arguments[:skip_update]
  end

  desc 'Update Ruby changelog'
  task :changelog do
    header = "#{ruby_version} (#{Time.now.strftime('%Y-%m-%d')})\n========================="
    update_changelog(ruby_version, 'rb', 'rb/lib/', 'rb/CHANGES', header)
  end

  desc 'Update Ruby version'
  task :version, [:version] do |_task, arguments|
    old_version = ruby_version
    new_version = updated_version(old_version, arguments[:version], '.nightly')

    file = 'rb/lib/selenium/webdriver/version.rb'
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }

    Rake::Task['rb:changelog'].invoke unless new_version.include?('.nightly')
    sh 'cd rb && bundle --version && bundle update'
  end

  desc 'Update Ruby Syntax'
  task :lint do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('run', args, '//rb:lint')
  end
end

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

  desc 'Upload nupkg files to Nuget'
  task :release do |_task, arguments|
    args = arguments.to_a.compact
    nightly = args.delete('nightly')
    Rake::Task['dotnet:version'].invoke('nightly') if nightly
    Rake::Task['dotnet:package'].invoke('--config=release')

    api_key = ENV.fetch('NUGET_API_KEY', nil)
    push_destination = 'https://api.nuget.org/v3/index.json'
    if nightly
      # Nightly builds are pushed to GitHub NuGet repository
      # This commands will run in GitHub Actions
      api_key = ENV.fetch('GITHUB_TOKEN', nil)
      github_push_url = 'https://nuget.pkg.github.com/seleniumhq/index.json'
      push_destination = 'github'
      flags = ['--username', 'seleniumhq', '--password', api_key, '--store-password-in-clear-text', '--name',
               push_destination, github_push_url]
      sh "dotnet nuget add source #{flags.join(' ')}"
    end

    ["./bazel-bin/dotnet/src/webdriver/Selenium.WebDriver.#{dotnet_version}.nupkg",
     "./bazel-bin/dotnet/src/support/Selenium.Support.#{dotnet_version}.nupkg"].each do |asset|
      sh "dotnet nuget push #{asset} --api-key #{api_key} --source #{push_destination}"
    end
  end

  desc 'Generate .NET documentation'
  task :docs, [:skip_update] do |_task, arguments|
    FileUtils.rm_rf('build/docs/api/dotnet/')
    begin
      # Pinning to 2.75.3 to avoid breaking changes in newer versions
      # See https://github.com/dotnet/docfx/issues/9855
      sh 'dotnet tool uninstall --global docfx || true'
      sh 'dotnet tool install --global --version 2.75.3 docfx'
      # sh 'dotnet tool update -g docfx'
    rescue StandardError
      puts 'Please ensure that .NET SDK is installed.'
      raise
    end

    begin
      sh 'docfx dotnet/docs/docfx.json'
    rescue StandardError
      case $CHILD_STATUS.exitstatus
      when 127
        raise 'Ensure the dotnet/tools directory is added to your PATH environment variable (e.g., `~/.dotnet/tools`)'
      when 255
        puts '.NET documentation build failed, likely because of DevTools namespacing. This is ok; continuing'
      else
        raise
      end
    end

    update_gh_pages unless arguments[:skip_update]
  end

  desc 'Update .NET changelog'
  task :changelog do
    header = "v#{dotnet_version}\n======"
    update_changelog(dotnet_version, 'dotnet', 'dotnet/src/', 'dotnet/CHANGELOG', header)
  end

  desc 'Update .NET version'
  task :version, [:version] do |_task, arguments|
    old_version = dotnet_version
    nightly = "-nightly#{Time.now.strftime('%Y%m%d%H%M')}"
    new_version = updated_version(old_version, arguments[:version], nightly)

    file = 'dotnet/selenium-dotnet-version.bzl'
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }

    Rake::Task['dotnet:changelog'].invoke unless new_version.include?(nightly)
  end
end

namespace :java do
  desc 'Build Java Client Jars'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    JAVA_RELEASE_TARGETS.each { |target| Bazel.execute('build', args, target) }
  end

  desc 'Build Grid Server'
  task :grid do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:executable-grid')
  end

  desc 'Package Java bindings and grid into releasable packages and stage for release'
  task :package do |_task, arguments|
    args = arguments.to_a.compact.empty? ? ['--config=release'] : arguments.to_a.compact
    Bazel.execute('build', args, '//java/src/org/openqa/selenium:client-zip')
    Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:server-zip')
    Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:executable-grid')

    mkdir_p 'build/dist'
    Dir.glob('build/dist/*{java,server}*').each { |file| FileUtils.rm_f(file) }

    FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/server-zip.zip',
                   "build/dist/selenium-server-#{java_version}.zip")
    FileUtils.chmod(0o666, "build/dist/selenium-server-#{java_version}.zip")
    FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/client-zip.zip',
                   "build/dist/selenium-java-#{java_version}.zip")
    FileUtils.chmod(0o666, "build/dist/selenium-java-#{java_version}.zip")
    FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/selenium',
                   "build/dist/selenium-server-#{java_version}.jar")
    FileUtils.chmod(0o777, "build/dist/selenium-server-#{java_version}.jar")
  end

  desc 'Deploy all jars to Maven'
  task :release do |_task, arguments|
    args = arguments.to_a.compact
    nightly = args.delete('nightly')

    ENV['MAVEN_USER'] ||= ENV.fetch('SEL_M2_USER', nil)
    ENV['MAVEN_PASSWORD'] ||= ENV.fetch('SEL_M2_PASS', nil)
    read_m2_user_pass unless ENV['MAVEN_PASSWORD'] && ENV['MAVEN_USER']

    repo = nightly ? 'content/repositories/snapshots' : 'service/local/staging/deploy/maven2'
    ENV['MAVEN_REPO'] = "https://oss.sonatype.org/#{repo}"
    ENV['GPG_SIGN'] = (!nightly).to_s

    Rake::Task['java:version'].invoke if nightly
    Rake::Task['java:package'].invoke('--config=release')
    Rake::Task['java:build'].invoke('--config=release')
    # Because we want to `run` things, we can't use the `release` config
    JAVA_RELEASE_TARGETS.each { |target| Bazel.execute('run', ['--config=release'], target) }
  end

  desc 'Install jars to local m2 directory'
  task install: :'maven-install'

  desc 'Generate Java documentation'
  task :docs, [:skip_update] do |_task, arguments|
    Rake::Task['javadocs'].invoke

    update_gh_pages unless arguments[:skip_update]
  end

  desc 'Update Maven dependencies'
  task :update do
    # Make sure things are in a good state to start with
    args = ['--action_env=RULES_JVM_EXTERNAL_REPIN=1']
    Bazel.execute('run', args, '@unpinned_maven//:pin')

    file_path = 'MODULE.bazel'
    content = File.read(file_path)
    # For some reason ./go wrapper is not outputting from Open3, so cannot use Bazel class directly
    output = `bazel run @maven//:outdated`

    output.scan(/\S+ \[\S+-alpha\]/).each do |match|
      puts "WARNING — Cannot automatically update alpha version of: #{match}"
    end

    versions = output.scan(/(\S+) \[\S+ -> (\S+)\]/).to_h
    versions.each do |artifact, version|
      if artifact.match?('graphql')
        puts 'WARNING — Cannot automatically update graphql'
        next
      end

      replacement = artifact.include?('googlejavaformat') ? "#{artifact}:jar:#{version}" : "#{artifact}:#{version}"
      content.gsub!(/#{artifact}:(jar:)?\d+\.\d+[^\\"]+/, replacement)
    end
    File.write(file_path, content)

    args = ['--action_env=RULES_JVM_EXTERNAL_REPIN=1']
    Bazel.execute('run', args, '@unpinned_maven//:pin')
  end

  desc 'Update Java changelog'
  task :changelog do
    header = "v#{java_version}\n======"
    update_changelog(java_version, 'java', 'java/src/org/', 'java/CHANGELOG', header)
  end

  desc 'Update Java version'
  task :version, [:version] do |_task, arguments|
    old_version = java_version
    new_version = updated_version(old_version, arguments[:version], '-SNAPSHOT')

    file = 'java/version.bzl'
    text = File.read(file).gsub(old_version, new_version)
    File.open(file, 'w') { |f| f.puts text }
    Rake::Task['java:changelog'].invoke unless new_version.include?('-SNAPSHOT')
  end
end

def rust_version
  File.foreach('rust/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('",', '') if line.include?('version =')
  end
end
namespace :rust do
  desc 'Build Selenium Manager'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    Bazel.execute('build', args, '//rust:selenium-manager')
  end

  desc 'Update the rust lock files'
  task :update do
    sh 'CARGO_BAZEL_REPIN=true bazel sync --only=crates'
  end

  desc 'Update Rust changelog'
  task :changelog do
    header = "#{rust_version}\n======"
    version = rust_version.split('.').tap(&:shift).join('.')
    update_changelog(version, 'rust', 'rust/src', 'rust/CHANGELOG.md', header)
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
    updated = updated_version(equivalent_version, arguments[:version], '-nightly')
    new_version = updated.split(/\.|-/).tap { |v| v.delete_at(2) }.unshift('0').join('.').gsub('.nightly', '-nightly')

    ['rust/Cargo.toml', 'rust/BUILD.bazel'].each do |file|
      text = File.read(file).gsub(old_version, new_version)
      File.open(file, 'w') { |f| f.puts text }
    end

    Rake::Task['rust:changelog'].invoke unless new_version.include?('-nightly')
    Rake::Task['rust:update'].invoke
  end

  # Creating a special task for this because Rust version needs to be managed at a different place than
  # everything else; want to use changelog updates later in process
  namespace :version do
    desc 'Commits updates from Rust version changes'
    task :commit do
      @git.reset
      commit!("update Rust version to #{rust_version}",
              ['rust/BUILD.bazel', 'rust/Cargo.Bazel.lock', 'rust/Cargo.lock', 'rust/Cargo.toml'])
      commit!('Rust Changelog', ['rust/CHANGELOG.md'])
    end
  end
end

namespace :all do
  desc 'Update all API Documentation'
  task :docs do
    Rake::Task['java:docs'].invoke(true)
    Rake::Task['py:docs'].invoke(true)
    Rake::Task['rb:docs'].invoke(true)
    Rake::Task['dotnet:docs'].invoke(true)
    Rake::Task['node:docs'].invoke(true)

    update_gh_pages
  end

  desc 'Build all artifacts for all language bindings'
  task :build do |_task, arguments|
    args = arguments.to_a.compact
    Rake::Task['java:build'].invoke(*args)
    Rake::Task['py:build'].invoke(*args)
    Rake::Task['rb:build'].invoke(*args)
    Rake::Task['dotnet:build'].invoke(*args)
    Rake::Task['node:build'].invoke(*args)
  end

  desc 'Package or build stamped artifacts for distribution in GitHub Release assets'
  task :package do |_task, arguments|
    args = arguments.to_a.compact
    Rake::Task['java:package'].invoke(*args)
    Rake::Task['dotnet:package'].invoke(*args)
  end

  desc 'Release all artifacts for all language bindings'
  task :release do |_task, arguments|
    Rake::Task['clean'].invoke

    args = arguments.to_a.compact.empty? ? ['--stamp'] : arguments.to_a.compact
    Rake::Task['java:release'].invoke(*args)
    Rake::Task['py:release'].invoke(*args)
    Rake::Task['rb:release'].invoke(*args)
    Rake::Task['dotnet:release'].invoke(*args)
    Rake::Task['node:release'].invoke(*args)

    # TODO: Update this so it happens in each language, but does not commit
    Rake::Task['all:version'].invoke('nightly')

    puts 'Committing nightly version updates'
    commit!('update versions to nightly', ['dotnet/selenium-dotnet-version.bzl',
                                           'java/version.bzl',
                                           'javascript/node/selenium-webdriver/BUILD.bazel',
                                           'javascript/node/selenium-webdriver/package.json',
                                           'py/docs/source/conf.py',
                                           'py/selenium/webdriver/__init__.py',
                                           'py/selenium/__init__.py',
                                           'py/BUILD.bazel',
                                           'py/setup.py',
                                           'rb/lib/selenium/webdriver/version.rb',
                                           'rb/Gemfile.lock',
                                           'package-lock.json'])

    print 'Do you want to push the committed changes? (Y/n): '
    response = $stdin.gets.chomp.downcase
    @git.push if %w[y yes].include?(response)
  end

  task :lint do
    ext = /mswin|msys|mingw|cygwin|bccwin|wince|emc/.match?(RbConfig::CONFIG['host_os']) ? 'ps1' : 'sh'
    sh "./scripts/format.#{ext}", verbose: true
    Rake::Task['py:lint'].invoke
  end

  desc 'Update everything in preparation for a release'
  task :prepare, [:version, :channel] do |_task, arguments|
    chrome_channel = arguments[:channel] || 'Stable'
    version = arguments[:version]
    args = Array(chrome_channel) ? ['--', "--chrome_channel=#{chrome_channel.capitalize}"] : []
    Bazel.execute('run', args, '//scripts:pinned_browsers')
    commit!('Update pinned browser versions', ['common/repositories.bzl'])

    Bazel.execute('run', args, '//scripts:update_cdp')
    commit!('Update supported versions for Chrome DevTools',
            ['common/devtools/',
             'dotnet/src/webdriver/DevTools/',
             'dotnet/src/webdriver/WebDriver.csproj',
             'dotnet/test/common/DevTools/',
             'dotnet/test/common/CustomDriverConfigs/',
             'dotnet/selenium-dotnet-version.bzl',
             'java/src/org/openqa/selenium/devtools/',
             'javascript/node/selenium-webdriver/BUILD.bazel',
             'py/BUILD.bazel',
             'rb/lib/selenium/devtools/',
             'rb/Gemfile.lock',
             'Rakefile'])

    Bazel.execute('run', args, '//scripts:selenium_manager')
    commit!('Update selenium manager version', ['common/selenium_manager.bzl'])

    Rake::Task['java:update'].invoke
    commit!('Update Maven Dependencies', ['java/maven_deps.bzl', 'java/maven_install.json'])

    Rake::Task['authors'].invoke
    commit!('Update authors file', ['AUTHORS'])

    # Note that this does not include Rust version changes that are handled in separate rake:version task
    # TODO: These files are all defined in other tasks; remove duplication
    Rake::Task['all:version'].invoke(version)
    commit!("FIX CHANGELOGS BEFORE MERGING!\n\nUpdate versions and change logs to release Selenium #{java_version}",
            ['dotnet/CHANGELOG',
             'dotnet/selenium-dotnet-version.bzl',
             'java/CHANGELOG',
             'java/version.bzl',
             'javascript/node/selenium-webdriver/CHANGES.md',
             'javascript/node/selenium-webdriver/package.json',
             'package-lock.json',
             'py/docs/source/conf.py',
             'py/selenium/__init__.py',
             'py/selenium/webdriver/__init__.py',
             'py/BUILD.bazel',
             'py/CHANGES',
             'py/setup.py',
             'rb/lib/selenium/webdriver/version.rb',
             'rb/CHANGES',
             'rb/Gemfile.lock',
             'rust/CHANGELOG.md'])
  end

  desc 'Update all versions'
  task :version, [:version] do |_task, arguments|
    version = arguments[:version] || 'nightly'

    Rake::Task['java:version'].invoke(version)
    Rake::Task['rb:version'].invoke(version)
    Rake::Task['node:version'].invoke(version)
    Rake::Task['py:version'].invoke(version)
    Rake::Task['dotnet:version'].invoke(version)
  end
end

at_exit do
  system 'sh', '.git-fixfiles' if File.exist?('.git') && !SeleniumRake::Checks.windows?
end

def updated_version(current, desired = nil, nightly = nil)
  if !desired.nil? && desired != 'nightly'
    # If desired is present, return full 3 digit version
    desired.split('.').tap { |v| v << 0 while v.size < 3 }.join('.')
  elsif current.split(/\.|-/).size > 3
    # if current version is already nightly, just need to bump it; this will be noop for some languages
    pattern = /-?\.?(nightly|SNAPSHOT|dev)\d*$/
    current.gsub(pattern, nightly)
  elsif current.split(/\.|-/).size == 3
    # if current version is not nightly, need to bump the version and make nightly
    "#{current.split(/\.|-/).tap { |i| (i[1] = i[1].to_i + 1) && (i[2] = 0) }.join('.')}#{nightly}"
  end
end

def update_gh_pages
  @git.fetch('origin', {ref: 'gh-pages'})
  @git.checkout('gh-pages', force: true)

  %w[java rb py dotnet javascript].each do |language|
    next unless Dir.exist?("build/docs/api/#{language}") && !Dir.empty?("build/docs/api/#{language}")

    FileUtils.rm_rf("docs/api/#{language}")
    FileUtils.mv("build/docs/api/#{language}", "docs/api/#{language}")

    commit!("updating #{language} API docs", ["docs/api/#{language}/"])
  end
end

def restore_git(origin_reference)
  puts 'Stashing docs changes for gh-pages'
  Git::Stash.new(@git, 'docs changes for gh-pages')
  puts "Checking out originating branch/tag — #{origin_reference}"
  @git.checkout(origin_reference)
  false
end

def previous_tag(current_version, language = nil)
  version = current_version.split(/\.|-/)
  if version.size > 3
    puts 'WARNING - Changelogs not updated when set to prerelease'
  elsif version[2].to_i > 1
    # specified as patch release
    patch_version = (version[2].to_i - 1).to_s
    "selenium-#{[[version[0]], version[1], patch_version].join('.')}-#{language}"
  elsif version[2] == '1'
    # specified as patch release; special case
    "selenium-#{[[version[0]], version[1], '0'].join('.')}"
  else
    minor_version = (version[1].to_i - 1)
    tags = @git.tags.map(&:name)
    tag = language ? tags.reverse.find { |t| t.match?(/selenium-4\.#{minor_version}.*-#{language}/) } : nil
    tag || "selenium-#{[[version[0]], minor_version, '0'].join('.')}"
  end
end

def update_changelog(version, language, path, changelog, header)
  tag = previous_tag(version, language)
  log = `git --no-pager log #{tag}...HEAD --pretty=format:"--> %B" --reverse #{path}`
  commits = log.split('>>>').map { |entry|
    lines = entry.split("\n")
    lines.reject! { |line| line.match?(/^(----|Co-authored|Signed-off)/) || line.empty? }
    lines.join("\n")
  }.join("\n>>>")

  File.open(changelog, 'r+') do |file|
    new_content = "#{header}\n#{commits}\n\n#{file.read}"
    file.rewind
    file.write(new_content)
    file.truncate(file.pos)
  end
end

def commit!(message, files = [], all: false)
  files.each do |file|
    puts "adding: #{file}"
    @git.add(file)
  end
  all ? @git.commit_all(message) : @git.commit(message)
rescue Git::FailedError => e
  puts e.message
end
