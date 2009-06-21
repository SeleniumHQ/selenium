# Sinatra 0.3.x compatibility module.
#
# The following code makes Sinatra 0.9.x compatible with Sinatra 0.3.x to
# ease the transition to the final 1.0 release. Everything defined in this
# file will be removed for the 1.0 release.

require 'ostruct'
require 'sinatra/base'
require 'sinatra/main'

# Like Kernel#warn but outputs the location that triggered the warning.
def sinatra_warn(*message) #:nodoc:
  line = caller.
    detect { |line| line !~ /(?:lib\/sinatra\/|__DELEGATE__)/ }.
    sub(/:in .*/, '')
  warn "#{line}: warning: #{message.join(' ')}"
end

# Rack now supports evented and swiftiplied mongrels through separate
# handler.
if ENV['SWIFT']
  sinatra_warn 'the SWIFT environment variable is deprecated;',
    'use Rack::Handler::SwiftipliedMongrel instead.'
  require 'swiftcore/swiftiplied_mongrel'
  puts "Using Swiftiplied Mongrel"
elsif ENV['EVENT']
  sinatra_warn 'the EVENT environment variable is deprecated;',
    'use Rack::Handler::EventedMongrel instead.'
  require 'swiftcore/evented_mongrel'
  puts "Using Evented Mongrel"
end

# Make Rack 0.9.0 backward compatibile with 0.4.0 mime types. This isn't
# technically a Sinatra issue but many Sinatra apps access the old
# MIME_TYPES constants due to Sinatra example code.
require 'rack/file'
module Rack #:nodoc:
  class File #:nodoc:
    def self.const_missing(const_name)
      if const_name == :MIME_TYPES
        hash = Hash.new { |hash,key| Rack::Mime::MIME_TYPES[".#{key}"] }
        const_set :MIME_TYPES, hash
        sinatra_warn 'Rack::File::MIME_TYPES is deprecated; use Rack::Mime instead.'
        hash
      else
        super
      end
    end
  end
end

