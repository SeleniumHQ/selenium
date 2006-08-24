require 'rake/tasklib'
require 'thread'
require 'webrick'
require 'browser'
require 'test_case_result'
require 'jsunit_result'
require 'selenium_result'

include Browser

class DelayedFileHandler < WEBrick::HTTPServlet::FileHandler

  def initialize(server, dir, delay=0)
    @delay = delay
    super(server, dir)
  end

  def exec_handler(req, res)
    sleep(@delay)
    super(req, res)
  end

end

class JavaScriptTestTask < ::Rake::TaskLib

  attr_accessor :delay

  def initialize(name)
    @name = name
    @delay = 0
    @tests = []
    @mounts = {}
    @browsers = []
    @port = 4444
    
    @queue = Queue.new
    
    yield self if block_given?
    define
  end
  
  # test should be specified as a url
  def run(test)
    @tests << test
  end
  
  def mount(path, dir=nil)
    dir = Dir.pwd + path unless dir
    @mounts[path] = dir
  end
  
  def browser(browser)
    @browsers << browser.new
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
    File.open(log_file, "w") do |f|
      f << xml
    end
    parser.to_html()
  end
  
  def create_server
    @server = WEBrick::HTTPServer.new(:Port => @port)
    @server.mount_proc("/jsunitResults") do |req, res|
      parser, log_file = [JsUnitResult.new(req), "logs/JsUnitResults.xml"]
      html_report = handle_test_results(res, parser, log_file)    
    end
    @server.mount_proc("/seleniumResults") do |req, res|
      parser, log_file = [SeleniumResult.new(req), "logs/SeleniumResults.xml"]
      html_report = handle_test_results(res, parser, log_file)      
      File.open("logs/SeleniumResults.html", "w") do |f|
        f << html_report
      end
    end
    @mounts.each do |path,dir|
      @server.mount(path, DelayedFileHandler, dir, @delay)
    end
  end

  def define
    task @name do
      create_server
      trap(:INT) {
        @server.shutdown
      }
      t = Thread.new { 
        puts "Starting test-server"
        @server.start
      }
      
      @browsers.each do |browser|
        if browser.supported?
          puts "Running tests with #{browser}"
          @tests.each do |test|
            test_url = "ROOT" + test
            test_url.gsub!(/ROOT/, "http://localhost:#{@port}")
            browser.setup
            browser.visit(test_url)              
            passed = @queue.pop
            browser.teardown
            raise "TEST FAILED" unless passed
          end            
          puts "Done tests with #{browser}"
        else
          puts "Skipping #{browser}, not supported on this OS"
        end
      end
      
      puts "Shutting down test-server"
      @server.shutdown
      t.join
    end
  end
  
end
