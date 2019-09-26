# -*- mode: ruby -*-

$LOAD_PATH.unshift File.expand_path(".")

require 'rake'
require 'rake-tasks/files'
require 'net/telnet'
require 'stringio'
require 'fileutils'

include Rake::DSL if defined?(Rake::DSL)

Rake.application.instance_variable_set "@name", "go"
orig_verbose = verbose
verbose(false)

# The CrazyFun build grammar. There's no magic here, just ruby
require 'rake-tasks/crazy_fun'
require 'rake-tasks/crazy_fun/mappings/export'
require 'rake-tasks/crazy_fun/mappings/folder'
require 'rake-tasks/crazy_fun/mappings/javascript'
require 'rake-tasks/crazy_fun/mappings/rake'
require 'rake-tasks/crazy_fun/mappings/rename'
require 'rake-tasks/crazy_fun/mappings/ruby'

# The original build rules
require 'rake-tasks/task-gen'
require 'rake-tasks/checks'
require 'rake-tasks/c'
require 'rake-tasks/selenium'
require 'rake-tasks/ie_code_generator'
require 'rake-tasks/ci'

$DEBUG = orig_verbose != Rake::FileUtilsExt::DEFAULT ? true : false
if (ENV['debug'] == 'true')
  $DEBUG = true
end
verbose($DEBUG)

def release_version
  "4.0"
end

def google_storage_version
  "4.0-alpha"
end

def version
  "#{release_version}.0-alpha-3"
end

# The build system used by webdriver is layered on top of rake, and we call it
# "crazy fun" for no readily apparent reason.

# First off, create a new CrazyFun object.
crazy_fun = CrazyFun.new

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
RakeMappings.new.add_all(crazy_fun)
RubyMappings.new.add_all(crazy_fun)

# Finally, find every file named "build.desc" in the project, and generate
# rake tasks from them. These tasks are normal rake tasks, and can be invoked
# from rake.
crazy_fun.create_tasks(Dir["common/**/build.desc"])
crazy_fun.create_tasks(Dir["rb/**/build.desc"])

# If it looks like a bazel target, build it with bazel
rule /\/\/.*/ do |task|
  task.out = Bazel::execute("build", ["--workspace_status_command", "scripts/build-info.py"], task.name)
end

# Spoof tasks to get CI working with bazel
task '//java/client/test/org/openqa/selenium/environment/webserver:webserver:uber' => [
  '//java/client/test/org/openqa/selenium/environment:webserver'
]

# Java targets required for release. These should all be java_export targets.
# Generated from: bazel query 'kind(.*_publish, set(//java/... //third_party/...))'
JAVA_RELEASE_TARGETS = %w(
  //java/server/src/org/openqa/selenium/grid:grid-publish
  //java/server/src/com/thoughtworks/selenium/webdriven:webdriven-publish
  //java/client/src/org/openqa/selenium/support:support-publish
  //java/client/src/org/openqa/selenium/safari:safari-publish
  //java/client/src/org/openqa/selenium/remote/http:http-publish
  //java/client/src/org/openqa/selenium/remote:remote-publish
  //java/client/src/org/openqa/selenium/opera:opera-publish
  //java/client/src/org/openqa/selenium/lift:lift-publish
  //java/client/src/org/openqa/selenium/json:json-publish
  //java/client/src/org/openqa/selenium/ie:ie-publish
  //java/client/src/org/openqa/selenium/firefox/xpi:xpi-publish
  //java/client/src/org/openqa/selenium/firefox:firefox-publish
  //java/client/src/org/openqa/selenium/edge/edgehtml:edgehtml-publish
  //java/client/src/org/openqa/selenium/edge:edgeium-publish
  //java/client/src/org/openqa/selenium/devtools:devtools-publish
  //java/client/src/org/openqa/selenium/chromium:chromium-publish
  //java/client/src/org/openqa/selenium/chrome:chrome-publish
  //java/client/src/org/openqa/selenium:core-publish
  //java/client/src/org/openqa/selenium:client-combined-publish
)


# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task :default => [:test]

task :all => [
  :"selenium-java",
  "//java/client/test/org/openqa/selenium/environment:webserver"
]
task :all_zip => [:'prep-release-zip']
task :tests => [
  "//java/client/test/org/openqa/selenium/htmlunit:htmlunit",
  "//java/client/test/org/openqa/selenium/firefox:test-synthesized",
  "//java/client/test/org/openqa/selenium/ie:ie",
  "//java/client/test/org/openqa/selenium/chrome:chrome",
  "//java/client/test/org/openqa/selenium/edge:edge",
  "//java/client/test/org/openqa/selenium/opera:opera",
  "//java/client/test/org/openqa/selenium/support:small-tests",
  "//java/client/test/org/openqa/selenium/support:large-tests",
  "//java/client/test/org/openqa/selenium/remote:small-tests",
  "//java/server/test/org/openqa/selenium/remote/server/log:test",
  "//java/server/test/org/openqa/selenium/remote/server:small-tests",
]
task :chrome => [ "//java/client/src/org/openqa/selenium/chrome" ]
task :grid => [ :'selenium-server-standalone' ]
task :ie => [ "//java/client/src/org/openqa/selenium/ie" ]
task :firefox => [ "//java/client/src/org/openqa/selenium/firefox" ]
task :'debug-server' => "//java/client/test/org/openqa/selenium/environment:webserver:run"
task :remote => [:remote_server, :remote_client]
task :remote_client => ["//java/client/src/org/openqa/selenium/remote"]
task :remote_server => ["//java/server/src/org/openqa/selenium/remote/server"]
task :safari => [ "//java/client/src/org/openqa/selenium/safari" ]
task :selenium => [ "//java/client/src/org/openqa/selenium:core" ]
task :support => [
  "//java/client/src/org/openqa/selenium/lift",
  "//java/client/src/org/openqa/selenium/support",
]

desc 'Build the standalone server'
task 'selenium-server-standalone' => '//java/server/src/org/openqa/selenium/grid:selenium_server_deploy.jar'

task :test_javascript => [
  'calcdeps',
  '//javascript/atoms:atoms-chrome:run',
  '//javascript/webdriver:webdriver-chrome:run',
  '//javascript/selenium-atoms:selenium-atoms-chrome:run',
  '//javascript/selenium-core:selenium-core-chrome:run']
task :test_chrome => [ "//java/client/test/org/openqa/selenium/chrome:chrome:run" ]
task :test_edge => [ "//java/client/test/org/openqa/selenium/edge:edge:run" ]
task :test_chrome_atoms => [
  '//javascript/atoms:test_chrome:run',
  '//javascript/chrome-driver:test:run',
  '//javascript/webdriver:test_chrome:run']
task :test_htmlunit => [
  "//java/client/test/org/openqa/selenium/htmlunit:htmlunit:run"
]
task :test_grid => [
  "//java/server/test/org/openqa/grid/common:common:run",
  "//java/server/test/org/openqa/grid:grid:run",
  "//java/server/test/org/openqa/grid/e2e:e2e:run",
  "//java/client/test/org/openqa/selenium/remote:remote-driver-grid-tests:run",
]
task :test_ie => [
  "//cpp/iedriverserver:win32",
  "//cpp/iedriverserver:x64",
  "//java/client/test/org/openqa/selenium/ie:ie:run"
]
task :test_jobbie => [ :test_ie ]
task :test_firefox => [ "//java/client/test/org/openqa/selenium/firefox:marionette:run" ]
task :test_opera => [ "//java/client/test/org/openqa/selenium/opera:opera:run" ]
task :test_remote_server => [
   '//java/server/test/org/openqa/selenium/remote/server:small-tests:run',
   '//java/server/test/org/openqa/selenium/remote/server/log:test:run',
]
task :test_remote => [
  '//java/client/test/org/openqa/selenium/json:small-tests:run',
  '//java/client/test/org/openqa/selenium/remote:common-tests:run',
  '//java/client/test/org/openqa/selenium/remote:client-tests:run',
  '//java/client/test/org/openqa/selenium/remote:remote-driver-tests:run',
  :test_remote_server
]
task :test_safari => [ "//java/client/test/org/openqa/selenium/safari:safari:run" ]
task :test_support => [
  "//java/client/test/org/openqa/selenium/lift:lift:run",
  "//java/client/test/org/openqa/selenium/support:small-tests:run",
  "//java/client/test/org/openqa/selenium/support:large-tests:run"
]

