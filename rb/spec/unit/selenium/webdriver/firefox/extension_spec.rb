require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Firefox

      describe Extension do
        before do
          File.stub(:exist? => true)
        end

        let(:extension) {
          ext = Extension.new('/foo')
          def ext.read_id(dir); read_id_from_install_rdf(dir); end

          ext
        }

        it 'finds the rdf extension id as attribute' do
          File.stub(:read).with('/foo/install.rdf').and_return <<-XML
            <?xml version="1.0"?>
            <RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#">
                <Description about="urn:mozilla:install-manifest">
                    <em:id>{f5198635-4eb3-47a5-b6a5-366b15cd2107}</em:id>
                </Description>
            </RDF>
          XML

          extension.read_id('/foo').should == '{f5198635-4eb3-47a5-b6a5-366b15cd2107}'
        end

        it 'finds the rdf extension id as text' do
          File.stub(:read).with('/foo/install.rdf').and_return <<-XML
            <?xml version="1.0"?>
            <RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#">
                <Description about="urn:mozilla:install-manifest" em:id="{f5198635-4eb3-47a5-b6a5-366b15cd2107}">
                </Description>
            </RDF>
          XML

          extension.read_id('/foo').should == '{f5198635-4eb3-47a5-b6a5-366b15cd2107}'
        end

        it 'raises if the node id is not found' do
          File.stub(:read).with('/foo/install.rdf').and_return <<-XML
            <?xml version="1.0"?>
            <RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#"></RDF>
          XML

          expect { extension.read_id('/foo') }.to raise_error(Error::WebDriverError)
        end

      end

    end # Firefox
  end # WebDriver
end # Selenium

