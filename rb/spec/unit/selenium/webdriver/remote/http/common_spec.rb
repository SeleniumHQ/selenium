require File.expand_path("../../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Remote
      module Http
        describe Common do

          it "sends non-empty body header for POST requests without command data" do
            common = Common.new
            common.server_url = URI.parse("http://server")

            common.should_receive(:request).
                  with(:post, URI.parse("http://server/clear"),
                        hash_including("Content-Length" => "2"), "{}")

            common.call(:post, "clear", nil)
          end

        end # Common
      end # Http
    end # Remote
  end # WebDriver
end # Selenium