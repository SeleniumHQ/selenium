module Selenium
  module WebDriver

    #
    # @api private
    #

    module DriverExtensions
      module UploadsFiles

        #
        # Set the file detector to pass local files to a remote WebDriver.
        #
        # The detector is an object that responds to #call, and when called
        # will determine if the given string represents a file. If it does,
        # the path to the file on the local file system should be returned,
        # otherwise nil or false.
        #
        # Example:
        #
        #     driver = Selenium::WebDriver.for :remote
        #     driver.file_detector = lambda do |args|
        #        # args => ["/path/to/file"]
        #        str = args.first.to_s
        #        str if File.exist?(str)
        #     end
        #
        #     driver.find_element(:id => "upload").send_keys "/path/to/file"
        #
        # By default, no file detection is performed.
        #
        # @api public
        #

        def file_detector=(detector)
          unless detector.nil? or detector.respond_to? :call
            raise ArgumentError, "detector must respond to #call"
          end

          bridge.file_detector = detector
        end

      end # UploadsFiles
    end # DriverExtensions
  end # WebDriver
end # Selenium
