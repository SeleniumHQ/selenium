# Build file for WebDriver. I wonder if this could be run with JRuby?

require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

require 'rake-tasks/c.rb'
require 'rake-tasks/checks.rb'
require 'rake-tasks/java.rb'
require 'rake-tasks/mozilla.rb'

task :default => [:test]

# TODO(simon): All "outs" should be arrays

jar(:name => "common",
    :src  => [ "common/src/java/**/*.java" ],
    :out  => "webdriver-common.jar")

jar(:name => "test_common",
    :src  => [ "common/test/java/**/*.java" ],
    :deps => [ 
               :common,
               "common/lib/buildtime/*.jar"
             ],
    :out  => "webdriver-common-test.jar")

jar(:name => "htmlunit",
    :src  => [ "htmlunit/src/java/**/*.java" ],
    :deps => [ 
               :common,
               "htmlunit/lib/runtime/*.jar"
             ],
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
    :out  => "webdriver-ie.jar")
task :jobbie => :ie

test_java(:name => "test_ie",
          :src  => [ "jobbie/test/java/**/*.java" ],
          :deps => [
                     :ie,
                     :test_common
                   ],
          :out  => "webdriver-ie-test.jar")
task :test_jobbie => :test_ie                  

xpt(:name => "events_xpt",
    :src  => [ "firefox/src/cpp/webdriver-firefox/nsINativeEvents.idl" ],
    :out  => "nsINativeEvents.xpt")    

xpi(:name => "firefox_xpi",
    :src  => [ "firefox/src/extension" ],
    :deps => [ 
               :events_xpt,
               :firefox_dll
             ],
    :resources => [
                    { "nsINativeEvents.xpt" => "components/nsINativeEvents.xpt" },
                    { "Win32/Release/webdriver-firefox.dll" => "platform/WINNT_x86-msvc/components/webdriver-firefox.dll" }
                  ],
    :out  => "webdriver-extension.zip")

dll(:name => "firefox_dll",
    :src  => [ "common/src/cpp/webdriver-interactions/**/*", "jobbie/src/cpp/webdriver-firefox/**/*" ],
    :solution => "WebDriver.sln",
    :out  => [ "Win32/Release/webdriver-firefox.dll" ],
    :deps  => [ 
                :events_xpt,
              ],
    :spoof => true)  # Dump "spoof" files in the right place if you can't build

jar(:name => "firefox",
    :src  => [ "firefox/src/java/**/*.java" ],
    :deps => [
               :common,
               :firefox_xpi,
               "firefox/lib/runtime/*.jar"
             ],
    :resources => [ "webdriver-extension.zip" ],
    :out  => "webdriver-firefox.jar")

test_java(:name => "test_firefox",
          :src  => [ "firefox/test/java/**/*.java" ],
          :deps => [
                     :firefox,
                     :test_common,
                   ],
          :out  => "webdriver-firefox-test.jar")

