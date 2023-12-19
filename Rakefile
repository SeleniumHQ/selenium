# -*- mode: ruby -*-

require 'English'
$LOAD_PATH.unshift File.expand_path('.')

require 'rake'
require 'net/telnet'
require 'stringio'
require 'fileutils'
require 'open-uri'

include Rake::DSL

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
require 'rake_tasks/copyright'
require 'rake_tasks/python'

$DEBUG = orig_verbose != Rake::FileUtilsExt::DEFAULT ? true : false
$DEBUG = true if ENV['debug'] == 'true'

verbose($DEBUG)

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
rule /\/\/.*/ do |task|
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
  //java/src/org/openqa/selenium/devtools/v119:v119.publish
  //java/src/org/openqa/selenium/devtools/v120:v120.publish
  //java/src/org/openqa/selenium/devtools/v118:v118.publish
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
]

# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task default: [:grid]

task all: [
  :"selenium-java",
  '//java/test/org/openqa/selenium/environment:webserver'
]
task all_zip: [:'java-release-zip', :'dotnet-release-zip']
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
task support: [
  '//java/src/org/openqa/selenium/support'
]

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

task test_java_webdriver: %i[
  test_htmlunit
  test_firefox
  test_remote_server
]

task test_java_webdriver: [:test_ie] if SeleniumRake::Checks.windows?
task test_java_webdriver: [:test_chrome] if SeleniumRake::Checks.chrome?
task test_java_webdriver: [:test_edge] if SeleniumRake::Checks.edge?

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

task test_py: [:py_prep_for_install_release, 'py:marionette_test']
task test: %i[test_javascript test_java]
task test: [:test_py] if SeleniumRake::Checks.python?
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
  rm_rf 'build/docs/api/java'
  mkdir_p 'build/docs/api/java'

  out = 'bazel-bin/java/src/org/openqa/selenium/grid/all-javadocs.jar'

  cmd = %(cd build/docs/api/java && jar xf "../../../../#{out}" 2>&1)
  cmd = cmd.tr('/', '\\').tr(':', ';') if SeleniumRake::Checks.windows?

  ok = system(cmd)
  ok or raise 'could not unpack javadocs'

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

task :'java-release-zip' do
  Bazel.execute('build', ['--stamp'], '//java/src/org/openqa/selenium:client-zip')
  Bazel.execute('build', ['--stamp'], '//java/src/org/openqa/selenium/grid:server-zip')
  Bazel.execute('build', ['--stamp'], '//java/src/org/openqa/selenium/grid:executable-grid')
  mkdir_p 'build/dist'
  FileUtils.rm_f('build/dist/**/*.{server,java}*', force: true)

    FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/server-zip.zip',
      "build/dist/selenium-server-#{java_version}.zip")
    FileUtils.chmod(666, "build/dist/selenium-server-#{java_version}.zip")
    FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/client-zip.zip',
      "build/dist/selenium-java-#{java_version}.zip")
    FileUtils.chmod(666, "build/dist/selenium-java-#{java_version}.zip")
    FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/selenium',
      "build/dist/selenium-server-#{java_version}.jar")
    FileUtils.chmod(777, "build/dist/selenium-server-#{java_version}.jar")
end

task 'release-java': %i[java-release-zip publish-maven]

def read_m2_user_pass
  # First check env vars, then the settings.xml config inside .m2
  user = nil
  pass = nil
  if ENV['SEL_M2_USER'] && ENV['SEL_M2_PASS']
    puts 'Fetching m2 user and pass from environment variables.'
    user = ENV['SEL_M2_USER']
    pass = ENV['SEL_M2_PASS']
    return [user, pass]
  end
  settings = File.read(ENV['HOME'] + '/.m2/settings.xml')
  found_section = false
  settings.each_line do |line|
    if !found_section
      found_section = line.include? '<id>sonatype-nexus-staging</id>'
    else
      if (user.nil?) && line.include?('<username>')
        user = line.split('<username>')[1].split('</')[0]
      elsif (pass.nil?) && line.include?('<password>')
        pass = line.split('<password>')[1].split('</')[0]
        end
    end
  end

  return [user, pass]
end

task :prepare_release, [:args] do |_task, arguments|
  args = arguments[:args] ? [arguments[:args]] : %w[--config release]

  RELEASE_TARGETS = [
    '//java/src/org/openqa/selenium:client-zip',
    '//java/src/org/openqa/selenium/grid:server-zip',
    '//java/src/org/openqa/selenium/grid:executable-grid',
    '//dotnet/src/webdriver:webdriver-pack',
    '//dotnet/src/webdriver:webdriver-strongnamed-pack',
    '//dotnet/src/support:support-pack',
    '//dotnet/src/support:support-strongnamed-pack',
    '//javascript/node/selenium-webdriver:selenium-webdriver',
    '//py:selenium-wheel',
    '//py:selenium-sdist'
  ]

  RELEASE_TARGETS.each do |target|
    Bazel.execute('build', args, target)
  end
  # Ruby cannot be executed with config remote or release
  Bazel.execute('build', ['--stamp'], '//rb:selenium-webdriver')
