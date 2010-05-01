require 'java'
require 'test/unit'
require 'rubygems'
gem 'rake', '>= 0.8.0'
require 'rake'

class JavaJarTest < Test::Unit::TestCase
  def setup
    Rake::Task.clear
    @app = Rake::Application.new
    
    @handler = JavaJar.new
  end
   
  def test_can_build_name_from_path
    name = @handler.target_name(".", "common")
    assert_equal "//:common", name  # which looks funny
    
    name = @handler.target_name("foo/bar", "baz")
    assert_equal "//foo/bar:baz", name
    
    name = @handler.target_name("./foo/bar", "baz")
    assert_equal "//foo/bar:baz", name
  end
  
  def test_can_even_cope_with_windows_paths
    name = @handler.target_name("food\\cheese", "cheddar")
    assert_equal "//food/cheese:cheddar", name
  end
  
  def test_should_be_able_to_create_simple_task
    args = {:name => "common"}
    
    @handler.handle("example", args)
    
    assert Rake::Task.task_defined? "//example:common"
    t = Rake::Task["//example:common"]
  end
  
  def test_task_should_have_file_deps_declared
    args = {:name => "common", :deps => ["foo.jar"]}
    
    @handler.handle("example", args)
    t = Rake::Task["//example:common"]        
    
    assert t.prerequisites.include? "example/foo.jar"
  end
  
  def test_should_have_full_path_deps_added
    args = {:name => "tests", :deps => ["//common:common"]}
    
    @handler.handle("example", args)
    t = Rake::Task["//example:tests"]        
    
    assert t.prerequisites.include? "//common:common"
  end
  
  def test_symbol_dependencies_are_local_targets
    args = {:name => "tests", :deps => [:foo]}
    
    @handler.handle("example", args)
    t = Rake::Task["//example:tests"]        
    
    assert t.prerequisites.include? "//example:foo"
  end
  
  def test_can_build_classpath_from_direct_dependencies
    task "//example:all" => ["junit.jar"]
    
    cp = ClassPath.new("//example:all")
    
    assert_equal 1, cp.length
  end
  
  def test_will_walk_deps_to_collect_classpath
    task "//example:all" => ["junit.jar"]
    args = {:name => "tests", :deps => [:all, "other.jar"]}
    
    @handler.handle("example", args)

    cp = ClassPath.new("//example:tests")
    
    assert_equal 2, cp.length    
  end
  
  def test_should_remove_duplicates_from_classpath
    task "//example:all" => ["example/junit.jar"]
    args = {:name => "tests", :deps => [:all, "junit.jar"]}    
    @handler.handle("example", args)

    cp = ClassPath.new("//example:tests")
    
    assert_equal 1, cp.length
  end
  
  def test_should_add_srcs_arg_as_sources_for_task
    args = {:name => "all", :srcs => ["Foo.java"]}
    @handler.handle("example", args)

    t = Rake::Task["//example:all"]
    
    assert_equal ["Foo.java"], t.sources
  end
  
  def test_temporary_output_path_should_be_based_on_target_name
    args = {:name => "all", :srcs => ["Bar.java", "Baz.java"]}
    @handler.handle("example", args)
    
    t = Rake::Task["//example:all"]    
    javac = Javac.new(t)
    
    assert_equal "build/example/all.jar_temp", javac.temp_dir
  end
  
  def test_should_create_basic_javac_command_line
    args = {:name => "all", :deps => [ "junit.jar" ], :srcs => ["Bar.java", "Baz.java"]}
    @handler.handle("example", args)
    
    t = Rake::Task["//example:all"]    
    javac = Javac.new(t)
    
    p javac.to_s
  end
end