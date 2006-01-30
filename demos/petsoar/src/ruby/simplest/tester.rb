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
# The simplest testing framework #
################################## 
# - Joe Walnes <joe@truemesh.com>

# Usage:
#
# require 'simplest/tester'
#
#	class MyTest < SimplestTest
#
#   def test_something
#     assert dostuff()
#     asserteq 5, 5 
#   end
#
#   def test_another
#     assert dostuff(), 'a descriptive fail message'
#   end
#
# end
#
# MyTest.new.run
#
# Note: I wrote this test framework test-first following Kent's example
# and the original version (including tests and implementation) fell in 
# at 36 lines (one screenful). SWEEEEET ;)

module Simplest

	class Test

		def run
			methods.each do |method|
				if method[/^test_/]
					@current_method = method
					send method
				end
			end
		end

		def assert(test=false, label=nil)
			if !test
				print "\nFailed  : #{self.class.name}.#{@current_method} #{label}\n"
			end
		end

		def asserteq(expected, actual, label=nil)
			if expected != actual
				print "Failed  : #{self.class.name}.#{@current_method} #{label}\n"
				print "Expected: #{expected}\n"
				print "Actual  : #{actual}\n"
			end
		end

	end

end
