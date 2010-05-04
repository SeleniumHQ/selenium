require 'rbconfig'

# Platform checks

def windows?
  (/mswin|msys|mingw32/ =~ RbConfig::CONFIG['host_os']) != nil
end

def mac?
  (/darwin|mac os/ =~ RbConfig::CONFIG['host_os']) != nil
end

def linux?
  (/linux/ =~ RbConfig::CONFIG['host_os']) != nil
end

def cygwin?
  RUBY_PLATFORM.downcase.include?("cygwin")
end

def unix?
  linux? or mac?
end

def classpath_separator?
  if cygwin? then
    ";"
  else
    File::PATH_SEPARATOR
  end
end

def all?
  true
end

# Checking for particular applications 

def present?(arg)
  prefixes = ENV['PATH'].split(File::PATH_SEPARATOR)

  matches = prefixes.select do |prefix|
    File.exists?(prefix + File::SEPARATOR + arg)
  end

  matches.length > 0
end

def java?
  present?("java") || present?("java.exe")
end

def javac?
  present?("javac") || present?("javac.exe")
end

def jar?
  present?("jar") || present?("jar.exe")
end

# Think of the confusion if we called this "g++"
def gcc?
  linux? && present?("g++") 
end

def python?
  present?("python") || present?("python.exe")
end

def msbuild?
  windows? && present?("msbuild.exe")
end

def xcode?
  return mac? && present?('xcodebuild')
end

def iPhoneSDKPresent?
  return false unless xcode?
  sdks = `xcodebuild -showsdks 2>&1`
  return false unless $?.success?
  !!(sdks =~ /iphonesimulator/)
end

def iPhoneSDK?
  return nil unless iPhoneSDKPresent?
  if $iPhoneSDK == nil then
    cmd = open("|xcodebuild -showsdks | grep iphonesimulator | awk '{print $7}'")
    sdks = cmd.readlines.map {|x| x.gsub(/\b(.*)\b.*/m, '\1').chomp}
    cmd.close

    if ENV['IPHONE_SDK_VERSION'] != nil then
      $iPhoneSDK = "iphonesimulator#{ENV['IPHONE_SDK_VERSION']}"
      puts "Testing for SDK #{$iPhoneSDK}"
      unless sdks.include?($iPhoneSDK) then
        puts "...#{$iPhoneSDK} not found."
        $iPhoneSDK = nil
      end
    end

    if $iPhoneSDK == nil then
      $iPhoneSDK = sdks.last
    end

    puts "Using iPhoneSDK: '#{$iPhoneSDK}'"
  end
  $iPhoneSDK
end

def iPhoneSDKVersion?
  sdk = iPhoneSDK?
  if sdk != nil then
    sdk.gsub(/iphonesimulator(.*)/, '\1')
  end
end
