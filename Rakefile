require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

require 'rake-tasks/checks.rb'
require 'rake-tasks/zip.rb'
require 'rake-tasks/c.rb'
require 'rake-tasks/java.rb'
require 'rake-tasks/mozilla.rb'

task :default => [:test]

# TODO(simon): All "outs" should be arrays

jar(:name => "common",
    :src  => [ "common/src/java/**/*.java" ],
    :zip  => true,
    :out  => "webdriver-common.jar")

jar(:name => "test_common",
    :src  => [ "common/test/java/**/*.java" ],
    :deps => [
               :common,
               "common/lib/buildtime/*.jar"
             ],
    :resources => [ "common/test/java/org/openqa/selenium/messages.properties" => "org/openqa/selenium/messages.properties" ],
    :out  => "webdriver-common-test.jar")

jar(:name => "htmlunit",
    :src  => [ "htmlunit/src/java/**/*.java" ],
    :deps => [
               :common,
               "htmlunit/lib/runtime/*.jar"
             ],
    :zip  => true,
    :out  => "webdriver-htmlunit.jar")

test_java(:name => "test_htmlunit",
          :src  => [ "htmlunit/test/java/**/*.java" ],
          :deps => [
                     :htmlunit,
                     :test_common,
                   ],
          :out  => "webdriver-htmlunit-test.jar")

dll(:name => "ie_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/InternetExplorerDriver/**/*" ],
    :solution => "WebDriver.sln",
    :out  => [ "Win32/Release/InternetExplorerDriver.dll", "x64/Release/InternetExplorerDriver.dll" ],
    :prebuilt => "jobbie/prebuilt",
    :spoof => true)  # Dump "spoof" files in the right place if you can't build

jar(:name => "ie",
    :src  => [ "jobbie/src/java/**/*.java" ],
    :deps => [
               :common,
               :ie_dll,
               "jobbie/lib/runtime/*.jar"
             ],
    :resources => [
               {"Win32/Release/InternetExplorerDriver.dll" => "x86/InternetExplorerDriver.dll"},
               {"x64/Release/InternetExplorerDriver.dll" => "amd64/InternetExplorerDriver.dll"},
             ],
    :zip  => true,
    :out  => "webdriver-ie.jar")
task :jobbie => :ie

test_java(:name => "test_ie",
          :src  => [ "jobbie/test/java/**/*.java" ],
          :deps => [
                     :ie,
                     :test_common
                   ],
          :run  => windows?,
          :out  => "webdriver-ie-test.jar")
task :test_jobbie => :test_ie

xpt(:name => "events_xpt",
    :src  => [ "firefox/src/cpp/webdriver-firefox/nsINativeEvents.idl" ],
    :prebuilt => "firefox/prebuilt",
    :out  => "nsINativeEvents.xpt")

xpt(:name => "commandProcessor_xpt",
    :src => [ "firefox/src/extension/components/nsICommandProcessor.idl" ],
    :prebuilt => "firefox/prebuilt",
    :out => "nsICommandProcessor.xpt")

task :clean do
  rm_rf 'build/', :verbose => false
end

xpi(:name => "firefox_xpi",
    :src  => [ "firefox/src/extension" ],
    :deps => [
               :commandProcessor_xpt,
               :events_xpt,
               :firefox_dll,
               :libwebdriver_firefox,
             ],
    :resources => [
                    { "nsICommandProcessor.xpt" => "components/nsICommandProcessor.xpt" },
                    { "nsINativeEvents.xpt" => "components/nsINativeEvents.xpt" },
                    { "Win32/Release/webdriver-firefox.dll" => "platform/WINNT_x86-msvc/components/webdriver-firefox.dll" },
                    { "linux/Release/libwebdriver-firefox.so" => "platform/Linux_x86-gcc3/components/libwebdriver-firefox.so" },
                    { "linux64/Release/libwebdriver-firefox.so" => "platform/Linux_x86_64-gcc3/components/libwebdriver-firefox.so" },
                  ],
    :out  => "webdriver-extension.zip")

dll(:name => "firefox_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/webdriver-firefox/**/*" ],
    :solution => "WebDriver.sln",
    :out  => [ "Win32/Release/webdriver-firefox.dll" ],
    :deps  => [ 
                :events_xpt,
              ],
    :prebuilt => "firefox/prebuilt",
    :spoof => true)  # Dump "spoof" files in the right place if you can't build

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
    :link_args => "-fno-rtti -fno-exceptions -shared  -fPIC -L/usr/lib32 -L#{gecko_sdk}lib -L#{gecko_sdk}bin -Wl,-rpath-link,#{gecko_sdk}bin -lxpcomglue_s -lxpcom -lnspr4 -lrt " + "`pkg-config gtk+-2.0 --libs`",
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

