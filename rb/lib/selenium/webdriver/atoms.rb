module Selenium
  module WebDriver
    module Atoms

      ATOMS = {getAttribute: File.read(File.expand_path("../atoms/getAttribute.js", __FILE__))}

      private

      def execute_atom(function_name, *arguments)
        script = "return (%s).apply(null, arguments)" % ATOMS.fetch(function_name)
        execute_script(script, *arguments)
      end

    end # Atoms
  end # WebDriver
end # Selenium
