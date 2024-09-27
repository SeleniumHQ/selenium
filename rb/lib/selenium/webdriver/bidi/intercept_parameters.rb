module Selenium
  module WebDriver
    class BiDi
      class InterceptParameters
        def initialize(phases)
          @phases = []
          @url_patterns = []

          if phases.is_a?(Array)
            phases.each { |phase| @phases.push(phase) }
          else
            @phases.push(phases)
          end
        end

        def url_pattern(pattern)
          unless pattern.is_a?(UrlPattern)
            raise "Pattern must be an instance of UrlPattern. Received: '#{pattern}'"
          end

          @url_patterns.push(pattern.as_map.to_h)
          self
        end

        def url_patterns(patterns)
          patterns.each do |pattern|
            unless pattern.is_a?(UrlPattern)
              raise "Pattern must be an instance of UrlPattern. Received: '#{pattern}'"
            end

            @url_patterns.push(pattern.as_map.to_h)
          end

          self
        end

        def url_string_pattern(pattern)
          unless pattern.is_a?(String)
            raise "Pattern must be an instance of String. Received: '#{pattern}'"
          end

          @url_patterns.push({ type: 'string', pattern: pattern })
          self
        end

        def url_string_patterns(patterns)
          patterns.each do |pattern|
            unless pattern.is_a?(String)
              raise "Pattern must be an instance of String. Received: '#{pattern}'"
            end

            @url_patterns.push({ type: 'string', pattern: pattern })
          end

          self
        end

        def as_map
          map = {}
          map['phases'] = @phases
          map['urlPatterns'] = @url_patterns if @url_patterns.any?
          map
        end
      end
    end
  end
end
