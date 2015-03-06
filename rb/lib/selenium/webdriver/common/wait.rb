module Selenium
  module WebDriver
    class Wait

      DEFAULT_TIMEOUT  = 5
      DEFAULT_INTERVAL = 0.2

      #
      # Create a new Wait instance
      #
      # @param [Hash] opts Options for this instance
      # @option opts [Numeric] :timeout (5) Seconds to wait before timing out.
      # @option opts [Numeric] :interval (0.2) Seconds to sleep between polls.
      # @option opts [String] :message Exception mesage if timed out.
      # @option opts [Array, Exception] :ignore Exceptions to ignore while polling (default: Error::NoSuchElementError)
      #

      def initialize(opts = {})
        @timeout  = opts.fetch(:timeout, DEFAULT_TIMEOUT)
        @interval = opts.fetch(:interval, DEFAULT_INTERVAL)
        @message  = opts[:message]
        @ignored  = Array(opts[:ignore] || Error::NoSuchElementError)
      end


      #
      # Wait until the given block returns a true value.
      #
      # @raise [Error::TimeOutError]
      # @return [Object] the result of the block
      #

      def until(&blk)
        end_time = Time.now + @timeout
        last_error = nil

        until Time.now > end_time
          begin
            result = yield
            return result if result
          rescue *@ignored => last_error
            # swallowed
          end

          sleep @interval
        end


        if @message
          msg = @message.dup
        else
          msg = "timed out after #{@timeout} seconds"
        end

        msg << " (#{last_error.message})" if last_error

        raise Error::TimeOutError, msg
      end

    end # Wait
  end # WebDriver
end # Selenium