module Sinatra
  module Compat #:nodoc:
  end

  # Make Sinatra::EventContext an alias for Sinatra::Default to unbreak plugins.
  def self.const_missing(const_name) #:nodoc:
    if const_name == :EventContext
      const_set :EventContext, Sinatra::Default
      sinatra_warn 'Sinatra::EventContext is deprecated; use Sinatra::Default instead.'
      Sinatra::Default
    else
      super
    end
  end

  # The ServerError exception is deprecated. Any exception is considered an
  # internal server error.
  class ServerError < RuntimeError
    def initialize(*args, &block)
      sinatra_warn 'Sinatra::ServerError is deprecated;',
        'use another exception, error, or Kernel#fail instead.'
    end
    def code ; 500 ; end
  end

  class Default < Base
    def self.const_missing(const_name) #:nodoc:
      if const_name == :FORWARD_METHODS
        sinatra_warn 'Sinatra::Application::FORWARD_METHODS is deprecated;',
          'use Sinatra::Delegator::METHODS instead.'
        const_set :FORWARD_METHODS, Sinatra::Delegator::METHODS
        Sinatra::Delegator::METHODS
      else
        super
      end
    end

    # Deprecated. Use: response['Header-Name']
    def header(header=nil)
      sinatra_warn "The 'header' method is deprecated; use 'headers' instead."
      headers(header)
    end

    # Deprecated. Use: halt
    def stop(*args, &block)
      sinatra_warn "The 'stop' method is deprecated; use 'halt' instead."
      halt(*args, &block)
    end

    # Deprecated. Use: etag
    def entity_tag(*args, &block)
      sinatra_warn "The 'entity_tag' method is deprecated; use 'etag' instead."
      etag(*args, &block)
    end

    # Deprecated. Use the #attachment helper and return the data as a String or
    # Array.
    def send_data(data, options={})
      sinatra_warn "The 'send_data' method is deprecated. use attachment, status, content_type, etc. helpers instead."

      status       options[:status]   if options[:status]
      attachment   options[:filename] if options[:disposition] == 'attachment'
      content_type options[:type]     if options[:type]
      halt data
    end

    # The :views_directory, :options, :haml, and :sass options are deprecated.
    def render(engine, template, options={}, locals={}, &bk)
      if options.key?(:views_directory)
        sinatra_warn "The :views_directory option is deprecated; use :views instead."
        options[:views] = options.delete(:views_directory)
      end
      [:options, engine.to_sym].each do |key|
        if options.key?(key)
          sinatra_warn "Passing :#{key} => {} to #{engine} is deprecated; " +
                       "merge options directly into hash instead."
          options.merge! options.delete(key)
        end
      end
      super(engine, template, options, locals, &bk)
    end

    # Throwing halt with a Symbol and the to_result convention are
    # deprecated. Override the invoke method to detect those types of return
    # values.
    def invoke(&block) #:nodoc:
      res = super
      case
      when res.kind_of?(Symbol)
        sinatra_warn "Invoking the :#{res} helper by returning a Symbol is deprecated;",
          "call the helper directly instead."
        @response.body = __send__(res)
      when res.respond_to?(:to_result)
        sinatra_warn "The to_result convention is deprecated."
        @response.body = res.to_result(self)
      end
      res
    end

    def options #:nodoc:
      Options.new(self.class)
    end

    class Options < Struct.new(:target) #:nodoc:
      def method_missing(name, *args, &block)
        if target.respond_to?(name)
          target.__send__(name, *args, &block)
        elsif args.empty? && name.to_s !~ /=$/
          sinatra_warn 'accessing undefined options will raise a NameError in Sinatra 1.0'
          nil
        else
          super
        end
      end
    end

    class << self
      # Deprecated. Options are stored directly on the class object.
      def options
        sinatra_warn "The 'options' class method is deprecated; use 'self' instead."
        Options.new(self)
      end

      # Deprecated. Use: configure
      def configures(*args, &block)
        sinatra_warn "The 'configures' method is deprecated; use 'configure' instead."
        configure(*args, &block)
      end

      # Deprecated. Use: set
      def default_options
        sinatra_warn "Sinatra::Application.default_options is deprecated; use 'set' instead."
        fake = lambda { |options| set(options) }
        def fake.merge!(options) ; call(options) ; end
        fake
      end

      # Deprecated. Use: set
      def set_option(*args, &block)
        sinatra_warn "The 'set_option' method is deprecated; use 'set' instead."
        set(*args, &block)
      end

      def set_options(*args, &block)
        sinatra_warn "The 'set_options' method is deprecated; use 'set' instead."
        set(*args, &block)
      end

      # Deprecated. Use: set :environment, ENV
      def env=(value)
        sinatra_warn "The :env option is deprecated; use :environment instead."
        set :environment, value
      end

      # Deprecated. Use: options.environment
      def env
        sinatra_warn "The :env option is deprecated; use :environment instead."
        environment
      end
    end

    # Deprecated. Missing messages are no longer delegated to @response.
    def method_missing(name, *args, &b) #:nodoc:
      if @response.respond_to?(name)
        sinatra_warn "The '#{name}' method is deprecated; use 'response.#{name}' instead."
        @response.send(name, *args, &b)
      else
        super
      end
    end
  end

  class << self
    # Deprecated. Use: Sinatra::Application
    def application
      sinatra_warn "Sinatra.application is deprecated; use Sinatra::Application instead."
      Sinatra::Application
    end

    # Deprecated. Use: Sinatra::Application.reset!
    def application=(value)
      raise ArgumentError unless value.nil?
      sinatra_warn "Setting Sinatra.application to nil is deprecated; create a new instance instead."
      Sinatra.class_eval do
        remove_const :Application
        const_set :Application, Class.new(Sinatra::Default)
      end
    end

    def build_application
      sinatra_warn "Sinatra.build_application is deprecated; use Sinatra::Application instead."
      Sinatra::Application
    end

    def options
      sinatra_warn "Sinatra.options is deprecated; use Sinatra::Application.option_name instead."
      Sinatra::Application.options
    end

    def port
      sinatra_warn "Sinatra.port is deprecated; use Sinatra::Application.port instead."
      options.port
    end

    def host
      sinatra_warn "Sinatra.host is deprecated; use Sinatra::Application.host instead."
      options.host
    end

    def env
      sinatra_warn "Sinatra.env is deprecated; use Sinatra::Application.environment instead."
      options.environment
    end
  end
end
