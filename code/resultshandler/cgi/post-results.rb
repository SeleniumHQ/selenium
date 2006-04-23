#!@RUBY@
require 'cgi'

RESULTS_DIR = "../results/"

cgi = CGI.new

result = "#{cgi.params['result']}".upcase
timeString = Time.now.strftime("%Y%m%d%H%M%S")
resultsFile = "#{timeString}_#{result}.html"

File.open(RESULTS_DIR + resultsFile, "w") do |file|
  file.puts <<EOL
<html><head><title>Results</title></head>
<body>
<h1>Selenium test results</h1>
<dl>
  <dt>User Agent</dt><dd>#{ENV['HTTP_USER_AGENT']}</dd>
  <dt>Date</dt><dd>#{Time.now}</dd>
  <dt>Result</dt><dd><b>#{result}</b></dd>
</dl>
EOL

  file.puts cgi.params['suite']

  testTables = cgi.params.keys.grep(/testTable/).sort
  testTables.each do |key|
    file.puts cgi.params[key] 
  end
  
  file.puts <<EOL
<body>
EOL
  file.chmod(0666)
end

indexFragment = RESULTS_DIR + "index.fragment.html"
File.open(indexFragment, "a") do |file|
  file.puts <<EOL
<tr><td><a href="#{resultsFile}">#{result}</a></td><td>#{Time.now}</td><td>#{ENV["HTTP_USER_AGENT"]}</td></tr>
EOL
  file.chmod(0666)
end

indexFile = RESULTS_DIR + "index.html"
File.open(indexFile, "w") do |file|
  file.puts <<EOL
<html><head><title>Results</title></head>
<body>
<h1>Selenium test results</h1>
<table border="1">
<tr><th>Result</th><th>Date</th><th>User Agent</th></tr>
EOL
  IO.foreach(indexFragment) { |line| file.puts line }
  file.puts <<EOL
</table>
</body>
EOL
end

puts cgi.header("location" => indexFile)
