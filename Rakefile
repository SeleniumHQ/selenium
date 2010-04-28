require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

require 'rake-tasks/task-gen'
require 'rake-tasks/checks'
require 'rake-tasks/dotnet'
require 'rake-tasks/zip'
require 'rake-tasks/c'
require 'rake-tasks/java'
require 'rake-tasks/iphone'
require 'rake-tasks/selenium'
require 'rake-tasks/mozilla'
require 'rake-tasks/ruby'
require 'rake-tasks/se-ide'
require 'rake-tasks/ie_code_generator'

version = "2.0a4"

task :default => [:test]

# TODO(simon): Shatter the build file into subdirectories, then remove these
task :all => [:'selenium-java']
task :all_zip => [:'selenium-java_zip']
task :chrome => [:'webdriver-chrome']
task :common => [:'webdriver-common']
task :htmlunit => [:'webdriver-htmlunit']
task :ie => [:'webdriver-ie']
task :firefox => [:'webdriver-firefox']
task :jobbie => [:ie]
task :jsapi => :'webdriver-jsapi'
task :remote => [:remote_common, :remote_server, :remote_client]
task :remote_common => [:'webdriver-remote-common']
task :remote_client => [:'webdriver-remote-client']
task :remote_server => [:'webdriver-remote-server']
task :selenium => [:'webdriver-selenium']
task :support => [:'webdriver-support']
task :iphone_client => [:'webdriver-iphone-client']
task :iphone => [:iphone_server, :iphone_client]

task :test_common => [:'webdriver-common-test']
task :test_chrome => [:'webdriver-chrome-test']
task :test_htmlunit => [:'webdriver-htmlunit-test']
task :test_ie => [:'webdriver-ie-test']
task :test_jobbie => [:test_ie]
task :test_jsapi => :'webdriver-jsapi-test'
task :test_firefox => [:'webdriver-firefox-test']
task :test_remote => [:'webdriver-selenium-server-test']
task :test_selenium => [:'webdriver-selenium-server-test', :'webdriver-selenium-test', :'webdriver-selenese-test']
task :test_support => [:'webdriver-support-test']
task :test_iphone_client => [:'webdriver-iphone-client-test']
task :test_iphone => [:test_iphone_server, :test_iphone_client]

task :test_core => [:'test_core_firefox']
if (windows?)
  task :test_core => [:'test_core_ie']
end

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
  rm_rf 'build/', :verbose => false
  rm_rf 'iphone/build/', :verbose => false
end

java_jar(:name => "webdriver-chrome",
    :srcs  => [ "chrome/src/java/**/*.java" ],
    :deps => [
               :common,
               :remote_client,
               :chrome_extension,
               "remote/common/lib/runtime/*.jar"
             ],
    :resources => [ :'chrome_extension' ])

java_test(:name => "webdriver-chrome-test",
          :srcs  => [ "chrome/test/java/**/*.java" ],
          :deps => [
                     :chrome,
                     :'webdriver-remote-common-test'
                   ])

java_jar(:name => 'webdriver-common',
         :srcs => [ 'common/src/java/**/*.java' ])

java_jar(:name => 'webdriver-common-test',
         :srcs  => [ "common/test/java/**/*.java" ],
         :resources => [ "common/test/java/org/openqa/selenium/messages.properties" => "org/openqa/selenium/messages.properties" ],
         :deps => [
           :'webdriver-common',
           "common/lib/buildtime/*.jar",
           "third_party/java/junit/junit-dep-4.8.1.jar"
         ])

java_jar(:name => 'webdriver-htmlunit',
         :srcs => [ 'htmlunit/src/java/**/*.java'],
         :deps => [
           :'webdriver-common',
           'htmlunit/lib/runtime/*.jar',
           'third_party/java/htmlunit/htmlunit-2.7.jar',
           'third_party/java/htmlunit/htmlunit-core-js-2.7.jar',
           'third_party/java/nekohtml/nekohtml-1.9.14.jar',
           'third_party/java/commons-httpclient/commons-httpclient-3.1.jar',
           'third_party/java/commons-codec/commons-codec-1.4.jar',
           'third_party/java/commons-collections/commons-collections-3.2.1.jar',
           'third_party/java/commons-lang/commons-lang-2.4.jar',
           'third_party/java/commons-logging/commons-logging-1.1.1.jar',
           'third_party/java/commons-io/commons-io-1.4.jar'
          ])

