module Selenium
  module WebDriver
    module SpecSupport
      module Guards

        class << self
          def guards
            @guards ||= Hash.new { |hash, key| hash[key] = [] }
          end

          def record(guard_name, options, data)
            options.each do |opts|
              opts = current_env.merge(opts)
              key = opts.values_at(*current_env.keys).join('.')
              guards[key] << [guard_name, data]
            end
          end

          def report
            key = [
              GlobalTestEnv.browser,
              GlobalTestEnv.driver,
              Platform.os,
              GlobalTestEnv.native_events?
            ].join(".")

            gs = guards[key]

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
            {
              :browser        => GlobalTestEnv.browser,
              :driver         => GlobalTestEnv.driver,
              :platform       => Platform.os,
              :native         => GlobalTestEnv.native_events?,
              :window_manager => !!ENV['DESKTOP_SESSION']
            }
          end

          #
          # not_compliant_on :browser => [:firefox, :chrome]
          #   - guard this spec for both firefox and chrome
          #
          # not_compliant_on {:browser => :chrome, :platform => :macosx}, {:browser => :opera}
          #   - guard this spec for Chrome on OSX and Opera on any OS

          def env_matches?(opts)
            opts.any? { |env|
              env.all? { |key, value|
                if value.kind_of?(Array)
                  value.include? current_env[key]
                else
                  value == current_env[key]
                end
              }
            }
          end
        end

        def not_compliant_on(*opts, &blk)
          Guards.record(:not_compliant, opts, :file => caller.first)
          yield if GlobalTestEnv.unguarded? || !Guards.env_matches?(opts)
        end

        def compliant_on(*opts, &blk)
          Guards.record(:compliant_on, opts, :file => caller.first)
          yield if GlobalTestEnv.unguarded? || Guards.env_matches?(opts)
        end

        alias_method :not_compliant_when, :not_compliant_on
        alias_method :compliant_when,     :compliant_on

      end # Guards
    end # SpecSupport
  end # WebDriver
end # Selenium
