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
require 'rake-tasks/crazy_fun/mappings/gcc'
require 'rake-tasks/crazy_fun/mappings/java'
require 'rake-tasks/crazy_fun/mappings/javascript'
require 'rake-tasks/crazy_fun/mappings/mozilla'
require 'rake-tasks/crazy_fun/mappings/python'
require 'rake-tasks/crazy_fun/mappings/rake'
require 'rake-tasks/crazy_fun/mappings/rename'
require 'rake-tasks/crazy_fun/mappings/ruby'
require 'rake-tasks/crazy_fun/mappings/visualstudio'

# The original build rules
require 'rake-tasks/task-gen'
require 'rake-tasks/checks'
require 'rake-tasks/dotnet'
require 'rake-tasks/zip'
require 'rake-tasks/c'
require 'rake-tasks/java'
require 'rake-tasks/selenium'
require 'rake-tasks/se-ide'
require 'rake-tasks/ie_code_generator'
require 'rake-tasks/ci'

require 'rake-tasks/gecko_sdks'

$DEBUG = orig_verbose != :default ? true : false
if (ENV['debug'] == 'true')
  $DEBUG = true
end
verbose($DEBUG)

def version
  "2.43.1"
end
ide_version = "1.10.0"

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
ExportMappings.new.add_all(crazy_fun)
FolderMappings.new.add_all(crazy_fun)
GccMappings.new.add_all(crazy_fun)
JavaMappings.new.add_all(crazy_fun)
JavascriptMappings.new.add_all(crazy_fun)
MozillaMappings.new.add_all(crazy_fun)
PythonMappings.new.add_all(crazy_fun)
RakeMappings.new.add_all(crazy_fun)
RenameMappings.new.add_all(crazy_fun)
RubyMappings.new.add_all(crazy_fun)
VisualStudioMappings.new.add_all(crazy_fun)

# Not every platform supports building every binary needed, so we sometimes
# need to fall back to prebuilt binaries. The prebuilt binaries are stored in
# a directory structure identical to that used in the "build" folder, but
# rooted at one of the following locations:
["cpp/prebuilt", "ide/main/prebuilt", "javascript/firefox-driver/prebuilt"].each do |pre|
  crazy_fun.prebuilt_roots << pre
end

# Finally, find every file named "build.desc" in the project, and generate
# rake tasks from them. These tasks are normal rake tasks, and can be invoked
# from rake.
crazy_fun.create_tasks(Dir["**/build.desc"])

# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task :default => [:test]


task :all => [:'selenium-java']
task :all_zip => [:'selenium-java_zip']
task :chrome => [ "//java/client/src/org/openqa/selenium/chrome" ]
task :common_core => [ "//common:core" ]
task :grid => [ "//java/server/src/org/openqa/grid/selenium" ]
task :htmlunit => [ "//java/client/src/org/openqa/selenium/htmlunit" ]
task :ie => [ "//java/client/src/org/openqa/selenium/ie" ]
task :firefox => [ "//java/client/src/org/openqa/selenium/firefox" ]
task :'debug-server' => "//java/client/test/org/openqa/selenium/environment/webserver:WebServer:run"
task :remote => [:remote_common, :remote_server, :remote_client]
task :remote_common => ["//java/client/src/org/openqa/selenium/remote:common"]
task :remote_client => ["//java/client/src/org/openqa/selenium/remote"]
task :remote_server => ["//java/server/src/org/openqa/selenium/remote/server"]
task :safari => [
  "//javascript/safari-driver:SafariDriver",
  "//java/client/src/org/openqa/selenium/safari",
]
task :server_lite => ["//java/server/src/org/openqa/selenium/server:server_lite"]
task :selenium => [ "//java/client/src/org/openqa/selenium" ]
task :support => [
  "//java/client/src/org/openqa/selenium/lift",
  "//java/client/src/org/openqa/selenium/support",
]

desc 'Build the standalone server'
task 'selenium-server-standalone' => '//java/server/src/org/openqa/grid/selenium:selenium:uber'