java_test(:name => 'webdriver-htmlunit-test',
          :srcs  => [ "htmlunit/test/java/**/*.java" ],
          :deps => [
            :htmlunit,
            :'webdriver-common-test',
          ])

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

java_jar(:name => "webdriver-ie",
    :srcs  => [ "jobbie/src/java/**/*.java" ],
    :deps => [
               :'webdriver-common',
               "jobbie/lib/runtime/*.jar",
               :ie_result_type_java,
               :ie_result_type_cpp
             ],
    :resources => [
               {:ie_win32_dll => "x86/InternetExplorerDriver.dll"},
               {:ie_x64_dll => "amd64/InternetExplorerDriver.dll"},
             ])

java_test(:name => "webdriver-ie-test",
          :srcs  => [ "jobbie/test/java/**/*.java" ],
          :deps => [
                     :ie,
                     :test_common
                   ],
          :run  => windows?)

xpt(:name => "events_xpt",
    :src  => [ "firefox/src/cpp/webdriver-firefox/nsINativeEvents.idl" ],
    :prebuilt => "firefox/prebuilt",
    :out  => "nsINativeEvents.xpt")

xpt(:name => "responseHandler_xpt",
    :src => [ "firefox/src/extension/idl/nsIResponseHandler.idl" ],
    :prebuilt => "firefox/prebuilt",
    :out => "nsIResponseHandler.xpt")

xpt(:name => "commandProcessor_xpt",
    :src => [ "firefox/src/extension/idl/nsICommandProcessor.idl" ],
    :deps => [ :responseHandler_xpt ],
    :prebuilt => "firefox/prebuilt",
    :out => "nsICommandProcessor.xpt")

xpi(:name => "firefox_xpi",
    :srcs  => [ "firefox/src/extension/**" ],
    :deps => [
               :firefox_dll,
               :libwebdriver_firefox,
             ],
    :resources => [
                    { "firefox/src/extension/components/*.js" => "components/" },
                    { "common/src/js/extension/*.js" => "content/" },
                    { :commandProcessor_xpt => "components/" },
                    { :events_xpt => "components/" },
                    { :responseHandler_xpt => "components/" },
                    { :firefox_dll => "platform/WINNT_x86-msvc/components/webdriver-firefox.dll" },
                    { :libwebdriver_firefox_so => "platform/Linux_x86-gcc3/components/libwebdriver-firefox.so" },
                    { :libwebdriver_firefox_so64 => "platform/Linux_x86_64-gcc3/components/libwebdriver-firefox.so" },
                  ],
    :out  => "webdriver-extension.zip")

