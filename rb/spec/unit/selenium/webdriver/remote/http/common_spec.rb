require File.expand_path("../../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Remote
      module Http
        describe Common do

          it "sends Content-Length=0 header for POST requests without a command in the body" do
            common = Common.new
            common.server_url = URI.parse("http://server")

            common.should_receive(:request).
                  with(:post, URI.parse("http://server/clear"),
                        hash_including("Content-Length" => "0"), nil)

            common.call(:post, "clear", nil)
          end

        end # Common
      end # Http
    end # Remote
  end # WebDriver
end # Selenium