# frozen_string_literal: true

require 'git'
require 'net/http'
require 'fileutils'

# Shared utilities used by language-specific rake tasks
module SeleniumRake
  class << self
    attr_accessor :git
  end

  RELEASE_CREDENTIALS = {
    java: {
      env: [%w[MAVEN_USER SEL_M2_USER], %w[MAVEN_PASSWORD SEL_M2_PASS]],
      file: -> { File.exist?("#{Dir.home}/.m2/settings.xml") && File.read("#{Dir.home}/.m2/settings.xml").include?('<id>central</id>') }
    },
    java_gpg: {cmd: 'gpg'},
    dotnet: {env: [%w[NUGET_API_KEY]]},
    dotnet_nightly: {env: [%w[GITHUB_TOKEN]]}
  }.freeze

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

  def self.update_changelog(version, language, path, changelog, header)
    tag = previous_tag(version, language)
    bullet = language == 'javascript' ? '-' : '*'
    skip_patterns = /^(bump|update.*version|Bumping to nightly)/i
    tags_to_remove = /\[(dotnet|rb|py|java|js|rust)\]:?\s?/

    command = "git log #{tag}...HEAD --pretty=format:'%s' --reverse -- #{path}"
    log = `#{command}`

    entries = log.lines
                 .map(&:strip)
                 .grep(/\(#\d+\)/)
                 .grep_v(skip_patterns)
                 .map { |line| line.gsub(tags_to_remove, '') }
                 .map { |line| "#{bullet} #{line}" }
                 .join("\n")

    content = File.read(changelog)
    File.write(changelog, "#{header}\n#{entries}\n\n#{content}")
    git.add(changelog)
  end

  def self.update_gh_pages(force: true)
    puts 'Switching to gh-pages branch...'
    git.fetch('https://github.com/seleniumhq/selenium.git', {ref: 'gh-pages'})

    unless force
      puts 'Stash changes that are not docs...'
      git.lib.send(:command, 'stash', ['push', '-m', 'stash wip', '--', ':(exclude)build/docs/api/'])
    end

    git.checkout('gh-pages', force: force)

    updated = false

    %w[java rb py dotnet javascript].each do |language|
      source = "build/docs/api/#{language}"
      destination = "docs/api/#{language}"

      next unless Dir.exist?(source) && !Dir.empty?(source)

      puts "Updating documentation for #{language}..."
      FileUtils.rm_rf(destination)
      FileUtils.mv(source, destination)

      git.add(destination)
      updated = true
    end

    puts(updated ? 'Documentation staged. Ready for commit.' : 'No documentation changes found.')
  end

  def self.verify_package_published(url)
    puts "Verifying #{url}..."
    uri = URI(url)
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') { |http| http.request(Net::HTTP::Get.new(uri)) }
    raise "Package not published: #{url}" unless res.is_a?(Net::HTTPSuccess)

    puts 'Verified!'
  end

  def self.credential_valid?(cred)
    has_env = cred[:env]&.all? { |vars| vars.any? { |v| ENV.fetch(v, nil) } }
    has_file = cred[:file]&.call
    has_cmd = cred[:cmd] && (system('which', cred[:cmd], out: File::NULL, err: File::NULL) || system('where', cred[:cmd], out: File::NULL, err: File::NULL))
    has_env || has_file || has_cmd
  end

  def self.check_credentials(langs)
    missing = langs.select { |lang| RELEASE_CREDENTIALS[lang] && !credential_valid?(RELEASE_CREDENTIALS[lang]) }
    raise "Missing credentials: #{missing.join(', ')}" if missing.any?
  end
end
