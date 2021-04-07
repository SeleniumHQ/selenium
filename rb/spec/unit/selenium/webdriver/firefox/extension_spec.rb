# frozen_string_literal: true

# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require File.expand_path('../spec_helper', __dir__)

module Selenium
  module WebDriver
    module Firefox
      describe Extension do
        before do
          allow(File).to receive(:exist?).and_return(true)
        end

        let(:extension) do
          ext = Extension.new('/foo')
          def ext.read_id(dir)
            read_id_from_install_rdf(dir)
          end

          ext
        end

        it 'finds the rdf extension id as attribute' do
          allow(File).to receive(:read).with('/foo/install.rdf').and_return <<~XML
            <?xml version="1.0"?>
            <RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#">
                <Description about="urn:mozilla:install-manifest">
                    <em:id>{f5198635-4eb3-47a5-b6a5-366b15cd2107}</em:id>
                </Description>
            </RDF>
          XML

          expect(extension.read_id('/foo')).to eq('{f5198635-4eb3-47a5-b6a5-366b15cd2107}')
        end

        it 'finds the rdf extension id as text' do
          allow(File).to receive(:read).with('/foo/install.rdf').and_return <<~XML
            <?xml version="1.0"?>
            <RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#">
                <Description about="urn:mozilla:install-manifest" em:id="{f5198635-4eb3-47a5-b6a5-366b15cd2107}">
                </Description>
            </RDF>
          XML

          expect(extension.read_id('/foo')).to eq('{f5198635-4eb3-47a5-b6a5-366b15cd2107}')
        end

        it 'finds the rdf extension id regardless of namespace' do
          allow(File).to receive(:read).with('/foo/install.rdf').and_return <<~XML
            <?xml version="1.0"?>
            <r:RDF xmlns:r="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.mozilla.org/2004/em-rdf#">
                <r:Description about="urn:mozilla:install-manifest">
                    <id>{f5198635-4eb3-47a5-b6a5-366b15cd2107}</id>
                </r:Description>
            </r:RDF>
          XML

          expect(extension.read_id('/foo')).to eq('{f5198635-4eb3-47a5-b6a5-366b15cd2107}')
        end

        it 'raises if the node id is not found' do
          allow(File).to receive(:read).with('/foo/install.rdf').and_return <<~XML
            <?xml version="1.0"?>
            <RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#"></RDF>
          XML

          expect { extension.read_id('/foo') }.to raise_error(Error::WebDriverError)
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