jar(:name => "selenium",
    :src  => [ "selenium/src/java/**/*.java" ],
    :deps => [
               :ie,
               :firefox,
               :support,
               "selenium/lib/runtime/*.jar"
             ],
    :resources => [
                    { "selenium/src/java/org/openqa/selenium/internal/injectableSelenium.js", "org/openqa/selenium/internal/injectableSelenium.js" },
                    { "selenium/src/java/org/openqa/selenium/internal/htmlutils.js", "org/openqa/selenium/internal/htmlutils.js" }
                  ],
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

jar(:name => "support",
    :src  => [ "support/src/java/**/*.java" ],
    :deps => [
               :common,
               "support/lib/runtime/*.jar"
             ],
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

#test_java(:name => "test_remote",
#          :src  => [ 
#                     "remote/common/test/java/**/*.java",
#                     "remote/client/test/java/**/*.java",
#                     "remote/server/test/java/**/*.java"
#                   ],
#          :deps => [
#                     :test_common,
#                     :remote_client,
#                     :remote_server
#                   ],
#          :out => "webdriver-remote-test.jar")
task :test_remote                  

task :remote => [:remote_server, :remote_client]
task :build => [:common, :htmlunit, :firefox, :ie, :iphone, :support, :remote, :selenium]


task :clean do
  rm_rf 'build/'
end

task :test => [:test_htmlunit, :test_firefox, :test_ie, :test_iphone, :test_support, :test_remote, :test_selenium] do
end

task :install_firefox => [:firefox] do
  libs = %w(build/webdriver-common.jar build/webdriver-firefox.jar firefox/lib/runtime/json-20080701.jar)

  firefox = "firefox"
  if ENV['firefox'] then
      firefox = ENV['firefox']
  end

  extension_loc = File.dirname(__FILE__) + "/firefox/src/extension"
  extension_loc.tr!("/", "\\") if windows?

  cmd = 'java'
  cmd += ' -cp ' + libs.join(File::PATH_SEPARATOR)
  cmd += ' -Dwebdriver.firefox.development="' + extension_loc + '"'
  cmd += " -Dwebdriver.firefox.bin=\"#{ENV['firefox']}\" " unless ENV['firefox'].nil?
  cmd += ' org.openqa.selenium.firefox.FirefoxLauncher '
  
  sh cmd, :verbose => true
end

task :remote => [:remote_client, :remote_server]
#task :test_remote => [:test_remote_client]

task :javadocs => [:common, :firefox, :htmlunit, :jobbie, :remote, :support] do
  mkdir_p "build/javadoc"
   sourcepath = ""
   classpath = "support/lib/runtime/hamcrest-all-1.1.jar"
   %w(common firefox jobbie htmlunit support remote/common remote/client).each do |m|
     sourcepath += ":#{m}/src/java"
   end
   cmd = "javadoc -d build/javadoc -sourcepath #{sourcepath} -classpath #{classpath} -subpackages org.openqa.selenium"
  sh cmd
end



task :test_firefox_py => :test_firefox do
  if python? then
    sh "python py_test.py", :verbose => true
  end
end

task :iphone => [:iphone_server, :iphone_client]

# Place-holder tasks
task :test_iphone_server
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
  mkdir_p "build/dist/remote_client"

  cp 'remote/build/webdriver-remote-client.jar', 'build/dist/remote_client'
  cp 'remote/build/webdriver-remote-common.jar', 'build/dist/remote_client'
  cp 'common/build/webdriver-common.jar', 'build/dist/remote_client'

  cp Dir.glob('remote/common/lib/runtime/*.jar'), 'build/dist/remote_client'
  cp Dir.glob('remote/client/lib/runtime/*.jar'), 'build/dist/remote_client'

  sh "cd build/dist && zip -r webdriver-remote-client-#{version}.zip remote_client/*"
  rm_rf "build/dist/remote_client"

  mkdir_p "build/dist/remote_server"

  cp 'remote/build/webdriver-remote-server.jar', 'build/dist/remote_server'
  cp 'remote/build/webdriver-remote-common.jar', 'build/dist/remote_server'
  cp 'common/build/webdriver-common.jar', 'build/dist/remote_server'

  cp Dir.glob('remote/common/lib/runtime/*.jar'), 'build/dist/remote_server'
  cp Dir.glob('remote/server/lib/runtime/*.jar'), 'build/dist/remote_server'

  rm Dir.glob('build/dist/remote_server/servlet*.jar')

  sh "cd build/dist && zip -r webdriver-remote-server-#{version}.zip remote_server/*"
  rm_rf "build/dist/remote_server"
end

task :release => [:common, :firefox, :htmlunit, :jobbie, :remote_release, :support, :selenium] do
  %w(common firefox jobbie htmlunit support selenium).each do |driver|
    mkdir_p "build/dist/#{driver}"
    cp 'common/build/webdriver-common.jar', "build/dist/#{driver}"
    cp "#{driver}/build/webdriver-#{driver}.jar", "build/dist/#{driver}"
    cp Dir.glob("#{driver}/lib/runtime/*"), "build/dist/#{driver}" if File.exists?("#{driver}/lib/runtime")

    sh "cd build/dist && zip -r webdriver-#{driver}-#{version}.zip #{driver}/*"
    rm_rf "build/dist/#{driver}"
  end
end

task :all => [:release] do
  mkdir_p "build/all"
  mkdir_p "build/all/webdriver"

  # Expand all the individual webdriver JARs and combine into one
  # We do things this way so that if we've built a JAR on another
  # platform and copied it to the right place, this uberjar works
  %w(common firefox htmlunit jobbie remote-client support selenium).each do |zip|
    sh "pwd", :verbose => true
    sh "cd build/all && unzip -o ../dist/webdriver-#{zip}-#{version}.zip", :verbose => true
  end

  mkdir_p "build/all/all"
  %w(common firefox htmlunit jobbie support selenium).each do |j|
    sh "cd build/all/all && jar xf ../#{j}/webdriver-#{j}.jar"
  end
  sh "cd build/all/all && jar xf ../remote_client/webdriver-remote-client.jar"

  # Repackage the uber jar
  sh "cd build/all/all && jar cf ../webdriver/webdriver-all.jar *"

  # Collect the libraries into one place
  %w(common firefox htmlunit jobbie remote_client support).each do |j|
    cp Dir.glob("build/all/#{j}/*.jar").reject {|f| f =~ /webdriver/} , "build/all/webdriver"
  end

  # And repack. Finally
  sh "cd build/all && zip ../dist/webdriver-all-#{version}.zip webdriver/*"
end