jar(:name => "firefox",
    :src  => [ "firefox/src/java/**/*.java" ],
    :deps => [
               :common,
               :firefox_xpi,
               :libnoblur,
               "firefox/lib/runtime/*.jar"
             ],
    :resources => [ 
                    "webdriver-extension.zip",
                    { "linux/Release/x_ignore_nofocus.so" => "x86/x_ignore_nofocus.so" },
                    { "linux64/Release/x_ignore_nofocus.so" => "amd64/x_ignore_nofocus.so" }
                  ],
    :zip  => true,
    :out  => "webdriver-firefox.jar")

test_java(:name => "test_firefox",
          :src  => [ "firefox/test/java/**/*.java" ],
          :deps => [
                     :firefox,
                     :test_common,
                   ],
          :out  => "webdriver-firefox-test.jar")

jar(:name => "support",
    :src  => [ "support/src/java/**/*.java" ],
    :deps => [
               :common,
               "support/lib/runtime/*.jar"
             ],
    :zip  => true,
    :out  => "webdriver-support.jar")

test_java(:name => "test_support",
          :src  => [ "support/test/java/**/*.java" ],
          :deps => [
                     :support,
                     :test_common,
                   ],
          :out  => "webdriver-support-test.jar")

jar(:name => "remote_client",
    :src  => [ "remote/client/src/java/**/*.java", "remote/common/src/java/**/*.java" ],
    :deps => [
               :common,
               "remote/common/lib/runtime/*.jar",
               "remote/client/lib/runtime/*.jar",
             ],
    :zip  => true,
    :out  => "webdriver-remote-client.jar")

jar(:name => "remote_server",
    :src  => [ "remote/server/src/java/**/*.java", "remote/common/src/java/**/*.java" ],
    :deps => [
               :htmlunit,
               :ie,
               :firefox,
               :support,
               "remote/common/lib/runtime/*.jar",
               "remote/server/lib/runtime/*.jar"
             ],
    :out  => "webdriver-remote-server.jar")

test_java(:name => "test_remote",
          :src  => [
                     "remote/common/test/java/**/*.java",
                     "remote/client/test/java/**/*.java",
                     "remote/server/test/java/**/*.java"
                   ],
          :deps => [
                     :test_common,
                     :remote_client,
                     :remote_server
                   ],
          :out => "webdriver-remote-test.jar")

task :remote => [:remote_server, :remote_client]

dll(:name => "chrome_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "chome/src/cpp/**/*" ],
    :solution => "WebDriver.sln",
    :out  => [ "Win32/Release/npchromedriver.dll", "x64/Release/npchromedriver.dll" ],
    :prebuilt => "chrome/prebuilt")

xpi(:name => "chrome_extension",
    :src  => [ "chrome/src/extension" ],
    :deps => [ :chrome_dll ],
    :resources => [
                     { "Win32/Release/npchromedriver.dll" => "npchromedriver.dll" }
                  ],
    :out => "chrome-extension.zip")

    jar(:name => "chrome",
    :src  => [ "chrome/src/java/**/*.java" ],
    :deps => [
               :common,
               :remote_client,
               :chrome_extension,
               "remote/common/lib/runtime/*.jar"
             ],
    :resources => [ "chrome-extension.zip" ],
    :zip  => true,
    :out  => "webdriver-chrome.jar")

test_java(:name => "test_chrome",
          :src  => [ "chrome/test/java/**/*.java" ],
          :deps => [
                     :chrome,
                     :test_common,
                     :test_remote
                   ],
          :out  => "webdriver-chrome-test.jar")

jar(:name => "selenium",
    :src  => [ "selenium/src/java/**/*.java" ],
    :deps => [
               :ie,
               :firefox,
               :remote_client,
               :support,
               "selenium/lib/runtime/*.jar"
             ],
    :resources => [
                    { "selenium/src/java/org/openqa/selenium/internal/injectableSelenium.js", "org/openqa/selenium/internal/injectableSelenium.js" },
                    { "selenium/src/java/org/openqa/selenium/internal/htmlutils.js", "org/openqa/selenium/internal/htmlutils.js" }
                  ],
    :zip  => true,
    :out => "webdriver-selenium.jar" )

test_java(:name => "test_selenium",
          :src  => [ "selenium/test/java/**/*.java" ],
          :deps => [
                     :test_common,
                     :htmlunit,
                     :selenium,
                     "selenium/lib/buildtime/*.jar",
                   ],
          :main => "org.testng.TestNG",
          :args => "selenium/test/java/webdriver-selenium-suite.xml",
          :out  => "webdriver-selenium-test.jar")

test_java(:name => "test_selenesewd",
          :src  => [ "selenium/test/java/**/*.java" ],
          :deps => [
                     :test_common,
                     :htmlunit,
                     :selenium,
                     "selenium/lib/buildtime/*.jar",
                   ],
          :out  => "webdriver-selenese-test.jar")

