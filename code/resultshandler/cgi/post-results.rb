#!@RUBY@
require 'cgi'

RESULTS_DIR = "../results/"
RESULTS_LIST_FILE = RESULTS_DIR + "results.list"
RESULTS_INDEX_FILE = RESULTS_DIR + "index.html"

class SeleniumVersion
  attr_reader :version, :revision

  def initialize(version, revision)
    @version = version
    @revision = revision
  end

  def to_s
     "#{@version} [#{@revision}]"
  end
end

class TestResult
  attr_reader :version, :result, :completion_time, :user_agent, :file

  def initialize(version, result, completion_time, user_agent)
    @version = version
    @result = result
    @completion_time = completion_time
    @user_agent = user_agent
    @file = "#{completion_time.strftime("%Y%m%d%H%M%S")}#{completion_time.usec}_#{result}.html"
  end
end

#
# Create the results page for this test run
#
def create_test_result_file(result, cgi)
  File.open(RESULTS_DIR + result.file, "w") do |file|
    file.puts <<EOL
<html><head><title>Results</title></head>
<body>
<h1>Selenium test results</h1>
<dl>
  <dt>Selenium Version</dt><dd>#{result.version}</dd>
  <dt>User Agent</dt><dd>#{result.user_agent}</dd>
  <dt>Date</dt><dd>#{result.completion_time}</dd>
  <dt>Result</dt><dd><b>#{result.result}</b></dd>
</dl>
EOL

    file.puts cgi['suite']

    testTables = cgi.keys.grep(/testTable/).sort
    testTables.each do |key|
      file.puts cgi[key]
    end

    file.puts <<EOL
</body>
</html>
EOL
    file.chmod(0666)
  end
end

#
# Add the result to the data file holding the list of all files
#
def add_to_results_list_file(result)
File.open(RESULTS_LIST_FILE, "a") do |file|
    # Serialise the result to a ruby file, for later eval'ing
    file.puts <<EOL
resultsList.push( TestResult.new(SeleniumVersion.new("#{result.version.version}", "#{result.version.revision}"),
                                 "#{result.result}",
                                 Time.at(#{result.completion_time.tv_sec}, #{result.completion_time.tv_usec}),
                                 "#{result.user_agent}"))

EOL
end
end

#
# Create the index.html file listing all results
#
def create_index_file(resultsList)
File.open(RESULTS_INDEX_FILE, "w") do |file|
  file.puts <<EOL
<html><head><title>Results</title></head>
<body>
<h1>Selenium test results</h1>
<table border="1">
<tr><th>Revision</th><th>Result</th><th>Date</th><th>User Agent</th></tr>
EOL

  resultsList.each do |aResult|
      file.puts <<EOL
    <tr><td>#{aResult.version.revision}</td>
        <td><a href="#{aResult.file}">#{aResult.result}</a></td>
        <td>#{aResult.completion_time}</td>
        <td>#{aResult.user_agent}</td>
    </tr>
EOL
  end

    file.puts <<EOL
</table>
</body>
EOL
end
end

def redirect_to(cgi, url)
    puts cgi.header("location" => RESULTS_INDEX_FILE)
end

cgi = CGI.new

version = SeleniumVersion.new(cgi['selenium.version'],
                              cgi['selenium.revision'])

result = TestResult.new(version,
                        "#{cgi['result']}".upcase,
                        Time.now,
                        "#{cgi.user_agent}")

create_test_result_file(result, cgi)

#TODO - can we just iterate all files in the directory to produce results list?
add_to_results_list_file(result)

# Read results list from file
resultsList = Array.new
eval "#{IO.readlines(RESULTS_LIST_FILE)}"

create_index_file(resultsList)

redirect_to(cgi, RESULTS_INDEX_FILE)