task :ide => [ "//ide:selenium-ide-multi" ]
task :ide_proxy_setup => [ "//javascript/selenium-atoms", "se_ide:setup_proxy" ]
task :ide_proxy_remove => [ "se_ide:remove_proxy" ]
task :ide_bamboo => ["se_ide:assemble_ide_in_bamboo"]

task :test_javascript => [
  '//javascript/atoms:test:run',
  '//javascript/webdriver:test:run',
  '//javascript/selenium-atoms:test:run',
  '//javascript/selenium-core:test:run']
task :test_chrome => [ "//java/client/test/org/openqa/selenium/chrome:test:run" ]
task :test_chrome_atoms => [
  '//javascript/atoms:test_chrome:run',
  '//javascript/chrome-driver:test:run',
  '//javascript/webdriver:test_chrome:run']
task :test_htmlunit => [
  "//java/client/test/org/openqa/selenium/htmlunit:test_basic:run",
  "//java/client/test/org/openqa/selenium/htmlunit:test_js:run"
]
task :test_grid => [
  "//java/server/test/org/openqa/grid/common:test:run",
  "//java/server/test/org/openqa/grid:test:run",
  "//java/server/test/org/openqa/grid/e2e:test:run"
]
task :test_ie => [ "//java/client/test/org/openqa/selenium/ie:test:run" ]
task :test_jobbie => [ :test_ie ]
task :test_firefox => [ "//java/client/test/org/openqa/selenium/firefox:test_synthesized:run" ]
if (!mac?)
  task :test_firefox => [ "//java/client/test/org/openqa/selenium/firefox:test_native:run" ]
end
task :test_opera => [ "//java/client/test/org/openqa/selenium/opera:test:run" ]
task :test_opera_mobile => [ "//java/client/test/org/openqa/selenium/opera/mobile:test:run" ]
task :test_remote_server => [ '//java/server/test/org/openqa/selenium/remote/server:test:run' ]
task :test_remote => [
  '//java/client/test/org/openqa/selenium/remote:common-tests:run',
  '//java/client/test/org/openqa/selenium/remote:client-tests:run',
  :test_remote_server
]
task :test_safari => [ "//java/client/test/org/openqa/selenium/safari:test:run" ]
task :test_phantomjs => [ "//java/client/test/org/openqa/selenium/phantomjs:test:run" ]
task :test_support => [
  "//java/client/test/org/openqa/selenium/lift:test:run",
  "//java/client/test/org/openqa/selenium/support:SmallTests:run",
  "//java/client/test/org/openqa/selenium/support:LargeTests:run"
]

# TODO(simon): test-core should go first, but it's changing the least for now.
task :test_selenium => [ :'test-rc', :'test-v1-emulation', :'test-core']

task :'test-v1-emulation' => [ '//java/client/test/com/thoughtworks/selenium:firefox-emulation-test:run' ]
task :'test-rc' => ['//java/client/test/org/openqa/selenium:RcBrowserLauncherTests:run',
                    '//java/server/test/org/openqa/selenium/server:RcServerUnitTests:run',
                    '//java/server/test/org/openqa/selenium/server:RcServerLargeTests:run',
                    '//java/client/test/com/thoughtworks/selenium:firefox-rc-test:run',
                    '//java/client/test/com/thoughtworks/selenium:firefox-proxy-rc-test:run',
                    '//java/client/test/com/thoughtworks/selenium:firefox-singlewindow-rc-test:run']
task :'test-core' => [:'test-core-firefox']

if (windows?)
  task :'test-v1-emulation' => ['//java/client/test/com/thoughtworks/selenium:ie-emulation-test:run']
  task :'test-rc' => ['//java/client/test/com/thoughtworks/selenium:ie-rc-test:run',
                      '//java/client/test/com/thoughtworks/selenium:ie-proxy-rc-test:run',
                      '//java/client/test/com/thoughtworks/selenium:ie-singlewindow-rc-test:run']
  task :'test-core' => [:'test-core-ie']
