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
			print "\nFailed : #{self.class.name}.#{@current_method} #{label}\n"
		end
	end

end

class WasRun < Test
	
	attr_reader :wasrun
	
	def test_stuff
		@wasrun = true
	end
		
end

class TestTest < Test
	def test_run
		test = WasRun.new
		assert !test.wasrun, 'not yet run' 
		test.run
		assert test.wasrun, 'run'
	end
end

TestTest.new.run
