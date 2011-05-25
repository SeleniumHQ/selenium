require 'rubygems'
require 'rack'
require 'webrick'

# TODO: Use Selenium::WebDriver::SpecSupport::RackServer?
class SampleApp

  def self.start(host, port)
    Rack::Handler::WEBrick.run(new, :Host => host, :Port => port)
  end

  def initialize
    @public = Rack::File.new(File.expand_path("../public", __FILE__))
  end

  def call(env)
    req = Rack::Request.new(env)

    case req.path
    when "/"
      [200, {}, ["Selenium Ruby Client Sample Application"]]
    when "/compute"
      sleep 5
      resp = eval(req.params['calculator-expression']).to_s
      [200, {}, [resp]]
    else
      @public.call(env)
    end
  end

end