# TODO(santi): why are these disabled?
#elsif (mac?)
#  task :'test-rc' => ['//java/client/test/com/thoughtworks/selenium:safari-rc-test:run',
#                       '//java/client/test/com/thoughtworks/selenium:safari-proxy-rc-test:run']
#  task :'test-core' => [:'test-core-safari']
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
if (opera?)
  task :test_java_webdriver => [:test_opera]
end


task :test_java => [
  "//java/client/test/org/openqa/selenium/atoms:test:run",
  "//java/client/test/org/openqa/selenium:SmallTests:run",
  :test_support,
  :test_java_webdriver,
  :test_selenium,
  "test_grid",
]

task :test_rb => [
  "//rb:unit-test",
  "//rb:rc-client-unit-test",
  "//rb:firefox-test",
  "//rb:remote-test",
  "//rb:rc-client-integration-test",
 ("//rb:ie-test" if windows?),
  "//rb:chrome-test",
  "//rb:safari-test",
  "//rb:phantomjs-test"
].compact

task :test_py => [ :py_prep_for_install_release, "//py:firefox_test:run" ]

task :test_dotnet => [
  "//dotnet/test:firefox:run"
]

task :test => [ :test_javascript, :test_java, :test_rb ]
if (msbuild_installed?)
  task :test => [ :test_dotnet ]
end
if (python?)
  task :test => [ :test_py ]
end


task :build => [:all, :remote, :selenium]

desc 'Clean build artifacts.'
task :clean do
  rm_rf 'build/'
  rm_rf 'java/client/build/'
  rm_rf 'dist/'
end

task :dotnet => [ "//dotnet", "//dotnet:support", "//dotnet:core", "//dotnet:webdriverbackedselenium" ]

# Generate a C++ Header file for mapping between magic numbers and #defines
# in the C++ code.
ie_generate_type_mapping(:name => "ie_result_type_cpp",
                         :src => "cpp/iedriver/result_types.txt",
                         :type => "cpp",
                         :out => "cpp/iedriver/IEReturnTypes.h")

# Generate a Java class for mapping between magic numbers and Java static
# class members describing them.
ie_generate_type_mapping(:name => "ie_result_type_java",
                         :src => "cpp/iedriver/result_types.txt",
                         :type => "java",
                         :out => "java/client/src/org/openqa/selenium/ie/IeReturnTypes.java")


GeckoSDKs.new do |sdks|
  sdks.add 'third_party/gecko-24/linux',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/24.0/sdk/xulrunner-24.0.en-US.linux-i686.sdk.tar.bz2',
           '669ef73966d0401f77c0a429f194535c'

  sdks.add 'third_party/gecko-24/linux64',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/24.0/sdk/xulrunner-24.0.en-US.linux-x86_64.sdk.tar.bz2',
           '5d58e46da74c49cb50cd45edbcb86ccd'

  sdks.add 'third_party/gecko-24/win32',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/24.0/sdk/xulrunner-24.0.en-US.win32.sdk.zip',
           '29d8fcf397038930a4220b7d60bb3cbf'

  sdks.add 'third_party/gecko-30/linux',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/30.0/sdk/xulrunner-30.0.en-US.linux-i686.sdk.tar.bz2',
           'c32ab5a6fe69ced785bb5813b129c3bf'

  sdks.add 'third_party/gecko-30/linux64',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/30.0/sdk/xulrunner-30.0.en-US.linux-x86_64.sdk.tar.bz2',
           '2bd022924e5b44b00cb4637caa78e034'

  sdks.add 'third_party/gecko-30/win32',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/30.0/sdk/xulrunner-30.0.en-US.win32.sdk.zip',
           'de6d8bd08b6ccce7e83493626750c055'

  sdks.add 'third_party/gecko-31/linux',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/31.0/sdk/xulrunner-31.0.en-US.linux-i686.sdk.tar.bz2',
           'e20ce46e69ed36e20aa4faefe3022698'

  sdks.add 'third_party/gecko-31/linux64',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/31.0/sdk/xulrunner-31.0.en-US.linux-x86_64.sdk.tar.bz2',
           '548ff61bb3a45d0bf645eee7f46e8024'

  sdks.add 'third_party/gecko-31/win32',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/31.0/sdk/xulrunner-31.0.en-US.win32.sdk.zip',
           'e8d7d9bd67b957bb627de7d3269d240b'

  sdks.add 'third_party/gecko-32/linux',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/32.0/sdk/xulrunner-32.0.en-US.linux-i686.sdk.tar.bz2',
           'c34ee083c12ffca658133c2be4aff0ed'

  sdks.add 'third_party/gecko-32/linux64',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/32.0/sdk/xulrunner-32.0.en-US.linux-x86_64.sdk.tar.bz2',
           'bde2b4bcc42eea0f7a395c07d7790e3c'

  sdks.add 'third_party/gecko-32/win32',
           'http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/32.0/sdk/xulrunner-32.0.en-US.win32.sdk.zip',
           'b243148c34a21c78427628f695cc1bfc'
