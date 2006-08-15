require 'rake/tasklib'
require 'thread'
require 'webrick'
require 'browser'
require 'test_case_result'
require 'jsunit_result'
require 'selenium_result'

class JavaScriptTestTask < ::Rake::TaskLib
  def initialize(name=:test)
    @name = name
    @tests = []
    @browsers = []
    @port = 8889
    
    @queue = Queue.new
    
    
    @server = WEBrick::HTTPServer.new(:Port => @port) # TODO: make port configurable
    @server.mount_proc("/jsunitResults") do |req, res|
      parser, log_file = [JsUnitResult.new(req), "logs/JsUnitResults.xml"]
      html_report = handle_test_results(res, parser, log_file)    
    end
    
    @server.mount_proc("/seleniumResults") do |req, res|
      parser, log_file = [SeleniumResult.new(req), "logs/SeleniumResults.xml"]
      html_report = handle_test_results(res, parser, log_file)      
      File.open("logs/SeleniumResults.html", File::CREAT|File::RDWR) do |f|
        f << html_report
      end
    end
    
    yield self if block_given?
    define
  end
  
  def handle_test_results(res, parser, log_file)
    html_report = parse_result(parser, log_file)
    res.body += html_report
    @queue.push(parser.success?)
    return html_report
  end
  
  def parse_result(parser, log_file)
    xml = parser.to_xml()
    mkdir_p 'logs'
    File.open(log_file, File::CREAT|File::RDWR) do |f|
      f << xml
    end
    parser.to_html()
  end
  
  def define
    task @name do
      trap("INT") { 
        @server.shutdown
      }
      t = Thread.new { 
        @server.start
      }
      
      @browsers.each do |browser|
        if browser.supported?
          @tests.each do |test|
            browser.setup
            browser.visit("http://localhost:#{@port}#{test}")              
            passed = @queue.pop
            browser.teardown
            raise "TEST FAILED" unless passed
          end            
          
        else
          puts "Skipping #{browser}, not supported on this OS"
        end
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
