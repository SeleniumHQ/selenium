require 'fileutils'
include FileUtils

def install!
	install_javascript
	append_routes
	install_controller
	install_selenium_test
	run_selenium_test
end

def install_javascript
	target = '../../public/selenium'
	source = './javascript'
	mkdir target unless File.exists? target
	cp_r source, target
end

def append_routes
	temp_file = '../../config/new_routes.rb'
	routes_file = '../../config/routes.rb'

	route = "  map.connect 'selenium/javascript/driver', :controller => 'selenese', :action => 'driver'"
	lines = File.open(routes_file).readlines
	updated = []
	for line in lines.reverse
		return if line.match(route)
		updated << line
		updated << route if line.match('\bend\b')
	end

	File.open(temp_file, 'w') do |new_file|
		updated.reverse.each do |line|
			new_file.puts line
		end
	end
	
	mv temp_file, routes_file, :force => true
end

def install_controller
	cp './selenese_controller.rb', '../../app/controllers/'
	cp './selenese_controller_test.rb', '../../test/functional/'
end

def install_selenium_test
	acceptance = '../../test/acceptance'
	mkdir acceptance unless File.exist? acceptance
	cp './rails_example.rb', '../../test/acceptance'
end

def run_selenium_test
	exec 'ruby ../../test/acceptance/rails_example.rb'	
end

install!