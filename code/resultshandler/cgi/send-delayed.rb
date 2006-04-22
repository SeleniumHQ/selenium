#!/usr/bin/ruby
sleep(0.5);
puts "Content-type: text/html\r\n\r\n";
IO.foreach("#{ENV['PATH_TRANSLATED']}") { |line| puts line };