dll(:name => "firefox_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/webdriver-firefox/**/*" ],
    :solution => "WebDriver.sln",
    :out  => "Win32/Release/webdriver-firefox.dll",
    :deps  => [ 
                :events_xpt,
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

java_jar(:name => "webdriver-firefox",
    :srcs  => [ "firefox/src/java/**/*.java" ],
    :deps => [
               :common,
               :remote_client,
               :remote_common,
               :firefox_xpi,
               :libnoblur,
               "third_party/java/json/json-20080701.jar"
             ],
    :resources => [
                    :firefox_xpi,
                    { "linux/Release/x_ignore_nofocus.so" => "x86/x_ignore_nofocus.so" },
                    { "linux64/Release/x_ignore_nofocus.so" => "amd64/x_ignore_nofocus.so" }
                  ])

java_test(:name => "webdriver-firefox-test",
          :srcs  => [ "firefox/test/java/**/*.java" ],
          :deps => [
                     :'webdriver-firefox',
                     :'webdriver-common-test',
                   ])

java_test(:name => "webdriver-single-testsuite",
          :srcs  => [ "common/test/java/org/openqa/selenium/SingleTestSuite.java"],
          :deps => [
                     :'webdriver-ie',
                     :'webdriver-common-test',
                   ])

java_jar(:name => "webdriver-support",
    :srcs  => [ "support/src/java/**/*.java" ],
    :deps => [
               :common,
               "support/lib/runtime/*.jar",
               "third_party/java/google-collect-1.0.jar",
             ])

java_test(:name => "webdriver-support-test",
          :srcs  => [ "support/test/java/**/*.java" ],
          :deps => [
                     :support,
                     :test_common,
                   ])

java_jar(:name => "webdriver-remote-common",
         :srcs => [ "remote/common/src/java/**/*.java" ],
         :deps => [
               :common,
               "third_party/java/commons-codec/commons-codec-1.4.jar",
               "third_party/java/google-collect-1.0.jar",
               "third_party/java/json/json-20080701.jar"
             ])

java_jar(:name => "webdriver-remote-client",
    :srcs  => [ "remote/client/src/java/**/*.java" ],
    :deps => [
               :common,
               :'webdriver-remote-common',
               'third_party/java/commons-httpclient/commons-httpclient-3.1.jar',
               'third_party/java/commons-collections/commons-collections-3.2.1.jar',
               'third_party/java/commons-lang/commons-lang-2.4.jar',
               'third_party/java/commons-logging/commons-logging-1.1.1.jar',
               'third_party/java/commons-io/commons-io-1.4.jar'
             ])

xpt(:name => "ide-auto-complete",
    :src  => [ "ide/src/extension/idl/SeleniumIDEGenericAutoCompleteSearch.idl" ],
    :prebuilt => "ide/prebuilt",
    :out  => "SeleniumIDEGenericAutoCompleteSearch.xpt")

xpi(:name => "ide",
    :srcs => [],
    :deps => [],
    :resources => [
                    { "ide/src/extension/chrome/" => "/" },
                    { "common/src/js/core/*" => "chrome/content/selenium/"},
                    { "ide/src/extension/content" => "chrome/" },
                    { "ide/src/extension/skin" => "chrome/" },
                    { "ide/src/extension/locale" => "chrome/" },
                    { :"ide-auto-complete" => "components/" },
                    { "ide/src/extension/components/SeleniumIDEGenericAutoCompleteSearch.js" => "components/" },
                    { "ide/src/extension/install.rdf" => "/" },
                    { "ide/src/extension/chrome.manifest.production" => "/chrome.manifest" },
                    { "common/src/js/core/scripts/selenium-testrunner.js" => "content-files/" }
                  ],
    :out => "selenium-ide-1.0.7-SNAPSHOT.xpi")

java_jar(:name => "selenium-common-js",
    :resources => [
      "common/src/js/core",
      "common/src/js/jsunit",
      {
        "common/src/js/core/TestRunner.html" => "core/TestRunner.hta",
        "common/src/js/core/RemoteRunner.html" => "core/RemoteRunner.hta",
      }])

java_jar(:name => "webdriver-remote-server",
    :srcs  => [ "remote/server/src/java/**/*.java" ],
    :resources => [
      {
        "remote/server/src/java/org/openqa/jetty/http/mime.properties" => "org/openqa/jetty/http/mime.properties",
        "remote/server/src/java/org/openqa/jetty/http/encoding.properties" => "org/openqa/jetty/http/encoding.properties",
      },
      "remote/server/src/java/customProfileDir*",
      "remote/server/src/java/cybervillains",
      "remote/server/src/java/hudsuckr",
      "remote/server/src/java/killableprocess",
      "remote/server/src/java/konqueror",
      "remote/server/src/java/opera",
      "remote/server/src/java/sslSupport",
      "remote/server/src/java/VERSION.txt",
      "common/src/js/core",
      "common/src/js/jsunit",
      {
        "common/src/js/core/TestRunner.html" => "core/TestRunner.hta",
        "common/src/js/core/RemoteRunner.html" => "core/RemoteRunner.hta",
      },
    ],
    :deps => [
               :chrome,
               :htmlunit,
               :ie,
               :firefox,
               :remote_common,
               :selenium,
               :support,
               "remote/server/lib/runtime/*.jar"
             ])

java_uberjar(:name => "selenium-server",
             :deps => [ "webdriver-remote-server", :selenium ],
             :exclude => [
                           "META-INF/BCKEY.*"
                         ],
             :main => "org.openqa.selenium.server.SeleniumServer",
             :no_libs => true)

task :'selenium-server_zip' do
  temp = "build/selenium-server_zip"
  mkdir_p temp
  sh "cd #{temp} && jar xf ../selenium-server.zip", :verbose => false
  rm_f "build/selenium-server.zip"
  Dir["#{temp}/webdriver-*.jar"].each { |file| rm_rf file }
  mv "#{temp}/selenium-server.jar", "#{temp}/selenium-server-#{version}.jar"
  sh "cd #{temp} && jar cMf ../selenium-server.zip *", :verbose => false
end

java_uberjar(:name => "selenium-server-standalone",
             :deps => [ :'selenium-server' ],
             :standalone => true,
             :exclude => [
                           "META-INF/BCKEY.*"
                         ],
             :main => "org.openqa.selenium.server.SeleniumServer")

java_jar(:name => "webdriver-remote-common-test",
          :srcs => [ "remote/common/test/java/**/*.java" ],
          :deps => [
                     :remote_common,
                     :test_common
                   ])

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
                     :'webdriver-remote-common-test',
                     "remote/server/lib/buildtime/*.jar"
                   ])

