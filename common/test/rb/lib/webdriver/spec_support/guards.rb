module WebDriver
  module SpecSupport
    module Guards

      # TODO: count and report guard invocations

      def not_compliant_on(opts = {}, &blk)
        yield unless opts.all? { |key, value| GlobalTestEnv.send(key) == value}
      end
      alias_method :deviates_on, :not_compliant_on

    end # Guards
  end # SpecSupport
end # WebDriver
