require 'jsrpc'

puts "Go to http://localhost:4802/jsrpc/jsrpc_example.html"

browser = Selenium::Browser.new("../javascript").proxy

# Pull a Javascript by-reference object into this script
someArea = browser.document.getElementById("someArea")
puts "The string representation of the JSRMI by-ref object someArea is #{someArea}. That's useful for debugging!"

# Set the value of the text area
someArea.value = "Hello from Ruby #{Time.new}"
puts someArea.value

# Call a function on a by-ref object (the browser itself) with a by-ref argument (the text area)
puts browser.logValueOf(someArea)