java_war(:name => "webdriver-remote-servlet",
         :deps => [ :'webdriver-remote-server' ],
         :resources => [
                         "remote/server/src/web/**"
                       ]
         )

dll(:name => "chrome_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "chome/src/cpp/**/*" ],
    :solution => "WebDriver.sln",
    :out  => 'Win32/Release/npchromedriver.dll',
    :prebuilt => "chrome/prebuilt")

xpi(:name => "chrome_extension",
    :srcs  => [ "chrome/src/extension/**" ],
    :deps => [ :chrome_dll ],
    :resources => [
                     { :chrome_dll => "npchromedriver.dll" }
                  ],
    :out => "chrome-extension.zip")

java_jar(:name => "webdriver-selenium",
    :srcs  => [ "selenium/src/java/**/*.java" ],
    :deps => [
               :chrome,
               :ie,
               :firefox,
               :remote_client,
               :support,
               "selenium/lib/runtime/*.jar"
             ],
    :resources => [
                    { "selenium/src/java/org/openqa/selenium/internal/seleniumemulation/injectableSelenium.js" => "org/openqa/selenium/internal/seleniumemulation/injectableSelenium.js" },
                    { "selenium/src/java/org/openqa/selenium/internal/seleniumemulation/htmlutils.js" => "org/openqa/selenium/internal/seleniumemulation/htmlutils.js" }
                  ])

java_test(:name => "webdriver-selenium-test",
          :srcs => [ "selenium/test/java/**/*.java" ],
          :resources => [
                     { "selenium/test/java/com/thoughtworks/selenium/testHelpers.js" => "com/thoughtworks/selenium/testHelpers.js" },
                   ],
          :deps => [
                     :test_common,
                     :htmlunit,
                     :'selenium-server-standalone',
                     "selenium/lib/buildtime/*.jar",
                   ],
          :main => "org.testng.TestNG",
          :args => "selenium/test/java/webdriver-selenium-suite.xml")

java_test(:name => "webdriver-selenese-test",
          :srcs => [ "selenium/test/java/**/*.java" ],
          :deps => [
                     :test_common,
                     :htmlunit,
                     :'selenium-server-standalone',
                     "selenium/lib/buildtime/*.jar",
                   ])

java_jar(:name => "selenium-core",
         :resources => [
           {"selenium/test/js/**" => "tests"},
           "common/src/js/core"
         ])

selenium_test(:name => "test_core_firefox",
              :srcs => [ "common/test/js/core/*.js" ],
              :deps => [
                :"webdriver-remote-server",
                :"selenium-core"
              ],
              :browser => "*chrome" )

selenium_test(:name => "test_core_ie",
              :srcs => [ "common/test/js/core/*.js" ],
              :deps => [
                :"webdriver-remote-server",
                :"selenium-core"
              ],
              :browser => "*iexploreproxy")

java_jar(:name => "webdriver-jsapi",
    :srcs => [ "remote/server/test/java/**/JsApi*.java" ],
    :deps => [ :firefox, :test_common ])

# Comprehensive test suite for testing the JS API in isolation against all of
# the supported browsers. This should be included in the :test task; for that we
# defer to the suites for the individual drivers.
java_test(:name => "webdriver-jsapi-test",
          :srcs => [ "jsapi/test/java/**/*.java" ],
          :deps => [ :firefox, :chrome, :test_common ])

# Simply starts the Jetty6AppServer for manually testing the JS API tests.
# After starting, open a browser to http://localhost:$PORT/js/test, where $PORT
# is the port the server was started on.
java_test(:name => "debug_jsapi",
          :deps => [ :firefox, :test_common ],
          :main => "org.openqa.selenium.environment.webserver.Jetty6AppServer")

