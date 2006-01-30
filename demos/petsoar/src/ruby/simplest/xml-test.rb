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

require 'simplest/tester'
require 'simplest/xml'

include Simplest

class XMLTest < Test

	def test_parse_document
		xml = XML.new('<document>hello</document>')
		asserteq 'hello', xml.text
	end

	def test_xpath_get
		xml = XML.new('<document><child id="1">bye</child><child id="4">hellooo</child></document>')
		elements = xml.get('/document/child')
		asserteq 'bye',     elements[0].text
		asserteq 'hellooo', elements[1].text
		elements = xml.get('/document/child[@id="4"]')
		asserteq 'hellooo', elements[0].text
	end

	def test_xpath_each
		xml = XML.new('<document><child>a</child><child>b</child></document>')
		result = ''
		xml.each('/document/child') do |child|
			result << child.text
		end
		asserteq 'ab', result
	end

	def test_visit_subchildren
		xml = XML.new('<document><child><sub>a</sub><sub>A</sub></child><child>b</child></document>')
		result = ''
		xml.each('/document/child') do |child|
			result << "(child:#{child.text})"
			child.each('sub') do |sub|
				result << "(sub:#{sub.text})"
			end
		end
		asserteq '(child:)(sub:a)(sub:A)(child:b)', result
	end

	def test_attributes
		xml = XML.new('<document><child name="cheese" color="yellow"/></document>')
		element = xml.get('/document/child')[0]
		asserteq 'cheese', element['name']
		asserteq 'yellow', element['color']
	end
	
	def test_child_text
		xml = XML.new('<document><car>fast</car><dog>hairy</dog></document>')
		asserteq 'fast', xml.text('car')
		asserteq 'hairy', xml.text('dog')
		asserteq nil, xml.text('boo')
	end
	
end

XMLTest.new.run