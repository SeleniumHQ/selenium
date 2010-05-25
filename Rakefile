require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

verbose false

# The CrazyFun build grammar. There's no magic here, just ruby
require 'rake-tasks/crazy_fun'
require 'rake-tasks/crazy_fun/mappings/java'
require 'rake-tasks/crazy_fun/mappings/javascript'
require 'rake-tasks/crazy_fun/mappings/mozilla'
require 'rake-tasks/crazy_fun/mappings/rake'

# The original build rules
require 'rake-tasks/task-gen'
require 'rake-tasks/checks'
require 'rake-tasks/dotnet'
require 'rake-tasks/zip'
require 'rake-tasks/c'
require 'rake-tasks/java'
require 'rake-tasks/iphone'
require 'rake-tasks/selenium'
require 'rake-tasks/ruby'
require 'rake-tasks/se-ide'
require 'rake-tasks/ie_code_generator'

version = "2.0a4"
ide_version = "1.0.7-SNAPSHOT"

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
JavaMappings.new.add_all(crazy_fun)
JavascriptMappings.new.add_all(crazy_fun)
MozillaMappings.new.add_all(crazy_fun)
RakeMappings.new.add_all(crazy_fun)

# Not every platform supports building every binary needed, so we sometimes
# need to fall back to prebuilt binaries. The prebuilt binaries are stored in
# a directory structure identical to that used in the "build" folder, but
# rooted at one of the following locations:
["chrome/prebuilt", "common/prebuilt", "firefox/prebuilt", "jobbie/prebuilt", "ide/prebuilt"].each do |pre|
  crazy_fun.prebuilt_roots << pre
end

# Finally, find every file named "build.desc" in the project, and generate
# rake tasks from them. These tasks are normal rake tasks, and can be invoked
# from rake. 
crazy_fun.create_tasks(Dir["**/build.desc"])

# Notice that because we're using rake, anything you can do in a normal rake
# build can also be done here. For example, here we set the default task
task :default => [:test]


# TODO(simon): Shatter the build file into subdirectories, then remove these
task :all => [:'selenium-java']
task :all_zip => [:'selenium-java_zip']
task :chrome => [ "//chrome" ]
task :common => [ "//common" ]
task :common_core => [ "//common:core" ]
task :htmlunit => [ "//htmlunit" ]
task :ie => [ "//jobbie" ]
task :firefox => [ "//firefox" ]
task :jobbie => [:ie]
task :jsapi => "//jsapi:debug:run"
task :remote => [:remote_common, :remote_server, :remote_client]
task :remote_common => ["//remote/common"]
task :remote_client => ["//remote/client"]
task :remote_server => ["//remote/server"]
task :selenium => [ "//selenium" ]
task :support => [ "//support" ]
task :iphone_client => [:'webdriver-iphone-client']
task :iphone => [:iphone_server, :iphone_client]
task :'selenium-server-standalone' => ["//remote/server:server:uber"]
task :ide => [ "//ide:selenium-ide" ]

task :test_common => [ "//common:test" ]
task :test_chrome => [ "//chrome:test:run" ]
task :test_htmlunit => [ "//htmlunit:test:run" ]
task :test_ie => [ "//jobbie:test:run" ]
task :test_jobbie => [ "//jobbie:test:run" ]
task :test_jsapi => "//jsapi:test:run"
task :test_firefox => [ "//firefox:test:run" ]
task :test_remote => [:'webdriver-selenium-server-test']
task :test_selenium => [:'webdriver-selenium-server-test', :'webdriver-selenium-test', "//selenium:test-selenese:run", :'test_core']
task :test_support => [ "//support:test:run" ]
task :test_iphone_client => [:'webdriver-iphone-client-test']
task :test_iphone => [:test_iphone_server, :test_iphone_client]

if (windows?)
  task :test_core => [:'test_core_ie']
end
task :test_core => [:'test_core_firefox']