# TODO(simon): test-core should go first, but it's changing the least for now.
task :test_selenium => [ :'test-rc']

task :'test-rc' => ['//java/client/test/com/thoughtworks/selenium:firefox-rc-test:run']

if (windows?)
  task :'test-rc' => ['//java/client/test/com/thoughtworks/selenium:ie-rc-test:run']
end

task :test_java_webdriver => [
  :test_htmlunit,
  :test_firefox,
  :test_remote_server,
]
if (windows?)
  task :test_java_webdriver => [:test_ie]
end
if (present?("chromedriver"))
  task :test_java_webdriver => [:test_chrome]
end
if (present?("msedgedriver"))
  task :test_java_webdriver => [:test_edge]
end
if (opera?)
  task :test_java_webdriver => [:test_opera]
end

task :test_java => [
  "//java/client/test/org/openqa/selenium/atoms:test:run",
  :test_java_small_tests,
  :test_support,
  :test_java_webdriver,
  :test_selenium,
  "test_grid",
]

task :test_java_small_tests => [
  "//java/client/test/org/openqa/selenium:small-tests:run",
  "//java/client/test/org/openqa/selenium/json:small-tests:run",
  "//java/client/test/org/openqa/selenium/support:small-tests:run",
  "//java/client/test/org/openqa/selenium/remote:common-tests:run",
  "//java/client/test/org/openqa/selenium/remote:client-tests:run",
  "//java/server/test/org/openqa/grid/selenium/node:node:run",
  "//java/server/test/org/openqa/grid/selenium/proxy:proxy:run",
  "//java/server/test/org/openqa/selenium/remote/server:small-tests:run",
  "//java/server/test/org/openqa/selenium/remote/server/log:test:run",
]

task :test_rb => ["//rb:unit-test", :test_rb_local, :test_rb_remote]

task :test_rb_local => [
  "//rb:chrome-test",
  "//rb:firefox-test",
  ("//rb:safari-preview-test" if mac?),
  ("//rb:safari-test" if mac?),
  ("//rb:ie-test" if windows?),
  ("//rb:edge-test" if windows?)
].compact

task :test_rb_remote => [
  "//rb:remote-chrome-test",
  "//rb:remote-firefox-test",
  ("//rb:remote-safari-test" if mac?),
  ("//rb:remote-ie-test" if windows?),
  ("//rb:remote-edge-test" if windows?)
].compact

task :test_py => [ :py_prep_for_install_release, "py:marionette_test" ]

task :test => [ :test_javascript, :test_java, :test_rb ]
if (python?)
  task :test => [ :test_py ]
end

task :build => [:all, :firefox, :remote, :selenium, :tests]

desc 'Clean build artifacts.'
task :clean do
  rm_rf 'build/'
  rm_rf 'java/client/build/'
  rm_rf 'dist/'
end

# Generate a C++ Header file for mapping between magic numbers and #defines
# in the C++ code.
ie_generate_type_mapping(:name => "ie_result_type_cpp",
                         :src => "cpp/iedriver/result_types.txt",
                         :type => "cpp",
                         :out => "cpp/iedriver/IEReturnTypes.h")