task :javadocs => [:common, :firefox, :htmlunit, :jobbie, :remote, :support, :chrome, :selenium] do
  mkdir_p "build/javadoc", :verbose => false
   sourcepath = ""
   classpath = "support/lib/runtime/hamcrest-all-1.1.jar"
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
task :webdriver_py => [:chrome, :firefox, :firefox_xpi, :remote_client] do
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
    cp 'build/chrome-extension.zip', "chrome/src/py/", :verbose => true
    cp 'build/webdriver-extension.zip', "firefox/src/py/", :verbose => true

    sh "build/python/bin/python setup.py build", :verbose => true

    # Remove the extensions we copied to src.
    rm "chrome/src/py/chrome-extension.zip", :verbose => true
    rm "firefox/src/py/webdriver-extension.zip", :verbose => true
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

# Place-holder tasks
java_jar(:name => "webdriver-iphone-client",
         :srcs  => [ "iphone/src/java/**/*.java" ],
         :deps => [
                    :common,
                    :remote_common,
                    :remote_client
                  ])

iphone_test(:name => "webdriver-iphone-client-test",
            :srcs => [ "iphone/test/java/**/*.java" ],
            :deps => [
                       :test_common,
                       :iphone_server,
                       :iphone_client
                     ])


#### iPhone ####
task :iphone_server do
  sdk = iPhoneSDK?
  if sdk != nil then
    puts "Building iWebDriver iphone app"
    sh "cd iphone && xcodebuild -sdk #{sdk} ARCHS=i386 -target iWebDriver >/dev/null", :verbose => false
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
  mkdir_p "build/dist/remote_client", :verbose => false

  cp 'remote/build/webdriver-remote-client.jar', 'build/dist/remote_client'
  cp 'remote/build/webdriver-remote-common.jar', 'build/dist/remote_client'
  cp 'common/build/webdriver-common.jar', 'build/dist/remote_client'

  cp Dir.glob('remote/common/lib/runtime/*.jar'), 'build/dist/remote_client'
  cp Dir.glob('remote/client/lib/runtime/*.jar'), 'build/dist/remote_client'
  cp 'third_party/java/google-collect-1.0.jar', 'build/dist/remote_client'

  sh "cd build/dist && zip -r webdriver-remote-client-#{version}.zip remote_client/*"
  rm_rf "build/dist/remote_client", :verbose => false

  mkdir_p "build/dist/remote_server", :verbose => false

  cp 'remote/build/webdriver-remote-server.jar', 'build/dist/remote_server'
  cp 'remote/build/webdriver-remote-common.jar', 'build/dist/remote_server'
  cp 'common/build/webdriver-common.jar', 'build/dist/remote_server'

  cp Dir.glob('remote/common/lib/runtime/*.jar'), 'build/dist/remote_server'
  cp Dir.glob('remote/server/lib/runtime/*.jar'), 'build/dist/remote_server'
  cp 'third_party/java/google-collect-1.0.jar', 'build/dist/remote_server'

  rm Dir.glob('build/dist/remote_server/servlet*.jar')

  sh "cd build/dist && zip -r webdriver-remote-server-#{version}.zip remote_server/*"
  rm_rf "build/dist/remote_server", :verbose => false
end

java_uberjar(:name => "selenium-java",
             :deps => [
                    :chrome,
                    :htmlunit,
                    :ie,
                    :firefox,
                    :remote_client,
                    :selenium,
                    :support
                  ],
              :no_libs => true)

task :release => [:'all_zip', :'selenium-server-standalone', :'selenium-server_zip'] do
  cp "build/selenium-server-standalone.jar", "build/selenium-server-standalone-#{version}.jar"
  cp "build/selenium-java.zip", "build/selenium-java-#{version}.zip"
  cp "build/selenium-server.zip", "build/selenium-server-#{version}.zip"
end

task :'selenium-java_zip' do
  temp = "build/selenium-java_zip"
  mkdir_p temp
  sh "cd #{temp} && jar xf ../selenium-java.zip", :verbose => false
  rm_f "build/selenium-java.zip"
  Dir["#{temp}/webdriver-*.jar"].each { |file| rm_rf file }
  mv "#{temp}/selenium-java.jar", "#{temp}/selenium-java-#{version}.jar"
  sh "cd #{temp} && jar cMf ../selenium-java.zip *", :verbose => false
end