task :build => [:all, :iphone, :remote, :selenium]
task :test => [
                :test_htmlunit,
                :test_firefox,
                :test_ie,
                :test_support,
                :test_chrome,
                :test_remote,
                :test_selenium,
                :test_core
              ]

task :clean do
  rm_rf 'build/'
  rm_rf 'iphone/build/'
end

dll(:name => "ie_win32_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/InternetExplorerDriver/**/*" ],
    :solution => "WebDriver.sln",
    :out  => "Win32/Release/InternetExplorerDriver.dll",
    :prebuilt => "jobbie/prebuilt")

dll(:name => "ie_x64_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/InternetExplorerDriver/**/*" ],
    :solution => "WebDriver.sln",
    :out  => "x64/Release/InternetExplorerDriver.dll",
    :prebuilt => "jobbie/prebuilt")


dotnet_library(:name => "dotnet_assemblies",
               :project => "rake-tasks/msbuild/webdriver.msbuild.proj",
               :target => "BuildManagedCode")

task :dotnet => [ :ie_win32_dll, :ie_x64_dll, :firefox, :chrome, :'dotnet_assemblies' ]

# Generate a C++ Header file for mapping between magic numbers and #defines
# in the C++ code.
ie_generate_type_mapping(:name => "ie_result_type_cpp",
                         :src => "jobbie/src/common/result_types.txt",
                         :type => "cpp",
                         :out => "cpp/InternetExplorerDriver/IEReturnTypes.h")

# Generate a Java class for mapping between magic numbers and Java static
# class members describing them.
ie_generate_type_mapping(:name => "ie_result_type_java",
                         :src => "jobbie/src/common/result_types.txt",
                         :type => "java",
                         :out => "java/org/openqa/selenium/ie/IeReturnTypes.java")

dll(:name => "firefox_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/webdriver-firefox/**/*" ],
    :solution => "WebDriver.sln",
    :out  => "Win32/Release/webdriver-firefox.dll",
    :deps  => [ 
                "//firefox:native_events_xpt",
              ],
    :prebuilt => "firefox/prebuilt")

dll(:name => "libnoblur_so_64",
    :src  => FileList['firefox/src/cpp/linux-specific/*.c'],
    :arch => "amd64",
    :prebuilt => "firefox/prebuilt",
    :out  => "linux64/Release/x_ignore_nofocus.so")

dll(:name => "libnoblur_so",
    :src  => FileList['firefox/src/cpp/linux-specific/*.c'],
    :arch => "i386",
    :prebuilt => "firefox/prebuilt",
    :out  => "linux/Release/x_ignore_nofocus.so")

task :libnoblur => [:libnoblur_so, :libnoblur_so_64]

gecko_sdk = "third_party/gecko-1.9.0.11/linux/"

dll(:name => "libwebdriver_firefox_so",
    :src  => FileList.new('common/src/cpp/webdriver-interactions/*_linux.cpp') +
             FileList.new('firefox/src/cpp/webdriver-firefox/*.cpp'),
    :arch => "i386",
    :args => " -DXPCOM_GLUE  -DXPCOM_GLUE_USE_NSPR -I common/src/cpp/webdriver-interactions -I #{gecko_sdk}include -I /usr/include/nspr " + "`pkg-config gtk+-2.0 --cflags`",
    :link_args => "-fno-rtti -fno-exceptions -shared  -fPIC -L#{gecko_sdk}lib -L#{gecko_sdk}bin -Wl,-rpath-link,#{gecko_sdk}bin -lxpcomglue_s -lxpcom -lnspr4 -lrt ",
    :prebuilt => "firefox/prebuilt",
    :out  => "linux/Release/libwebdriver-firefox.so")

# There is no official 64 bit gecko SDK. Fall back to trying to use the one on 
# system, but be ready for this to fail. I have a Ubuntu machine, so that's 
# what I'm basing this on. I understand that's a Bad Idea

gecko_devels = FileList.new("/usr/lib/xulrunner-devel-1.9.*/sdk")
local_gecko = gecko_devels.empty? ? "" : gecko_devels.to_a[0] + "/" 

