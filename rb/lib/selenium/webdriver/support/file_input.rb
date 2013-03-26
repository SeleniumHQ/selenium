module Selenium
  module WebDriver
    module Support
      class FileInput

        #
        # @param [Element] element The select element to use
        #

        def initialize(element)
          tag_name = element.tag_name

          unless tag_name.downcase == "input"
            raise ArgumentError, "unexpected tag name #{tag_name.inspect}"
          end
          
          tag_type = element.attribute(:type)
          
          unless tag_type.downcase == "file"
            raise ArgumentError, "unexpected input type #{tag_type}"
          end
          

          @element = element
          @multi   = ![nil, "false"].include?(element.attribute(:multiple))
        end

        #
        # Does this select element support selecting multiple options?
        #
        # @return [Boolean]
        #

        def multiple?
          @multi
        end

        #
        # Attach files to the file input
        #
        # @param [String, Pathname, File, Array]
        #
        def attach_files(*files)
          filenames = files.flatten.map do |f| 
            if f.respond_to? :path
              f.path.to_s
            else
              f.to_s
            end
          end

          if !multiple? and filenames.length > 1
            raise ArgumentError, "too many files to attach to a non-multiple file input"
          end
          
          @element.send_keys(*filenames)
        end
                
      end # FileInput
    end
  end
end
