require 'rbconfig'

# Platform checks

def windows?
  (RbConfig::CONFIG['host_os'] =~ /mswin|msys|mingw32/) != nil
end

def mac?
  (RbConfig::CONFIG['host_os'] =~ /darwin|mac os/) != nil
end

def linux?
  (RbConfig::CONFIG['host_os'] =~ /linux/) != nil
end

def cygwin?
  RUBY_PLATFORM.downcase.include?('cygwin')
end

def unix?
  linux? || mac?
end

def classpath_separator?
  if cygwin?
    ';'
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
  return PRESENT_CACHE[arg] if PRESENT_CACHE.key?(arg)

  prefixes = ENV['PATH'].split(File::PATH_SEPARATOR)

  bool = prefixes.any? do |prefix|
    File.exist?(prefix + File::SEPARATOR + arg)
  end

  bool = File.exist?("/Applications/#{arg}.app") if !bool && mac?

  PRESENT_CACHE[arg] = bool

  bool
end

def chrome?
  present?('chromedriver') || present?('chromedriver.exe')
end

def edge?
  present?('msedgedriver') || present?('msedgedriver.exe')
end

def opera?
  present?('opera') || present?('Opera')
end

def java?
  present?('java') || present?('java.exe')
end

def javac?
  present?('javac') || present?('javac.exe')
end

def jar?
  present?('jar') || present?('jar.exe')
end

# Think of the confusion if we called this "g++"
def gcc?
  linux? && present?('g++')
end

def python?
  present?('python') || present?('python.exe')
end

def msbuild_installed?
  windows? && present?('msbuild.exe')
end

def vcs_revision
  @vcs_revision ||= `git rev-parse --short HEAD`
end
