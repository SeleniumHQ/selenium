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

# Generate diagram of dependencies between services and actions across scopes.

require 'simplest/xml'
require 'graph/graph'
require 'java'

include Simplest

def components_diagram(components_file, actions_file)

	enablers = {}
	components = {}

	# Load all components from components.xml
	xml = Simplest::XML.new(File.new(components_file).readlines.join)
	xml.each('/components/component') do |element|
		enabler = element.text 'enabler'
		component = element.text 'class'
		scope = element.text 'scope'	
		if enabler
			enablers[enabler] = component 
		end
		components[component] = scope
	end

	# Load all actions from actions.xml
	xml = Simplest::XML.new(File.new(actions_file).readlines.join)
	xml.each('/xwork/package') do |package_element|
		namespace = package_element['namespace']
		if namespace
			namespace.sub!(/^\//,'')
		else
			namespace = 'default'
		end
		package_element.each('action') do |element|
			components[element['class']] = namespace
		end
	end

	graph = DotGraph.new

	# Add all components to graph
	components.each do |component, scope|
		graph.add_node 'component', scope + '/' + component, component[/\w+$/]
	end

	# Determine dependencies using reflection and add links to graph
	components.each do |component, scope|
		get_interfaces(component).each do |interface|
			dependency = enablers[interface]
			if dependency
				graph.add_link(
					scope + '/' + component, 
					components[dependency] + '/' + dependency
				)
			end
		end
	end

	graph
	
end

# Recursively find every interface a class implements/extends
def get_interfaces(cls_name, result = [])
	cls = Java::JavaClass.for_name(cls_name)
	cls.interfaces.each do |interface|
		result << interface
		get_interfaces(interface, result)
	end
	if cls.superclass
		result << cls.superclass.name
		get_interfaces(cls.superclass.name, result)
	end
	result
end

