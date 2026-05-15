# frozen_string_literal: true

require 'git'
require 'net/http'
require 'fileutils'

BINDING_TARGETS = {
  'java' => '//java/...',
  'py' => '//py/...',
  'rb' => '//rb/...',
  'dotnet' => '//dotnet/...',
  'javascript' => '//javascript/selenium-webdriver/...',
  'rust' => '//rust/...'
}.freeze

# Shared utilities used by language-specific rake tasks
module SeleniumRake
  BINDINGS = %w[ruby python javascript java dotnet].freeze

  class << self
    attr_accessor :git
  end

  # Parse a release tag like "selenium-4.28.0" or "selenium-4.28.1-ruby"
  # Returns { version:, language:, patch: } where language defaults to 'all'
  def self.parse_tag(tag)
    pattern = /^selenium-(\d+\.\d+\.\d+)(?:-(#{BINDINGS.join('|')}))?$/
    match = tag&.match(pattern)
    raise "Invalid tag format: #{tag}" unless match

    version = match[1]
    language = match[2] || 'all'
    patch = version.split('.')[2].to_i

    if patch.positive? && language == 'all'
      raise "Patch releases must specify a language (e.g., selenium-#{version}-ruby)"
    end
    raise 'Full releases (X.Y.0) cannot have a language suffix' if patch.zero? && language != 'all'

    {version: version, language: language, patch: patch}
  end

  def self.updated_version(current, desired = nil, nightly = nil)
    if !desired.nil? && desired != 'nightly'
      # If desired is present, return full 3 digit version
      desired.split('.').tap { |v| v << 0 while v.size < 3 }.join('.')
    elsif current.split(/\.|-/).size > 3
      # if current version is already nightly, just need to bump it; this will be noop for some languages
      pattern = /-?\.?(nightly|SNAPSHOT|dev|\d{12})\d*$/
      current.gsub(pattern, nightly)
    elsif current.split(/\.|-/).size == 3
      # if current version is not nightly, need to bump the version and make nightly
      "#{current.split(/\.|-/).tap { |i| (i[1] = i[1].to_i + 1) && (i[2] = 0) }.join('.')}#{nightly}"
    end
  end

  def self.previous_tag(current_version, language = nil)
    version = current_version.split(/\.|-/)
    if version.size > 3
      puts 'WARNING - Changelogs not updated when set to prerelease'
    elsif version[2].to_i > 1
      # specified as patch release
      patch_version = (version[2].to_i - 1).to_s
      "selenium-#{[[version[0]], version[1], patch_version].join('.')}-#{language}"
    elsif version[2] == '1'
      # specified as patch release; special case
      "selenium-#{[[version[0]], version[1], '0'].join('.')}"
    else
      minor_version = (version[1].to_i - 1)
      tags = git.tags.map(&:name)
      tag = language ? tags.reverse.find { |t| t.match?(/selenium-4\.#{minor_version}.*-#{language}/) } : nil
      tag || "selenium-#{[[version[0]], minor_version, '0'].join('.')}"
    end
  end

  def self.cdp_versions
    Dir.glob('common/devtools/chromium/v*/')
       .map { |d| File.basename(d) }
       .sort_by { |v| v.delete_prefix('v').to_i }
  end

  def self.update_changelog(version, language, path, changelog, header)
    tag = previous_tag(version, language)
    bullet = language == 'javascript' ? '-' : '*'
    skip_patterns = /^(bump|update.*version|Bumping to nightly)/i
    tags_to_remove = /\[(dotnet|rb|py|java|js|rust)\]:?\s?/

    command = "git log #{tag}...HEAD --pretty=format:'%s' --reverse -- #{path}"
    log = `#{command}`
    raise "Failed to generate changelog: #{command}" unless $CHILD_STATUS.success?

    entries = log.lines
                 .map(&:strip)
                 .grep(/\(#\d+\)/)
                 .grep_v(skip_patterns)
                 .map { |line| line.gsub(tags_to_remove, '') }
                 .map { |line| "#{bullet} #{line}" }
                 .join("\n")

    if version[-1] == '0' && language != 'rust'
      versions = cdp_versions.join(', ')
      cdp_line = "#{bullet} Support CDP versions: #{versions}"
      entries = entries.empty? ? cdp_line : "#{cdp_line}\n#{entries}"
    end

    content = File.read(changelog)
    File.write(changelog, "#{header}\n#{entries}\n\n#{content}")
  end

  def self.verify_package_published(url)
    puts "Verifying #{url}..."
    uri = URI(url)
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') { |http| http.request(Net::HTTP::Get.new(uri)) }
    raise "Package not published: #{url}" unless res.is_a?(Net::HTTPSuccess)

    puts 'Verified!'
  end
end
