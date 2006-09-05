#!/usr/bin/env ruby

# Serve up the "javascript" directory from WEBrick, but inject a random
# artificial delay between when serving each page.  This simulates running
# Selenium from a slow web-server.

require 'webrick'

$port = 4444
$min_delay = 0.1
$max_delay = 0.5

class RandomDelayedFileHandler < WEBrick::HTTPServlet::FileHandler

  def initialize(server, dir, mindelay=0, maxdelay=nil)
    @mindelay = mindelay
    @maxdelay = maxdelay || @mindelay 
    super(server, dir, true)
  end

  def random_delay
    @mindelay + rand * (@maxdelay - @mindelay)
  end

  def exec_handler(req, res)
    delay = random_delay
    puts "delay=#{delay}"
    sleep(delay)
    super(req, res)
  end

end

server = WEBrick::HTTPServer.new(:Port => $port)
server.mount("/javascript", RandomDelayedFileHandler, "javascript", $min_delay, $max_delay)
trap(:INT) {
  server.shutdown
}
server.start
