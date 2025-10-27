# frozen_string_literal: true

source 'https://rubygems.org'
Dir["#{__dir__}/*.gemspec"].each do |spec|
  gemspec name: File.basename(spec, '.gemspec')
end

# ActiveSupport 8.x requires Ruby 3.2+ (dependency of Steep)
gem 'activesupport', '~> 7.0', require: false, platforms: %i[mri mingw x64_mingw]
gem 'curb', '~> 1.0.5', require: false, platforms: %i[mri mingw x64_mingw]
gem 'debug', '~> 1.7', require: false, platforms: %i[mri mingw x64_mingw]
gem 'steep', '~> 1.5.0', require: false, platforms: %i[mri mingw x64_mingw]