dll(:name => "libwebdriver_firefox_so64",
    :src  => FileList.new('common/src/cpp/webdriver-interactions/*_linux.cpp') + FileList.new('firefox/src/cpp/webdriver-firefox/native_events.cpp'),
    :arch => "amd64",
    :args => " -DXPCOM_GLUE  -DXPCOM_GLUE_USE_NSPR -fPIC -fshort-wchar -I common/src/cpp/webdriver-interactions -I #{local_gecko}include -I /usr/include/nspr `pkg-config gtk+-2.0 --cflags` ",
    :link_args => "-Wall -Os -L#{local_gecko}lib -L#{local_gecko}bin -Wl,-rpath-link,#{local_gecko}bin -lxpcomglue_s -lxpcom -lnspr4 -lrt `pkg-config gtk+-2.0 --libs` -fno-rtti -fno-exceptions -shared  -fPIC",
    :prebuilt => "firefox/prebuilt",
    :out  => "linux64/Release/libwebdriver-firefox.so")

task :libwebdriver_firefox => [:libwebdriver_firefox_so, :libwebdriver_firefox_so64]

task :'selenium-server_zip' do
  temp = "build/selenium-server_zip"
  mkdir_p temp
  sh "cd #{temp} && jar xf ../selenium-server.zip"
  rm_f "build/selenium-server.zip"
  Dir["#{temp}/webdriver-*.jar"].each { |file| rm_rf file }
  mv "#{temp}/selenium-server.jar", "#{temp}/selenium-server-#{version}.jar"
  sh "cd #{temp} && jar cMf ../selenium-server.zip *"
end

java_test(:name => "webdriver-selenium-server-test",
          :srcs => [
                     "remote/client/test/java/**/*.java",
                     "remote/server/test/java/org/openqa/selenium/remote/**/*.java",
                     "remote/server/test/java/org/openqa/selenium/server/**/*.java",
                     "remote/server/test/java/org/openqa/selenium/testworker/**/*.java"
                   ],
          :deps => [
                     :remote_client,
                     :remote_server,
                     :test_common,
                     "//remote/common:test",
                     "//firefox:test",
                     "remote/server/lib/buildtime/*.jar"
                   ])

dll(:name => "chrome_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "chome/src/cpp/**/*" ],
    :solution => "WebDriver.sln",
    :out  => 'Win32/Release/npchromedriver.dll',
    :prebuilt => "chrome/prebuilt")

java_test(:name => "webdriver-selenium-test",
          :srcs => [ "selenium/test/java/**/*.java" ],
          :resources => [
                     { "selenium/test/java/com/thoughtworks/selenium/testHelpers.js" => "com/thoughtworks/selenium/testHelpers.js" },
                   ],
          :deps => [
                     "//common:test",
                     "//htmlunit",
                     :'selenium-server-standalone',
                     "//third_party/java/easymock",
                     "//third_party/java/testng"
                   ],
          :main => "org.testng.TestNG",
          :args => "selenium/test/java/webdriver-selenium-suite.xml")

java_jar(:name => "selenium-core",
         :resources => [
           {"selenium/test/js/**" => "tests"},
           "common/src/js/core"
         ])

selenium_test(:name => "test_core_firefox",
              :srcs => [ "common/test/js/core/*.js" ],
              :deps => [
                "//remote/server",
                :"selenium-core"
              ],
              :browser => "*chrome" )

selenium_test(:name => "test_core_ie",
              :srcs => [ "common/test/js/core/*.js" ],
              :deps => [
                "//remote/server",
                :"selenium-core"
              ],
              :browser => "*iexploreproxy")

# Copy things around to make life easier when packaging IDE
file "build/ide/selenium" => "//common:js_core" do
  rm_rf "build/ide/selenium"
  mkdir_p "build/ide"
  puts Rake::Task["//common:js_core"].out
  cp_r Rake::Task["//common:js_core"].out + "/", "build/ide/selenium/"
  Dir["build/ide/selenium/**/.svn"].each { |file| rm_rf file }
