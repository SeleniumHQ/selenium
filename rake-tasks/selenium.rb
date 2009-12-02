class Selenium < BaseGenerator
  def selenium_test(args)
    create_deps_(args[:name], args)
    
    classpath = Java.new().build_classpath_(args[:name]).collect do |c|
      c.to_s =~ /\.jar/ ? c : nil
    end
    classpath.uniq!
    
    file "#{args[:name]}_never_there" do
      cmd = "java -cp #{classpath.join(classpath_separator?)} org.openqa.selenium.server.htmlrunner.HTMLLauncher "
      cmd += "build #{args[:browser]} TestSuite.html #{args[:browser]}.results"
      sh cmd, :verbose => true
    end
    
    task args[:name] => "#{args[:name]}_never_there"
  end
end

def selenium_test(args)
  Selenium.new().selenium_test(args)
end