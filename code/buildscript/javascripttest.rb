require 'rake/tasklib'
require 'thread'
require 'webrick'
require 'rbconfig'

include_file 'browser'
include_file 'jsunit_result_parser'
include_file 'selenium_result_parser'


class JavaScriptTestTask < ::Rake::TaskLib
  def initialize(name=:test)
    @name = name
    @tests = []
    @browsers = []
    @port = 8889
    
    @queue = Queue.new
    
    @server = WEBrick::HTTPServer.new(:Port => @port) # TODO: make port configurable
    @server.mount_proc("/results") do |req, res|
      @queue.push(req.query['time'].to_s)
      res.body += parse_result(req, JsUnitResultParser.new, "logs/JsUnitResults.xml")
    end
    
    @server.mount_proc("/seleniumResults") do |req, res|
      result = parse_result(req, SeleniumResultParser.new, "logs/SeleniumResults.xml")
      File.open("logs/SeleniumResults.html", File::CREAT|File::RDWR) do |f|
        f << result
      end
      res.body += result
      @queue.push(req.query['result'].to_s)
    end
    
    yield self if block_given?
    define
  end
  
  def parse_result(req, parser, log_file)
    xml = parser.to_xml(req)
    File.open(log_file, File::CREAT|File::RDWR) do |f|
      f << xml
    end
    parser.to_html(req)
  end
  
  def define
    task @name do
      trap("INT") { 
        @server.shutdown
      }
      t = Thread.new { 
        @server.start
      }
      
      # run all combinations of browsers and tests
      threads = Array.new
      @browsers.each do |browser|
        if browser.supported?
          threads <<  Thread.new do            
            @tests.each do |test|
              browser.setup
              browser.visit("http://localhost:#{@port}#{test}")              
              result = @queue.pop
              browser.teardown
            end            
          end
          
          
        else
          puts "Skipping #{browser}, not supported on this OS"
        end
      end
      
      threads.each do |thread|
        thread.join
      end
      @server.shutdown
      t.join
    end
  end
  
  def mount(path, dir=nil)
    dir = Dir.pwd + path unless dir
    
    @server.mount(path, WEBrick::HTTPServlet::FileHandler, dir)
  end
  
  # test should be specified as a url
  def run(test)
    @tests << test
  end
  
  def browser(browser)
    @browsers << browser.new
  end
end
