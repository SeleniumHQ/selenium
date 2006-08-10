require 'rake/tasklib'
require 'thread'
require 'webrick'
require 'win32ole'

class Browser
  def supported?; true; end
  def setup ; end
  def visit(url) ; end
  def teardown ; end
  
  def host
    require 'rbconfig'
    Config::CONFIG['host']
  end
  
  def macos?
    host.include?('darwin')
  end
  
  def windows?
    host.include?('mswin')
  end
  
  def linux?
    host.include?('linux')
  end
  
  def applescript(script)
    raise "Can't run AppleScript on #{host}" unless macos?
    system "osascript -e '#{script}' 2>&1 >/dev/null"
  end
end

class Firefox < Browser
  def initialize(path='c:\Program Files\Mozilla Firefox\firefox.exe')
    @path = path
  end
  
  def visit(url)
    applescript('tell application "Firefox" to Get URL "' + url + '"') if macos? 
    system("#{@path} -new-window #{url}") if windows? 
    system("firefox #{url}") if linux?
  end
  
  def to_s
    "Firefox"
  end
end

class Opera < Browser
  def initialize(path='C:\Program Files\Opera\opera.exe')
    @path = path
  end
  
  def visit(url)
    system("#{@path} #{url}") if windows?    
  end
  
  def to_s
    "Opera"
  end
end

class Safari < Browser
  def supported?
    macos?
  end
  
  def setup
    applescript('tell application "Safari" to make new document')
  end
  
  def visit(url)
    applescript('tell application "Safari" to set URL of front document to "' + url + '"')
  end
  
  def teardown
    #applescript('tell application "Safari" to close front document')
  end
  
  def to_s
    "Safari"
  end
end

class IE < Browser
  def initialize()
  end
  
  def setup
    @ie = WIN32OLE.new('InternetExplorer.Application') if windows?
    @ie.visible = true
  end
  
  def supported?
    windows?
  end
  
  def visit(url)
    @ie.navigate("#{url}")
  end
  
  def teardown
    @ie.quit
  end
  
  def to_s
    "Internet Explorer"
  end
end

class Konqueror < Browser
  def supported?
    linux?
  end
  
  def visit(url)
    system("kfmclient openURL #{url}")
  end
  
  def to_s
    "Konqueror"
  end
end

# shut up, webrick :-)
class ::WEBrick::HTTPServer
  def access_log(config, req, res)
    # nop
  end
end

class ::WEBrick::BasicLog
  def log(level, data)
    # nop
  end
end

class JavaScriptTestTask < ::Rake::TaskLib
  require "resultshandler/jsunit_result_parser"
  require "resultshandler/selenium_result_parser"
  def initialize(name=:test)
    @name = name
    @tests = []
    @browsers = []
    @port = 8889
    
    @queue = Queue.new
    
    @server = WEBrick::HTTPServer.new(:Port => @port) # TODO: make port configurable
    @server.mount_proc("/results") do |req, res|
      @queue.push(req.query['time'].to_s)
      xml = JsUnitResultParser.new().to_xml(req.body.to_s)
      File.open("JsUnitResults.xml", File::CREAT|File::RDWR) do |f|
        f << xml
      end
      res.body += xml
    end
    
    @server.mount_proc("/seleniumResults") do |req, res|
      @queue.push(req.query['result'].to_s)
      parser = SeleniumResultParser.new
      xml = parser.to_xml(req)
      html = parser.to_html(req)
      File.open("SeleniumResults.xml", File::CREAT|File::RDWR) do |f|
        f << xml
      end
      res.body += html
    end
    
    
    yield self if block_given?
    define
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
              puts "#{result} : #{test} on #{browser}"
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
