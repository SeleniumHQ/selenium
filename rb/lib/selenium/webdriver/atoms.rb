module Selenium
  module WebDriver
    module Atoms

      private

      def read_atom(function)
        File.read(File.expand_path("../atoms/#{function}.js", __FILE__))
      end

      def execute_atom(function_name, *arguments)
        script = "return (%s).apply(null, arguments)" % read_atom(function_name)
        execute_script(script, *arguments)
      end

    end # Atoms
  end # WebDriver
end # Selenium
