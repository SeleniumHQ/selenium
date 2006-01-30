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

# Generate diagrams for PetSoar

require 'petsoar/actions-diagram'
require 'petsoar/components-diagram'

def generate_image(diagram, filename)
	basedir = '../../build/diagrams'
	dot_file = File.new(basedir + '/' + filename + '.txt', 'w')
	dot_file << diagram.to_s(true)
	dot_file.close
	print "Generating #{filename}.gif\n"
	if not system("../../bin/dot -Tgif -o#{basedir}/#{filename}.gif #{basedir}/#{filename}.txt")
		print "Could not run dot : " + $?
	end
end


# Diagram of action -> view -> action links

diagram = actions_diagram(
	'../config/xwork.xml',  # actions file
	views_dir = '../webapp/', # views dir
	['inventory/listpets.action', 'storefront/listpets.action'] # entry points
)
generate_image(diagram, 'actions')



# Diagram of component dependencies

diagram = components_diagram(
	'../config/components.xml', # components config
	'../config/xwork.xml'       # actions config
)
generate_image(diagram, 'components')