end

task :'selenium-server_zip' do
  temp = "build/selenium-server_zip"
  mkdir_p temp
  sh "cd #{temp} && jar xf ../selenium-server.zip"
  rm_f "build/selenium-server.zip"
  Dir["#{temp}/webdriver-*.jar"].each { |file| rm_rf file }
  mv "#{temp}/selenium-server.jar", "#{temp}/selenium-server-#{version}.jar"
  sh "cd #{temp} && jar cMf ../selenium-server.zip *"
end

{"firefox" => "*chrome",
 "ie" => "*iexploreproxy",
 "opera" => "*opera",
 "safari" => "*safari"}.each_pair do |k,v|
  selenium_test(:name => "test-core-#{k}",
                :srcs => [ "common/test/js/core/*.js" ],
                :deps => [
                  "//java/server/test/org/openqa/selenium:server-with-tests:uber",
                ],
                :browser => v )
end

task :javadocs => [:common, :firefox, :htmlunit, :ie, :remote, :support, :chrome, :selenium] do
  mkdir_p "build/javadoc"
   sourcepath = ""
   classpath = '.'
   Dir["third_party/java/*/*.jar"].each do |jar|
     classpath << ":" + jar unless jar.to_s =~ /.*-src.*\.jar/
   end
   [File.join(%w(java client src))].each do |m|
     sourcepath += File::PATH_SEPARATOR + m
   end
   p sourcepath
   cmd = "javadoc -notimestamp -d build/javadoc -sourcepath #{sourcepath} -classpath #{classpath} -subpackages org.openqa.selenium -subpackages com.thoughtworks "
   cmd << " -exclude org.openqa.selenium.internal.selenesedriver:org.openqa.selenium.internal.seleniumemulation:org.openqa.selenium.remote.internal"

   if (windows?)
     cmd = cmd.gsub(/\//, "\\").gsub(/:/, ";")
   end
   sh cmd
end

task :py_prep_for_install_release => ["//javascript/firefox-driver:webdriver", :chrome, "//javascript/firefox-driver:webdriver_prefs"] do
    if python? then

        firefox_py_home = "py/selenium/webdriver/firefox/"
        firefox_build_dir = 'build/javascript/firefox-driver/'
        x86 = firefox_py_home + "x86/"
        amd64 = firefox_py_home + "amd64/"

        if (windows?) then
            firefox_build_dir = firefox_build_dir.gsub(/\//, "\\")
            firefox_py_home = firefox_py_home .gsub(/\//, "\\")
            x86 = x86.gsub(/\//,"\\")
            amd64 = amd64.gsub(/\//,"\\")
        end

        mkdir_p x86 unless File.exists?(x86)
        mkdir_p amd64 unless File.exists?(amd64)

        cp "cpp/prebuilt/i386/libnoblur.so", x86+"x_ignore_nofocus.so", :verbose => true
        cp "cpp/prebuilt/amd64/libnoblur64.so", amd64+"x_ignore_nofocus.so", :verbose => true

        cp firefox_build_dir + "webdriver.xpi" , firefox_py_home, :verbose => true
        cp firefox_build_dir + "webdriver_prefs.json" , firefox_py_home, :verbose => true
    end
end

task :py_docs => "//py:docs"

task :py_install => :py_prep_for_install_release do
    sh "python setup.py install"
end

task :py_release => :py_prep_for_install_release do
    sh "grep -v test setup.py > setup_release.py; mv setup_release.py setup.py"
    sh "python setup.py sdist upload"
    sh "git checkout setup.py"
end


task :test_selenium_py => [:'selenium-core', :'selenium-server-standalone'] do
    if python? then
        sh "python2.6 selenium/test/py/runtests.py", :verbose => true
    end
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

file "build/javascript/deps.js" => FileList[
    "third_party/closure/goog/**/*.js",
	"third_party/js/wgxpath/**/*.js",
    "javascript/*/**/*.js",  # Don't depend on js files directly in javascript/
  ] do
  our_cmd = "java -jar third_party/py/jython.jar third_party/closure/bin/calcdeps.py "
  our_cmd << "--output_mode=deps --path=javascript --path=third_party/js/wgxpath "
  our_cmd << "--dep=third_party/closure/goog"

  # Generate the deps. The file paths will be as they appear on the filesystem,
  # but for our tests, the WebDriverJS source files are served from /js/src and
  # the Closure Library source is under /third_party/closure/goog, so we need
  # to modify the generated paths to match that scheme.
  output = ""
  io = IO.popen(our_cmd)
    io.each do |line|
      line = line.gsub("\\\\", "/")
      output << line.gsub(/common\/(.*)\/js/, 'js/\1')
    end

  built_deps = "build/javascript/deps.js"
  puts "Writing #{built_deps}"
  mkdir_p File.dirname(built_deps)
  File.open(built_deps, "w") do |f| f.write(output); end
  cp built_deps, "javascript/deps.js"
end

desc "Calculate dependencies required for testing the automation atoms"
task :calcdeps => "build/javascript/deps.js"

task :test_webdriverjs => [
  "//javascript/webdriver:test:run"
]

desc "Generate a single file with WebDriverJS' public API"
task :webdriverjs => [ "//javascript/webdriver:webdriver" ]

task :release => [
    :clean,
    '//java/server/src/org/openqa/selenium/server:server:zip',
    '//java/server/src/org/openqa/grid/selenium:selenium:zip',
    '//java/client/src/org/openqa/selenium:client-combined:zip',
  ] do |t|
  # Unzip each of the deps and rename the pieces that need renaming
  renames = {
    "client-combined-nodeps-srcs.jar" => "selenium-java-#{version}-srcs.jar",
    "client-combined-nodeps.jar" => "selenium-java-#{version}.jar",
    "selenium-nodeps-srcs.jar" => "selenium-server-#{version}-srcs.jar",
    "selenium-nodeps.jar" => "selenium-server-#{version}.jar",
    "selenium-standalone.jar" => "selenium-server-standalone-#{version}.jar",
  }

  t.prerequisites.each do |pre|
    zip = Rake::Task[pre].out

    next unless zip =~ /\.zip$/

    temp =  zip + "rename"
    rm_rf temp
    deep = File.join(temp, "/selenium-#{version}")
    mkdir_p deep
    cp 'java/CHANGELOG', deep

    sh "cd #{deep} && jar xf ../../#{File.basename(zip)}"
    renames.each do |from, to|
      src = File.join(deep, from)
            next unless File.exists?(src)

      mv src, File.join(deep, to)
    end
    rm_f File.join(deep, "client-combined-standalone.jar")
    rm zip
    sh "cd #{temp} && jar cMf ../#{File.basename(zip)} *"

    rm_rf temp
  end

  mkdir_p "build/dist"
  cp "build/java/server/src/org/openqa/grid/selenium/selenium-standalone.jar", "build/dist/selenium-server-standalone-#{version}.jar"
  cp "build/java/server/src/org/openqa/grid/selenium/selenium.zip", "build/dist/selenium-server-#{version}.zip"
  cp "build/java/client/src/org/openqa/selenium/client-combined.zip", "build/dist/selenium-java-#{version}.zip"
end

task :push_release => [:release] do
  py = "java -jar third_party/py/jython.jar"
  if (python?)
    py = "python"
  end

  print "Enter your googlecode username:"
  googlecode_username = STDIN.gets.chomp
  print "Enter your googlecode password (NOT your gmail password, the one you use for svn, available at https://code.google.com/hosting/settings):"
  googlecode_password = STDIN.gets.chomp

  [
    {:file => "build/dist/selenium-server-standalone-#{version}.jar", :description => "Use this if you want to use the Selenium RC or Remote WebDriver or use Grid 2 without needing any additional dependencies"},
    {:file => "build/dist/selenium-server-#{version}.zip", :description => "All variants of the Selenium Server: stand-alone, jar with dependencies and sources."},
    {:file => "build/dist/selenium-java-#{version}.zip", :description => "The Java bindings for Selenium 2, including the WebDriver API and the Selenium RC clients. Download this if you plan on just using the client-side pieces of Selenium"}
  ].each do |file|
    puts "Uploading file #{file[:file]}..."
    sh "#{py} third_party/py/googlecode/googlecode_upload.py -s '#{file[:description]}' -p selenium #{file[:file]} -l Featured -u #{googlecode_username} -w #{googlecode_password}"
  end
end

desc 'Build the selenium client jars'
task 'selenium-java' => '//java/client/src/org/openqa/selenium:client-combined:project'

desc 'Build and package Selenium IDE'
task :release_ide  => [:ide] do
  cp 'build/ide/selenium-ide.xpi', "build/ide/selenium-ide-#{ide_version}.xpi"
end

# TODO: do this properly
namespace :docs do
  task :mime_types do
    sh "svn propset svn:mime-type text/html #{Dir['docs/api/**/*.html'].join ' '}"
    sh "svn propset svn:mime-type application/javascript #{Dir['docs/api/**/*.js'].join ' '}"
    sh "svn propset svn:mime-type text/css #{Dir['docs/api/**/*.css'].join ' '}"
  end

  task :js => [ "//javascript/node:selenium-webdriver" ] do
    # First, delete the old docs.
    rm_rf "docs/api/javascript"

    mkdir_p "docs/api/javascript"
    cp_r "build/javascript/node/selenium-webdriver/docs/.", "docs/api/javascript"
  end
end

namespace :node do
  task :deploy => [
    "//cpp:noblur",
    "//cpp:noblur64",
    "//javascript/firefox-driver:webdriver",
    "//javascript/webdriver:asserts_lib",
    "//javascript/webdriver:webdriver_lib",
    "//javascript/webdriver:unit_test_lib"
  ] do
    js = Javascript::BaseJs.new
    # Get JS lib deps, excluding those need to build the FirefoxDriver.
    deps = js.build_deps("", Rake::Task["//javascript/webdriver:asserts_lib"], [])
    deps = js.build_deps("", Rake::Task["//javascript/webdriver:webdriver_lib"], deps)
    deps = js.build_deps("", Rake::Task["//javascript/webdriver:unit_test_lib"], deps)
    deps.uniq!

    cmd =  "node javascript/node/deploy.js" <<
        " --output=build/javascript/node/selenium-webdriver" <<
        " --resource=COPYING:/COPYING" <<
        " --resource=javascript/firefox-driver/webdriver.json:firefox/webdriver.json" <<
        " --resource=build/cpp/amd64/libnoblur64.so:firefox/amd64/libnoblur64.so" <<
        " --resource=build/cpp/i386/libnoblur.so:firefox/i386/libnoblur.so" <<
        " --resource=build/javascript/firefox-driver/webdriver.xpi:firefox/webdriver.xpi" <<
        " --resource=third_party/closure/LICENSE:goog/LICENSE" <<
        " --resource=common/src/web/:test/data/" <<
        " --exclude_resource=common/src/web/Bin" <<
        " --exclude_resource=.gitignore" <<
        " --root=javascript" <<
        " --root=third_party/closure" <<
        " --lib=third_party/closure/goog" <<
        " --lib=" << deps.join(" --lib=") <<
        " --src=javascript/node/selenium-webdriver"

    sh cmd
  end
end

namespace :safari do
  desc "Build the SafariDriver extension"
  task :extension => [ "//javascript/safari-driver:SafariDriver" ]

  desc "Build the SafariDriver extension and java client"
  task :build => [
    :extension,
    "//java/client/src/org/openqa/selenium/safari"
  ]

  desc "Run JavaScript tests for Safari"
  task :testjs => [
      "//javascript/atoms:test_safari:run",
      "//javascript/safari-driver:test:run",
      "//javascript/selenium-atoms:test_safari:run",
      "//javascript/webdriver:test_safari:run"
  ]

  desc "Run Java tests for Safari"
  task :testjava => [
      "//java/client/test/org/openqa/selenium/safari:test:run"
  ]

  desc "Run all SafariDriver tests"
  task :test => [
      "safari:testjs",
      "safari:testjava"
  ]

  desc "Re-install the SafariDriver extension; OSX only"
  task :reinstall => [ :extension ] do |t|
    raise StandardError, "Task #{t.name} is only available on OSX" unless mac?
    sh "osascript javascript/safari-driver/reinstall.scpt"
  end
end

namespace :marionette do
  atoms_file = "build/javascript/marionette/atoms.js"
  func_lookup = {"//javascript/atoms/fragments:clear:firefox" => "clearElement",
                 "//javascript/webdriver/atoms/fragments:get_attribute:firefox" => "getElementAttribute",
                 "//javascript/webdriver/atoms/fragments:get_text:firefox" => "getElementText",
                 "//javascript/atoms/fragments:is_enabled:firefox" => "isElementEnabled",
                 "//javascript/webdriver/atoms/fragments:is_selected:firefox" => "isElementSelected",
                 "//javascript/atoms/fragments:is_displayed:firefox" => "isElementDisplayed"}

  # This task takes all the relevant Marionette atom dependencies
  # (listed in func_lookup) and concatenates them to a single atoms.js
  # file, where each atom is assigned to a custom function name
  # matching the Marionette protocol.
  #
  # The function names are defined in the func_lookup dictionary of
  # target to name.
  #
  # Instead of having this custom behaviour in Selenium, Marionette
  # should use the individually generated .js atom files directly in
  # the future.
  #
  # (See Mozilla bug 936204.)

  desc "Generate Marionette atoms"
  task :atoms => func_lookup.keys do |task|
    b = StringIO.new
    b << File.read("javascript/marionette/COPYING") << "\n"
    b << "\n"

    task.prerequisites.each do |target|
      out = Rake::Task[target].out
      atom = File.read(out).chop

      b << "// target #{target}\n"
      b << "var #{func_lookup[target]} = #{atom};\n"
      b << "\n"
    end

    puts "Generating uberatoms file: #{atoms_file}"
    FileUtils.mkpath("build/javascript/marionette")
    File.open("build/javascript/marionette/atoms.js", "w+") do |h|
      h.write(b.string)
    end
  end
end

task :authors do
  puts "Generating AUTHORS file"
  sh "(git log --use-mailmap --format='%aN <%aE>' ; cat .OLD_AUTHORS) | sort -uf > AUTHORS"
end

at_exit do
  if File.exist?(".git") && !Platform.windows?
    sh "sh .git-fixfiles"
  end
end
