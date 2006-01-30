# Copyright (c) 2003-2005, Wiley & Sons, Joe Walnes,Ara Abrahamian,
# Mike Cannon-Brookes,Patrick A Lightbody
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
#     * Redistributions of source code must retain the above copyright
# notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
# notice, this list of conditions and the following disclaimer
# in the documentation and/or other materials provided with the distribution.
#     * Neither the name of the 'Wiley & Sons', 'Java Open Source
# Programming' nor the names of the authors may be used to endorse or
# promote products derived from this software without specific prior
# written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# Generate diagram of how WebWork actions and JSP views link together

require 'simplest/xml'
require 'graph/graph'

include Simplest

def actions_diagram(actions_file, views_dir, start_points = [])

	graph = DotGraph.new

	# Setup styles for node types
	graph.attribute 'action', 'color', 'coral1'
	graph.attribute 'view',   'color', 'darkseagreen2'
	graph.attribute 'start',  'color', 'gold'
	graph.attribute 'start',  'shape', 'octagon'

	# Entry points 
	start_points.each do |start_point|
		graph.add_node 'start', start_point + '_start', 'Start'
		graph.add_link start_point + '_start', start_point
	end

	# Parse actions.xml...
	views = []
	xml = Simplest::XML.new(File.new(actions_file).readlines.join)
	xml.each('/xwork/package') do |package_element|

		namespace = package_element['namespace'] 
		if !namespace 
			namespace = ''
		end
		
		package_element.each('action') do |action_element|
		
			# add <action> to graph
			action = namespace + '/' + action_element['name'] + '.action' 
			action.gsub!(/^\//,'')
			#print action + "\n"
			action_label = action_element['class'].sub(/^.*\./, '')
			graph.add_node 'action', action, action_label

			action_element.each('result') do |view_element|

				# add <view> to graph
				view = view_element.text.sub(/\?.*$/, '')

				if view[0,1] != '/'
					view = namespace + '/' + view			
				end
				view.sub!(/^\//,'')

				if view != ''

					#print ": " + view + "\n"
					if view.index /\.jsp$/
						graph.add_node 'view', view
						views << view
					end

					# link action->view
					link_label = view_element['name']
					graph.add_link action, view, link_label
				end

			end

		end 
		
	end

	# Scan all views for links back to actions

	link_pattern = /([\w\-_\.\/]+\.(action|jsp))/

	views.each do |view| # each file...
		dir = view.sub(/([\w\-_\.]+\.(action|jsp))$/,'')
		File.new(views_dir + view).each_line do |line| #each line...
			match = link_pattern.match(line)
			if match # try to match regexp
				# link view->action
				action = match[1]
				if action[0,1] != '/'
					action = dir + action
				else 
					action.sub!(/^\//,'')
				end
				#print action + "\n"
				graph.add_link view, action
			end
		end
	end
	
	graph
	
end
