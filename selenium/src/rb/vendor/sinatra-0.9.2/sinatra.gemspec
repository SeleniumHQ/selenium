Gem::Specification.new do |s|
  s.specification_version = 2 if s.respond_to? :specification_version=
  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=

  s.name = 'sinatra'
  s.version = '0.9.2'
  s.date = '2009-05-18'

  s.description = "Classy web-development dressed in a DSL"
  s.summary     = "Classy web-development dressed in a DSL"

  s.authors = ["Blake Mizerany"]
  s.email = "sinatrarb@googlegroups.com"

  # = MANIFEST =
  s.files = %w[
    AUTHORS
    CHANGES
    LICENSE
    README.rdoc
    Rakefile
    compat/app_test.rb
    compat/application_test.rb
    compat/builder_test.rb
    compat/compat_test.rb
    compat/custom_error_test.rb
    compat/erb_test.rb
    compat/events_test.rb
    compat/filter_test.rb
    compat/haml_test.rb
    compat/helper.rb
    compat/mapped_error_test.rb
    compat/pipeline_test.rb
    compat/public/foo.xml
    compat/sass_test.rb
    compat/sessions_test.rb
    compat/streaming_test.rb
    compat/sym_params_test.rb
    compat/template_test.rb
    compat/use_in_file_templates_test.rb
    compat/views/foo.builder
    compat/views/foo.erb
    compat/views/foo.haml
    compat/views/foo.sass
    compat/views/foo_layout.erb
    compat/views/foo_layout.haml
    compat/views/layout_test/foo.builder
    compat/views/layout_test/foo.erb
    compat/views/layout_test/foo.haml
    compat/views/layout_test/foo.sass
    compat/views/layout_test/layout.builder
    compat/views/layout_test/layout.erb
    compat/views/layout_test/layout.haml
    compat/views/layout_test/layout.sass
    compat/views/no_layout/no_layout.builder
    compat/views/no_layout/no_layout.haml
    lib/sinatra.rb
    lib/sinatra/base.rb
    lib/sinatra/compat.rb
    lib/sinatra/images/404.png
    lib/sinatra/images/500.png
    lib/sinatra/main.rb
    lib/sinatra/showexceptions.rb
    lib/sinatra/test.rb
    lib/sinatra/test/bacon.rb
    lib/sinatra/test/rspec.rb
    lib/sinatra/test/spec.rb
    lib/sinatra/test/unit.rb
    sinatra.gemspec
    test/base_test.rb
    test/builder_test.rb
    test/contest.rb
    test/data/reload_app_file.rb
    test/erb_test.rb
    test/extensions_test.rb
    test/filter_test.rb
    test/haml_test.rb
    test/helper.rb
    test/helpers_test.rb
    test/mapped_error_test.rb
    test/middleware_test.rb
    test/options_test.rb
    test/render_backtrace_test.rb
    test/request_test.rb
    test/response_test.rb
    test/result_test.rb
    test/route_added_hook_test.rb
    test/routing_test.rb
    test/sass_test.rb
    test/server_test.rb
    test/sinatra_test.rb
    test/static_test.rb
    test/templates_test.rb
    test/test_test.rb
    test/views/error.builder
    test/views/error.erb
    test/views/error.haml
    test/views/error.sass
    test/views/hello.builder
    test/views/hello.erb
    test/views/hello.haml
    test/views/hello.sass
    test/views/hello.test
    test/views/layout2.builder
    test/views/layout2.erb
    test/views/layout2.haml
    test/views/layout2.test
  ]
  # = MANIFEST =

  s.test_files = s.files.select {|path| path =~ /^test\/.*_test.rb/}

  s.extra_rdoc_files = %w[README.rdoc LICENSE]
  s.add_dependency 'rack',    '>= 0.9.1'
  s.add_development_dependency 'shotgun', '>= 0.2',   '< 1.0'
  s.add_development_dependency 'rack-test', '>= 0.3.0'

  s.has_rdoc = true
  s.homepage = "http://sinatra.rubyforge.org"
  s.rdoc_options = ["--line-numbers", "--inline-source", "--title", "Sinatra", "--main", "README.rdoc"]
  s.require_paths = %w[lib]
  s.rubyforge_project = 'sinatra'
  s.rubygems_version = '1.1.1'
end
