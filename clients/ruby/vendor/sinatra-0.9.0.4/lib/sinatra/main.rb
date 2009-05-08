require 'sinatra/base'

module Sinatra
  class Default < Base
    set :app_file, lambda {
      ignore = [
        /lib\/sinatra.*\.rb$/, # all sinatra code
        /\(.*\)/,              # generated code
        /custom_require\.rb$/  # rubygems require hacks
      ]
      path =
        caller.map{ |line| line.split(/:\d/, 2).first }.find do |file|
          next if ignore.any? { |pattern| file =~ pattern }
          file
        end
      path || $0
    }.call

    set :run, Proc.new { $0 == app_file }
    set :reload, Proc.new{ app_file? && development? }

    if run? && ARGV.any?
      require 'optparse'
      OptionParser.new { |op|
        op.on('-x')        {       set :mutex, true }
        op.on('-e env')    { |val| set :environment, val.to_sym }
        op.on('-s server') { |val| set :server, val }
        op.on('-p port')   { |val| set :port, val.to_i }
      }.parse!(ARGV.dup)
    end
  end
end

include Sinatra::Delegator

def helpers(&block)
  Sinatra::Application.send :class_eval, &block
end

def mime(ext, type)
  ext = ".#{ext}" unless ext.to_s[0] == ?.
  Rack::Mime::MIME_TYPES[ext.to_s] = type
end

at_exit do
  raise $! if $!
  Sinatra::Application.run! if Sinatra::Application.run?
end