end
task "rename_core" => "build/ide/selenium"

task :javadocs => [:common, :firefox, "//htmlunit", :jobbie, :remote, :support, :chrome, :selenium] do
  mkdir_p "build/javadoc"
   sourcepath = ""
   classpath = "third_party/java/hamcrest/hamcrest-all-1.1.jar"
   %w(common firefox jobbie htmlunit support remote/common remote/client chrome selenium).each do |m|
     sourcepath += ":#{m}/src/java"
   end
   cmd = "javadoc -d build/javadoc -sourcepath #{sourcepath} -classpath #{classpath} -subpackages org.openqa.selenium -subpackages com.thoughtworks"
   if (windows?)
     cmd = cmd.gsub(/\//, "\\").gsub(/:/, ";")
   end
   sh cmd
end

# Installs the webdriver python bindings using virtualenv for testing.
task :webdriver_py => [:chrome, :firefox, "//firefox:webdriver", :remote_client] do
  if python? then
    sh "virtualenv build/python", :verbose => true do |ok, res|
        if ! ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
        end
    end

    sh "build/python/bin/pip install simplejson py", :verbose => true

    # Copy browser extensions over to src so setup.py will pick them up. This is such a hack.
    cp 'build/chrome/chrome-extension.zip', "chrome/src/py/", :verbose => true
    cp 'build/firefox/webdriver.xpi', "firefox/src/py/", :verbose => true

    sh "build/python/bin/python setup.py build", :verbose => true

    # Remove the extensions we copied to src.
    rm "chrome/src/py/chrome-extension.zip", :verbose => true
    rm "firefox/src/py/webdriver.xpi", :verbose => true
  end
end

task :test_chrome_py => :webdriver_py do
  if python? then
    sh "virtualenv build/python", :verbose => true do |ok, res|
        if ! ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
        end
    end
    if File.exists?('build/python/bin/py.test')
        py_test = 'build/python/bin/py.test'
    else
        py_test = 'py.test'
    end
    test_dir = Dir.glob('build/lib**/selenium/chrome_tests').first
    sh py_test, test_dir, :verbose => true
  end
end

task :test_firefox_py => :webdriver_py do
  if python? then
    sh "virtualenv build/python", :verbose => true do |ok, res|
        if ! ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
        end
    end
    if File.exists?('build/python/bin/py.test')
        py_test = 'build/python/bin/py.test'
    else
        py_test = 'py.test'
    end
    test_dir = Dir.glob('build/lib**/selenium/firefox_tests').first
    sh py_test, test_dir, :verbose => true
  end
end

task :test_remote_py => [:webdriver_py, :'selenium-server-standalone'] do
  if python? then
    sh "virtualenv build/python", :verbose => true do |ok, res|
        if ! ok
            puts ""
            puts "PYTHON DEPENDENCY ERROR: Virtualenv not found."
            puts "Please run '[sudo] pip install virtualenv'"
            puts ""
        end
    end
    if File.exists?('build/python/bin/py.test')
        py_test = 'build/python/bin/py.test'
    else
        py_test = 'py.test'
    end
    test_dir = Dir.glob('build/lib**/selenium/remote_tests').first
    sh py_test, test_dir, :verbose => true
  end
end

task :test_selenium_py => [:'selenium-core', :'selenium-server-standalone'] do
    if python? then
        sh "python2.6 selenium/test/py/runtests.py", :verbose => true
    end
end

#### iPhone ####
task :iphone_server do
  sdk = iPhoneSDK?
  if sdk != nil then
    puts "Building iWebDriver iphone app"
    sh "cd iphone && xcodebuild -sdk #{sdk} ARCHS=i386 -target iWebDriver >/dev/null"
  else
    puts "XCode not found. Not building the iphone driver."
  end
end

# This does not depend on :iphone_server because the dependancy is specified in xcode
task :test_iphone_server do
  sdk = iPhoneSDK?
  if sdk != nil then
    sh "cd iphone && xcodebuild -sdk #{sdk} ARCHS=i386 -target Tests"
  else
    puts "XCode and/or iPhoneSDK not found. Not testing iphone_server."
  end
end

def version
  `svn info | grep Revision | awk -F: '{print $2}' | tr -d '[:space:]' | tr -d '\n'`
end

task :remote_release => [:remote] do
  mkdir_p "build/dist/remote_client"

  cp 'remote/build/webdriver-remote-client.jar', 'build/dist/remote_client'
  cp 'remote/build/webdriver-remote-common.jar', 'build/dist/remote_client'
  cp 'common/build/webdriver-common.jar', 'build/dist/remote_client'

  cp Dir.glob('remote/common/lib/runtime/*.jar'), 'build/dist/remote_client'
  cp Dir.glob('remote/client/lib/runtime/*.jar'), 'build/dist/remote_client'
  cp 'third_party/java/google-collect/google-collect-1.0.jar', 'build/dist/remote_client'

  sh "cd build/dist && zip -r webdriver-remote-client-#{version}.zip remote_client/*"
  rm_rf "build/dist/remote_client"

  mkdir_p "build/dist/remote_server"

  cp 'remote/build/webdriver-remote-server.jar', 'build/dist/remote_server'
  cp 'remote/build/webdriver-remote-common.jar', 'build/dist/remote_server'
  cp 'common/build/webdriver-common.jar', 'build/dist/remote_server'

  cp Dir.glob('remote/common/lib/runtime/*.jar'), 'build/dist/remote_server'
  cp Dir.glob('remote/server/lib/runtime/*.jar'), 'build/dist/remote_server'
  cp 'third_party/java/google-collect/google-collect-1.0.jar', 'build/dist/remote_server'

  rm Dir.glob('build/dist/remote_server/servlet*.jar')

  sh "cd build/dist && zip -r webdriver-remote-server-#{version}.zip remote_server/*"
  rm_rf "build/dist/remote_server"
end

task :release => [:'all_zip', :'selenium-server-standalone', :'selenium-server_zip'] do
  cp "build/selenium-server-standalone.jar", "build/selenium-server-standalone-#{version}.jar"
  cp "build/selenium-java.zip", "build/selenium-java-#{version}.zip"
  cp "build/selenium-server.zip", "build/selenium-server-#{version}.zip"
end

task :'selenium-java_zip' do
  temp = "build/selenium-java_zip"
  mkdir_p temp
  sh "cd #{temp} && jar xf ../selenium-java.zip"
  rm_f "build/selenium-java.zip"
  Dir["#{temp}/webdriver-*.jar"].each { |file| rm_rf file }
  mv "#{temp}/selenium-java.jar", "#{temp}/selenium-java-#{version}.jar"
  sh "cd #{temp} && jar cMf ../selenium-java.zip *"
end

desc 'Install prerequisites for the build. You may need to run this as root or Administrator'
task :setup do
  sh "gem install Antwrap yard"
  
  if python?
    sh "easy_install virtualenv"
  end
end

desc 'Build the selenium client jars'
task 'selenium-java' => 'build/selenium-java.jar'
file 'build/selenium-java.jar' => '//remote/client:combined:project' do
  cp 'build/remote/client/combined-nodeps.jar', 'build/selenium-java.jar'
end

desc 'Build the standalone server'
task 'selenium-server-standalone' => 'build/selenium-server-standalone.jar'
file 'build/selenium-server-standalone.jar' => '//remote/server:server:uber' do
  cp 'build/remote/server/server-standalone.jar', 'build/selenium-server-standalone.jar'
end

desc 'Build and package Selenium IDE'
task :release_ide  => [:ide] do
  cp 'build/ide/selenium-ide.xpi', "build/ide/selenium-ide-#{ide_version}.xpi"
end
