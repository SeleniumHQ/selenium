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

# ElectricXML implementation of Simplest::XML (JRuby)

# Note, this uses the horrible low-level JRuby API because ElectricXML makes
# heavy use of overloaded methods.

module Simplest

	def build_document(source)
		doc_class = Java::JavaClass.for_name('electric.xml.Document')
		constructor = doc_class.constructor('java.lang.String')
		doc = constructor.new_instance(Java::primitive_to_java(source))
		root = doc_class.java_method('getRoot').invoke(doc)
		ElectricXMLElement.new(root)
	end
	
	class ElectricXMLElement

		def initialize(element)
			@element = element
		end

		def text(element_name = nil)
			if element_name
				result = @element.java_class.java_method('getTextString', 'java.lang.String').invoke(
						@element, Java::primitive_to_java(element_name))
			else
				result = @element.java_class.java_method('getTextString').invoke(@element)
			end
			Java::java_to_primitive(result)
		end

		def get(xpath)
			results = []

			xpath_class = Java::JavaClass.for_name('electric.xml.XPath')
			xpath_constructor = xpath_class.constructor('java.lang.String')
			xpath_instance = xpath_constructor.new_instance(Java::primitive_to_java(xpath))
			
			elements_method = @element.java_class.java_method('getElements', 'electric.xml.XPath')
			java_results = elements_method.invoke(@element, xpath_instance)
			results = []
			loop {
				next_element = java_results.java_class.java_method('next').invoke(java_results)
				if !Java::java_to_primitive(next_element)
					break
				else
					results << ElectricXMLElement.new(next_element)
				end
			}
			results
		end

		def each(xpath)
			get(xpath).each do |e|
				yield e
			end
		end

		def [](attribute)
			attr_method = @element.java_class.java_method('getAttributeValue', 'java.lang.String')
			result = attr_method.invoke(@element, Java::primitive_to_java(attribute))
			Java::java_to_primitive(result)
		end

	end

end