end

task 'publish-maven': JAVA_RELEASE_TARGETS do
  creds = read_m2_user_pass
  JAVA_RELEASE_TARGETS.each do |p|
    Bazel::execute('run', ['--stamp', '--define', 'maven_repo=https://oss.sonatype.org/service/local/staging/deploy/maven2', '--define', "maven_user=#{creds[0]}", '--define', "maven_password=#{creds[1]}", '--define', 'gpg_sign=true'], p)
  end
end

task 'publish-maven-snapshot': JAVA_RELEASE_TARGETS do
  creds = read_m2_user_pass
  if java_version.end_with?('-SNAPSHOT')
    JAVA_RELEASE_TARGETS.each do |p|
      Bazel::execute('run', ['--stamp', '--define', 'maven_repo=https://oss.sonatype.org/content/repositories/snapshots', '--define', "maven_user=#{creds[0]}", '--define', "maven_password=#{creds[1]}", '--define', 'gpg_sign=false'], p)
    end
  else
    puts 'No SNAPSHOT version configured. Targets will not be pushed to the snapshot repo in SonaType.'
  end
end

task :'maven-install' do
  JAVA_RELEASE_TARGETS.each do |p|
    Bazel::execute('run', ['--stamp', '--define', "maven_repo=file://#{ENV['HOME']}/.m2/repository", '--define', 'gpg_sign=false'], p)
  end
end

desc 'Build the selenium client jars'
task 'selenium-java' => '//java/src/org/openqa/selenium:client-combined'

task :authors do
  puts 'Generating AUTHORS file'
  sh "(git log --use-mailmap --format='%aN <%aE>' ; cat .OLD_AUTHORS) | sort -uf > AUTHORS"
end

namespace :copyright do
  desc 'Update Copyright notices on all files in repo'
  task :update do
    Copyright.new.update(
      FileList['javascript/**/*.js'].exclude(
        'javascript/atoms/test/jquery.min.js',
        'javascript/jsunit/**/*.js',
        'javascript/node/selenium-webdriver/node_modules/**/*.js',
        'javascript/selenium-core/lib/**/*.js',
        'javascript/selenium-core/scripts/ui-element.js',
        'javascript/selenium-core/scripts/ui-map-sample.js',
        'javascript/selenium-core/scripts/user-extensions.js',
        'javascript/selenium-core/scripts/xmlextras.js',
        'javascript/selenium-core/xpath/**/*.js',
        'javascript/grid-ui/node_modules/**/*.js'
      )
    )
    Copyright.new.update(FileList['javascript/**/*.tsx'])
    Copyright.new(comment_characters: '#').update(FileList['py/**/*.py'].exclude(
            'py/selenium/webdriver/common/bidi/cdp.py',
            'py/generate.py',
            'py/selenium/webdriver/common/devtools/**/*',
            'py/venv/**/*')
            )
    Copyright.new(comment_characters: '#', prefix: ["# frozen_string_literal: true\n", "\n"])
             .update(FileList['rb/**/*.rb'])
    Copyright.new.update(FileList['java/**/*.java'])
    Copyright.new.update(FileList['rust/**/*.rs'])

    sh './scripts/format.sh'
  end
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
      f << IO.read(atom).strip
      f << ";\n"
    end
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
        f << IO.read(atom).strip
        f << ";\n"
      end
    end
  end

  desc 'Build Node npm package'
  task :build, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : []
    Bazel.execute('build', args, '//javascript/node/selenium-webdriver')
  end

  task :'dry-run' do
    Bazel.execute('run', ['--stamp'], '//javascript/node/selenium-webdriver:selenium-webdriver.pack')
  end

  desc 'Release Node npm package'
  task :release do
    Bazel.execute('run', ['--stamp'], '//javascript/node/selenium-webdriver:selenium-webdriver.publish')
  end

  desc 'Release Node npm package'
  task deploy: :release
end

def py_version
  File.foreach('py/BUILD.bazel') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end
namespace :py do
  desc 'Build Python wheel and sdist with optional arguments'
  task :build, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : []
    Bazel.execute('build', args, '//py:selenium-wheel')
    Bazel.execute('build', args, '//py:selenium-sdist')
  end

  desc 'Release Python wheel and sdist to pypi'
  task :release, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : ['--stamp']
    Rake::Task['py:build'].invoke(args)
    sh "python3 -m twine upload `bazel-bin/py/selenium`-#{py_version}-py3-none-any.whl"
    sh "python3 -m twine upload bazel-bin/py/selenium-#{py_version}.tar.gz"
  end

  desc 'Update generated Python files for local development'
  task :update do
    Bazel.execute('build', [], '//py:selenium')

    FileUtils.rm_r('py/selenium/webdriver/common/devtools/', force: true)
    FileUtils.cp_r('bazel-bin/py/selenium/webdriver/.', 'py/selenium/webdriver', remove_destination: true)
  end

  desc 'Generate Python documentation'
  task :docs do
    FileUtils.rm_r('build/docs/api/py/', force: true)
    FileUtils.rm_r('build/docs/doctrees/', force: true)
    begin
      sh 'tox -c py/tox.ini -e docs', verbose: true
    rescue StandardError
      puts 'Ensure that tox is installed on your system'
      raise
    end
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
end

