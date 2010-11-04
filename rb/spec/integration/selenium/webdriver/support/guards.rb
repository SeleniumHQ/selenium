module Selenium
  module WebDriver
    module SpecSupport
      module Guards

        class << self
          def guards
            @guards ||= Hash.new { |hash, key| hash[key] = [] }
          end

          def record(guard_name, opts, data)
            opts = current_env.merge(opts)
            key = "#{opts[:browser]}/#{opts[:driver]}/#{opts[:platform]}"
            guards[key] << [guard_name, data]
          end

          def report
            gs = guards["#{GlobalTestEnv.browser}/#{GlobalTestEnv.driver}/#{Platform.os}"]

            print "\n\nSpec guards for this implementation: "

            if gs.empty?
             puts "none."
            else
              puts
              gs.each do |guard_name, data|
                puts "\t#{guard_name.to_s.ljust(20)}: #{data.inspect}"
              end
            end
          end

          def current_env
            {:browser => GlobalTestEnv.browser, :driver => GlobalTestEnv.driver, :platform => Platform.os}
          end

          def env_matches?(env)
            env.all? do |key, value|
              if value.kind_of?(Array)
                value.include? current_env[key]
              else
                value == current_env[key]
              end
            end
          end
        end

        def not_compliant_on(opts = {}, &blk)
          Guards.record(:not_compliant, opts, :file => caller.first)
          yield unless Guards.env_matches?(opts)
        end

        def deviates_on(opts = {}, &blk)
          Guards.record(:deviates, opts, :file => caller.first)
          yield unless Guards.env_matches?(opts)
        end

        def compliant_on(opts = {}, &blk)
          Guards.record(:compliant_on, opts, :file => caller.first)
          yield if Guards.env_matches?(opts)
        end

      end # Guards
    end # SpecSupport
  end # WebDriver
end # Selenium