task :javadocs => [:common, :firefox, :ie, :remote, :support, :chrome, :selenium] do
  rm_rf "build/javadoc"
  mkdir_p "build/javadoc"
   sourcepath = ""
   classpath = '.'
   Dir["third_party/java/*/*.jar"].each do |jar|
     classpath << ":" + jar unless jar.to_s =~ /.*-src.*\.jar/
   end
   [File.join(%w(java client src))].each do |m|
     sourcepath += File::PATH_SEPARATOR + m
   end
   [File.join(%w(java server src))].each do |m|
     sourcepath += File::PATH_SEPARATOR + m
   end

   p sourcepath
   cmd = "javadoc -notimestamp -d build/javadoc -sourcepath #{sourcepath} -classpath #{classpath} -subpackages org.openqa.selenium -subpackages com.thoughtworks "
   cmd << " -exclude org.openqa.selenium.internal.selenesedriver:org.openqa.selenium.internal.seleniumemulation:org.openqa.selenium.remote.internal"

   if (windows?)
     cmd = cmd.gsub(/\//, "\\").gsub(/:/, ";")
   end
   sh cmd

   File.open("build/javadoc/stylesheet.css", "a") { |file| file.write(<<EOF

/* Custom selenium-specific styling */
.blink {
  animation: 2s cubic-bezier(0.5, 0, 0.85, 0.85) infinite blink;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

EOF
)
   }
end

task :py_prep_for_install_release => [
  :chrome,
  "py:prep"
]

task :py_docs => "py:docs"

task :py_install =>  "py:install"

task :py_release => :py_prep_for_install_release do
    sh "python setup.py sdist bdist_wheel upload"
end

file "cpp/iedriver/sizzle.h" => [ "//third_party/js/sizzle:sizzle:header" ] do
  cp "build/third_party/js/sizzle/sizzle.h", "cpp/iedriver/sizzle.h"
end

task :sizzle_header => [ "cpp/iedriver/sizzle.h" ]

task :ios_driver => [
  "//javascript/atoms/fragments:get_visible_text:ios",
  "//javascript/atoms/fragments:click:ios",
  "//javascript/atoms/fragments:back:ios",
  "//javascript/atoms/fragments:forward:ios",
  "//javascript/atoms/fragments:submit:ios",
  "//javascript/atoms/fragments:xpath:ios",
  "//javascript/atoms/fragments:xpaths:ios",
  "//javascript/atoms/fragments:type:ios",
  "//javascript/atoms/fragments:get_attribute:ios",
  "//javascript/atoms/fragments:clear:ios",
  "//javascript/atoms/fragments:is_selected:ios",
  "//javascript/atoms/fragments:is_enabled:ios",
  "//javascript/atoms/fragments:is_shown:ios",
  "//javascript/atoms/fragments:stringify:ios",
  "//javascript/atoms/fragments:link_text:ios",
  "//javascript/atoms/fragments:link_texts:ios",
  "//javascript/atoms/fragments:partial_link_text:ios",
  "//javascript/atoms/fragments:partial_link_texts:ios",
  "//javascript/atoms/fragments:get_interactable_size:ios",
  "//javascript/atoms/fragments:scroll_into_view:ios",
  "//javascript/atoms/fragments:get_effective_style:ios",
  "//javascript/atoms/fragments:get_element_size:ios",
  "//javascript/webdriver/atoms/fragments:get_location_in_view:ios"
]

task :'prep-release-zip' => [
  '//java/client/src/org/openqa/selenium:client-zip',
  '//java/server/src/org/openqa/selenium/grid:server-zip',
  '//java/server/src/org/openqa/selenium/grid:selenium_server_deploy.jar',
  '//java/server/src/org/openqa/selenium/server/htmlrunner:selenium-runner_deploy.jar'] do

  ["build/dist/selenium-server-#{version}.zip", "build/dist/selenium-java-#{version}.zip",
   "build/dist/selenium-server-#{version}.jar", "build/dist/selenium-html-runner-#{version}.jar"].each do |f|
    rm_f(f) if File.exists?(f)
  end

  mkdir_p "build/dist"
  File.delete()
  cp Rake::Task['//java/server/src/org/openqa/selenium/grid:server-zip'].out, "build/dist/selenium-server-#{version}.zip", preserve: false
  chmod 0666, "build/dist/selenium-server-#{version}.zip"
  cp Rake::Task['//java/client/src/org/openqa/selenium:client-zip'].out, "build/dist/selenium-java-#{version}.zip", preserve: false
  chmod 0666, "build/dist/selenium-java-#{version}.zip"
  cp Rake::Task['//java/server/src/org/openqa/selenium/grid:selenium_server_deploy.jar'].out, "build/dist/selenium-server-#{version}.jar", preserve: false
  chmod 0666, "build/dist/selenium-server-#{version}.jar"
  cp Rake::Task['//java/server/src/org/openqa/selenium/server/htmlrunner:selenium-runner_deploy.jar'].out, "build/dist/selenium-html-runner-#{version}.jar", preserve: false
  chmod 0666, "build/dist/selenium-html-runner-#{version}.jar"
end


task :'release-java' => [:'publish-maven', :'push-release']

def read_user_pass_from_m2_settings
    settings = File.read(ENV['HOME'] + "/.m2/settings.xml")
    found_section = false
    user = nil
    pass = nil
    settings.each_line do |line|
        if !found_section
            found_section = line.include? "<id>sonatype-nexus-staging</id>"
        else
            if user == nil and line.include? "<username>"
              user = line.split("<username>")[1].split("</")[0]
            elsif pass == nil and line.include? "<password>"
              pass = line.split("<password>")[1].split("</")[0]
            end
        end
    end

    return [user, pass]
end

task :'publish-maven' => JAVA_RELEASE_TARGETS + %w(//java/server/src/org/openqa/selenium/server/htmlrunner:selenium-runner_deploy.jar) do
  puts "\n Enter Passphrase:"
  passphrase = STDIN.gets.chomp

  creds = read_user_pass_from_m2_settings()
  JAVA_RELEASE_TARGETS.each do |p|
    Bazel::execute('run', ["--workspace_status_command=\"#{py_exe} scripts/build-info.py\"", '--stamp', '--define', 'maven_repo=https://oss.sonatype.org/service/local/staging/deploy/maven2', '--define', "maven_user=#{creds[0]}", '--define', "maven_password=#{creds[1]}", '--define', "gpg_password=#{passphrase}"], p)
  end
end

task :'maven-install' do
  JAVA_RELEASE_TARGETS.each do |p|
    Bazel::execute('run', ["--workspace_status_command=\"#{py_exe} scripts/build-info.py\"", '--stamp', '--define', "maven_repo=file://#{ENV['HOME']}/.m2/repository"], p)
  end
end

task :'push-release' => [:'prep-release-zip'] do
  py = "java -jar third_party/py/jython.jar"
  if python?
    py = "python"
  end

  sh "#{py} third_party/py/googlestorage/publish_release.py --project_id google.com:webdriver --bucket selenium-release --acl public-read --publish_version #{google_storage_version} --publish build/dist/selenium-server-#{version}.jar --publish build/dist/selenium-java-#{version}.zip --publish build/dist/selenium-server-#{version}.jar --publish build/dist/selenium-html-runner-#{version}.jar"
end

desc 'Build the selenium client jars'
task 'selenium-java' => '//java/client/src/org/openqa/selenium:client-combined'

namespace :safari do
  desc "Build the SafariDriver java client"
  task :build => [
    "//java/client/src/org/openqa/selenium/safari"
  ]
end

task :authors do
  puts "Generating AUTHORS file"
  sh "(git log --use-mailmap --format='%aN <%aE>' ; cat .OLD_AUTHORS) | sort -uf > AUTHORS"
end

at_exit do
  if File.exist?(".git") && !Platform.windows?
    system "sh", ".git-fixfiles"
  end
end