namespace :rb do
  desc 'Generate ruby gems'
  task :build, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : []
    Bazel.execute('build', args, '//rb:selenium-webdriver')
    Bazel.execute('build', args, '//rb:selenium-devtools')
  end

  desc 'Update generated Ruby files for local development'
  task :update do
    Bazel.execute('build', [], '@bundle//:bundle')
    Rake::Task['rb:build'].invoke
    Rake::Task['grid'].invoke
  end

  desc 'Push ruby gems to rubygems'
  task :release, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : ['--stamp']
    Bazel.execute('run', args, '//rb:selenium-webdriver')
    Bazel.execute('run', args, '//rb:selenium-devtools')
  end

  desc 'Generate Ruby documentation'
  task :docs do
    FileUtils.rm_r('build/docs/api/rb/', force: true)
    Bazel.execute('run', [], '//rb:docs')
    FileUtils.cp_r('bazel-bin/rb/docs.rb.sh.runfiles/selenium/docs/api/rb/.', 'build/docs/api/rb')
  end
end

namespace :dotnet do
  def version
    File.foreach('dotnet/selenium-dotnet-version.bzl') do |line|
      return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
    end
  end

def dotnet_version
  File.foreach('dotnet/selenium-dotnet-version.bzl') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end
namespace :dotnet do
  desc 'Build nupkg files'
  task :build, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : []
    Bazel.execute('build', args, '//dotnet:all')
  end

  desc 'Create zipped assets for .NET for uploading to GitHub'
  task :zip_assets, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : ['--stamp']
    Rake::Task['dotnet:build'].invoke(args)
    mkdir_p 'build/dist'
    FileUtils.rm_f('build/dist/*dotnet*', force: true)

    FileUtils.copy('bazel-bin/dotnet/release.zip', "build/dist/selenium-dotnet-#{dotnet_version}.zip")
    FileUtils.chmod(666, "build/dist/selenium-dotnet-#{dotnet_version}.zip")
    FileUtils.copy('bazel-bin/dotnet/strongnamed.zip', "build/dist/selenium-dotnet-strongnamed-#{dotnet_version}.zip")
    FileUtils.chmod(666, "build/dist/selenium-dotnet-strongnamed-#{dotnet_version}.zip")
  end

  desc 'Upload nupkg files to Nuget'
  task :release, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : ['--stamp']
    Rake::Task['dotnet:build'].invoke(args)
    Rake::Task['dotnet:zip_assets'].invoke(args)

    ["./bazel-bin/dotnet/src/webdriver/Selenium.WebDriver.#{dotnet_version}.nupkg",
     "./bazel-bin/dotnet/src/support/Selenium.Support.#{dotnet_version}.nupkg"].each do |asset|
      sh "dotnet nuget push #{asset} --api-key #{ENV.fetch('NUGET_API_KEY', nil)} --source https://api.nuget.org/v3/index.json"
    end
  end

  desc 'Generate .NET documentation'
  task :docs do
    begin
      sh 'dotnet tool update -g docfx'
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
        puts 'Build failed, likely because of DevTools namespacing. This is ok; continuing'
      else
        raise
      end
    end
  end
end

namespace :java do
  desc 'Build Java Client Jars'
  task :build, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : []
    Bazel.execute('build', args, '//java/src/org/openqa/selenium:client-combined')
  end

  desc 'Build Grid Jar'
  task :grid, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : []
    Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:grid')
  end

  desc 'Package Java bindings and grid into releasable packages'
  task :package, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : []
    Rake::Task['java:build'].invoke(args)
    Rake::Task['java-release-zip'].invoke
  end

  desc 'Deploy all jars to Maven'
  task :release, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : ['--stamp']
    Rake::Task['java:package'].invoke(args)
    Rake::Task['publish-maven'].invoke
  end

  desc 'Install jars to local m2 directory'
  task install: :'maven-install'

  desc 'Generate Java documentation'
  task docs: :javadocs
end

namespace :rust do
  desc 'Build Selenium Manager'
  task :build, [:args] do |_task, arguments|
    args = arguments[:args] ? [arguments[:args]] : []
    Bazel.execute('build', args, '//rust:selenium-manager')
  end

  desc 'Update the rust lock files'
  task :update do
    sh 'CARGO_BAZEL_REPIN=true bazel sync --only=crates'
  end
end

namespace :all do
  desc 'Update all API Documentation'
  task :docs do
    Rake::Task['java:docs'].invoke
    Rake::Task['py:docs'].invoke
    Rake::Task['rb:docs'].invoke
    Rake::Task['dotnet:docs'].invoke
  end
end

at_exit do
  if File.exist?('.git') && !SeleniumRake::Checks.windows?
    system 'sh', '.git-fixfiles'
  end
end
