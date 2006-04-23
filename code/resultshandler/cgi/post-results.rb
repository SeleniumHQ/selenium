#!@RUBY@
require 'cgi'

RESULTS_DIR = "../results/"

cgi = CGI.new

result = "#{cgi['result']}".upcase
version = cgi['selenium.version']
revision = cgi['selenium.revision']
completionTime = Time.now
resultsFile = "#{completionTime.strftime("%Y%m%d%H%M%S")}#{completionTime.usec}_#{result}.html"

File.open(RESULTS_DIR + resultsFile, "w") do |file|
  file.puts <<EOL
<html><head><title>Results</title></head>
<body>
<h1>Selenium test results</h1>
<dl>
  <dt>Selenium Version</dt><dd>#{version} [#{revision}]</dd>
  <dt>User Agent</dt><dd>#{cgi.user_agent}</dd>
  <dt>Date</dt><dd>#{Time.now}</dd>
  <dt>Result</dt><dd><b>#{result}</b></dd>
</dl>
EOL

  file.puts cgi['suite']

  testTables = cgi.keys.grep(/testTable/).sort
  testTables.each do |key|
    file.puts cgi[key]
  end
  
  file.puts <<EOL
<body>
EOL
  file.chmod(0666)
end

resultsListFile = RESULTS_DIR + "results.list"
File.open(resultsListFile, "a") do |file|
    file.puts <<EOL
resultsList.push({:revision => "#{revision}",
                  :result => "#{result}",
                  :file => "#{resultsFile}",
                  :time => Time.at(#{completionTime.tv_sec}, #{completionTime.tv_usec}),
                  :user_agent => "#{cgi.user_agent}"})

EOL
end

resultsList = Array.new
eval "#{IO.readlines(resultsListFile)}"

indexFile = RESULTS_DIR + "index.html"
File.open(indexFile, "w") do |file|
  file.puts <<EOL
<html><head><title>Results</title></head>
<body>
<h1>Selenium test results</h1>
<table border="1">
<tr><th>Revision</th><th>Result</th><th>Date</th><th>User Agent</th></tr>
EOL

  resultsList.each do |aResult|
      file.puts <<EOL
    <tr><td>#{aResult[:revision]}</td>
        <td><a href="#{aResult[:file]}">#{aResult[:result]}</a></td>
        <td>#{aResult[:time]}</td>
        <td>#{aResult[:user_agent]}</td>
    </tr>
EOL
  end

  file.puts <<EOL
</table>
</body>
EOL
end

puts cgi.header("location" => indexFile)
