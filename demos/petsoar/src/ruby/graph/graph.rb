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

##################################
# Dot Graph generator            #
################################## 
# - Joe Walnes <joe@truemesh.com>

class DotGraph

	def initialize()
		@clusters = {}
		@clusters['default'] = {}
		@links = {}
		@attributes = {}
	end
	
	def add_node(type, name, label = nil)
		(cluster, name) = split_cluster name
		nodes = @clusters[cluster]
		if not nodes
			nodes = {}
			@clusters[cluster] = nodes
		end
		if label == nil
			label = name
		end
		nodes[name] = [type, {}]
		nodes[name][1]['label'] = label
	end
	
	def add_link(source, dest, label = nil)
 		attrs = {}
		attrs['label'] = label
		@links[[x(source), x(dest)]] = attrs
	end

	def x(y) 
		cluster = split_cluster(y)
		cluster[0] + '/' + cluster[1]
	end
	
	def attribute(type, name, value)
		if not @attributes[type]
			@attributes[type] = {}
		end
		@attributes[type][name] = value
	end
	
	def to_s(include_attributes = false)
		result = "digraph mygraph {\n"
		if include_attributes
		  #result << "  rankdir=LR;\n"
			result << "  fontsize=10;\n"
			result << "  fontname=helvetica;\n"
			result << "  node [fontsize=10, fontname=helvetica, style=filled, shape=rectangle]\n"
			result << "  edge [fontsize=10, fontname=helvetica]\n"
		end
		@clusters['default'].each do |name, attributes|
			result << "  default_#{c(name)} "
				if include_attributes
					result << write_attributes(attributes[1], attributes[0])
				end
			result << ";\n"
		end
		@clusters.each do |cluster, nodes|
			if cluster != 'default'
				result << "  subgraph cluster_#{c(cluster)} {\n"
				if include_attributes
					result << "    color=grey;\n"
					result << "    fontcolor=grey;\n"
					result << "    label=\"#{cluster}\";\n"
				end
				nodes.each do |name, attributes|
					result << "    #{c(cluster)}_#{c(name)} "
						if include_attributes
							result << write_attributes(attributes[1], attributes[0])
						end
					result << ";\n"
				end
				result << "  }\n"
			end
		end
		@links.each do |link, attributes|
			result << "  #{c(link[0])} -> #{c(link[1])} "
			if include_attributes
				result << write_attributes(attributes)
			end
			result << ";\n";
		end
		result << "}\n"
	end

	def to_image(filename) 
		type = filename.sub(/^.*\./, '')
		IO.popen("dot.exe -T#{type} -o#{filename}", 'w+') do |dot|
			dot.puts(to_s(true))
			dot.close_write
		end
	end

	private
	
	def split_cluster(name)
		if name[/\//] then
			name.split '/', 2
		else
			['default',name]
		end
	end

	def c(str) # replace dot unfriendly chars
		str.tr './-', '_'
	end

	def write_attributes(attributes, type = nil)
		result = '['
		attributes.each do |key, value|
			if value
				result << "#{key}=\"#{value}\","
			end
		end
		extra_attributes = @attributes[type]
		if extra_attributes
			extra_attributes.each do |key, value|
				if value
					result << "#{key}=\"#{value}\","
				end
			end
		end
		result.chop!
		result << ']'
		if result == ']'
			result = ''
		end
		result
	end
	
end
