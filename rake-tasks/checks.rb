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

PRESENT_CACHE = {}

# Checking for particular applications
def present?(arg)
  if PRESENT_CACHE.has_key?(arg)
    return PRESENT_CACHE[arg]
  end

  prefixes = ENV['PATH'].split(File::PATH_SEPARATOR)

  bool = prefixes.any? do |prefix|
    File.exists?(prefix + File::SEPARATOR + arg)
  end

  if !bool && mac?
    bool = File.exists?("/Applications/#{arg}.app")
  end

  PRESENT_CACHE[arg] = bool

  bool
end

def chrome?
  present?("chromedriver") || present?("chromedriver.exe")
end

def opera?
  present?("opera") || present?("Opera")
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

def msbuild_installed?
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
    cmd = open("|xcodebuild -showsdks | grep iphonesimulator | awk '{print $NF}'")
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

def AndroidSDK?
  if $androidSDK.nil?
    prop = YAML.load_file( './properties.yml' )
    properties=prop["default"]["android"]
    if (prop[ENV["USER"]])
      properties=prop[ENV["USER"]]["android"];
    end
    $androidSDK = File.exists?(properties["androidsdkpath"])
  end
  $androidSDK
end

# Not everyone is using a command-line subversion client.
def svn?
  present?('svn')
end

def svn_revision
  @svn_revision ||= (
    output = if File.directory?(".svn") && svn?
              `svn info`
             elsif File.directory?(".git") && present?("git")
               `git svn info`
             end

    output.to_s[/Revision: (\d+)/, 1] || 'unknown'
  )
end
