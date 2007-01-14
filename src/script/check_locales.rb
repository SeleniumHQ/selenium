#!/usr/bin/env ruby
#
# A script that checks if there are any missing properties in any locale.
#

require 'pathname'

src_locale = ARGV[0] || "en-US"

def parse_key(filename, line)
  if line =~ %r{^<!ENTITY ([a-z0-9_\.-]+) ".*?">\s*}i
    $1
  elsif line =~ %r{^([a-z0-9_\.-]+)=}i
    $1
  elsif line =~ /^\s*$/ || line =~ /^#/
    nil
  else
    raise "parse error: file=#{filename}, line=#{line}"
  end
end

def error(msg)
  $has_error = true
  print "#{msg}\n"
end

['selenium-ide.dtd', 'options.dtd', 'selenium-ide.properties'].each do |filename|
  orig_keys = []
  File.open("locale/#{src_locale}/#{filename}") do |f|
    f.each_line { |line| orig_keys << parse_key(filename, line) }
  end
  orig_keys.delete nil
  Pathname.glob("locale/*/#{filename}") do |pathname|
    keys = []
    pathname.each_line { |line| keys << parse_key(pathname, line) }
    error "missing property in #{pathname}: #{orig_keys - keys}" unless (orig_keys - keys).empty?
  end
end

exit $has_error ? 1 : 0