task :test_selenium => :test_selenesewd

jar(:name => "jsapi",
    :src => [ "remote/server/test/java/**/JsApi*.java" ],
    :deps => [ :firefox, :test_common ],
    :out => "webdriver-jsapi.jar")

test_java(:name => "test_jsapi",
          :src => [ "remote/server/test/java/**/JsApi*.java" ],
          :deps => [ :jsapi ],
          :out  => "webdriver-jsapi-test.jar")

task :build => [:common, :htmlunit, :firefox, :ie, :iphone, :support, :remote, :chrome, :selenium]
task :test => [:test_htmlunit, :test_firefox, :test_ie, :test_iphone, :test_support, :test_remote, :test_jsapi, :test_chrome, :test_selenium]

task :javadocs => [:common, :firefox, :htmlunit, :jobbie, :remote, :support, :chrome] do
  mkdir_p "build/javadoc", :verbose => false
   sourcepath = ""
   classpath = "support/lib/runtime/hamcrest-all-1.1.jar"
   %w(common firefox jobbie htmlunit support remote/common remote/client chrome).each do |m|
     sourcepath += ":#{m}/src/java"
   end
   cmd = "javadoc -d build/javadoc -sourcepath #{sourcepath} -classpath #{classpath} -subpackages org.openqa.selenium"
   if (windows?) 
     cmd = cmd.gsub(/\//, "\\").gsub(/:/, ";") 
   end
   sh cmd
end

task :test_firefox_py => :test_firefox do
  if python? then
    sh "python py_test.py", :verbose => true
  end
end

task :iphone => [:iphone_server, :iphone_client]

# Place-holder tasks
task :iphone_client
task :test_iphone_client
task :test_iphone => [:test_iphone_server, :test_iphone_client, :remote_client]

#### iPhone ####
task :iphone_server => FileList['iphone/src/objc/**'] do
  if iPhoneSDKPresent? then
    puts "Building iWebDriver iphone app"
    sh "cd iphone && xcodebuild -sdk iphonesimulator2.2 ARCHS=i386 -target iWebDriver >/dev/null", :verbose => false
  else
    puts "XCode not found. Not building the iphone driver."
  end
end

# This does not depend on :iphone_server because the dependancy is specified in xcode
task :test_iphone_server do
  if iPhoneSDKPresent? then
    sh "cd iphone && xcodebuild -sdk iphonesimulator2.2 ARCHS=i386 -target Tests"
  else
    puts "XCode not found. Not testing the iphone driver."
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

  sh "cd build/dist && zip -r webdriver-remote-client-#{version}.zip remote_client/*"
  rm_rf "build/dist/remote_client"

  mkdir_p "build/dist/remote_server", :verbose => false

  cp 'remote/build/webdriver-remote-server.jar', 'build/dist/remote_server'
  cp 'remote/build/webdriver-remote-common.jar', 'build/dist/remote_server'
  cp 'common/build/webdriver-common.jar', 'build/dist/remote_server'

  cp Dir.glob('remote/common/lib/runtime/*.jar'), 'build/dist/remote_server'
  cp Dir.glob('remote/server/lib/runtime/*.jar'), 'build/dist/remote_server'

  rm Dir.glob('build/dist/remote_server/servlet*.jar')

  sh "cd build/dist && zip -r webdriver-remote-server-#{version}.zip remote_server/*"
  rm_rf "build/dist/remote_server"
end

# TODO(simon): This should pick up the "out" files from the deps
uber_jar(:name => "all",
         :src  => [
                    "build/webdriver-common.jar",
                    "build/webdriver-chrome.jar",
                    "build/webdriver-htmlunit.jar",
                    "build/webdriver-firefox.jar",
                    "build/webdriver-ie.jar",
                    "build/webdriver-remote-client.jar",
                    "build/webdriver-support.jar",
                  ],
         :deps => [
                    :common,
                    :htmlunit,
                    :ie,
                    :firefox,
                    :remote_client,
                    :chrome,
                    :support
                  ],
         :out  => "webdriver-all.jar")

zip(:name => "all_zip",
    :src  => [
               "build/webdriver-all.jar",
             ] +
             FileList.new("htmlunit/lib/runtime/*.jar") +
             FileList.new("firefox/lib/runtime/*.jar") +
             FileList.new("jobbie/lib/runtime/*.jar") +
             FileList.new("remote/client/lib/runtime/*.jar") +
             FileList.new("remote/common/lib/runtime/*.jar") +
             FileList.new("chrome/lib/runtime/*.jar") +
             FileList.new("support/lib/runtime/*.jar"),
      :deps => [
                 :all
               ],
      :out  => "webdriver-all.zip")

task :release => [:common_zip, :firefox_zip, :htmlunit_zip, :ie_zip, :support_zip, :selenium_zip, :all_zip]


