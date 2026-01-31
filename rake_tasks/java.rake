# frozen_string_literal: true

require 'base64'
require 'json'
require 'net/http'

# use #java_release_targets to access this list
JAVA_RELEASE_TARGETS = %w[
  //java/src/org/openqa/selenium/chrome:chrome.publish
  //java/src/org/openqa/selenium/chromium:chromium.publish
  //java/src/org/openqa/selenium/devtools/v143:v143.publish
  //java/src/org/openqa/selenium/devtools/v144:v144.publish
  //java/src/org/openqa/selenium/devtools/v142:v142.publish
  //java/src/org/openqa/selenium/edge:edge.publish
  //java/src/org/openqa/selenium/firefox:firefox.publish
  //java/src/org/openqa/selenium/grid/sessionmap/jdbc:jdbc.publish
  //java/src/org/openqa/selenium/grid/sessionmap/redis:redis.publish
  //java/src/org/openqa/selenium/grid:bom-dependencies.publish
  //java/src/org/openqa/selenium/grid:bom.publish
  //java/src/org/openqa/selenium/grid:grid.publish
  //java/src/org/openqa/selenium/ie:ie.publish
  //java/src/org/openqa/selenium/json:json.publish
  //java/src/org/openqa/selenium/manager:manager.publish
  //java/src/org/openqa/selenium/os:os.publish
  //java/src/org/openqa/selenium/remote/http:http.publish
  //java/src/org/openqa/selenium/remote:remote.publish
  //java/src/org/openqa/selenium/safari:safari.publish
  //java/src/org/openqa/selenium/support:support.publish
  //java/src/org/openqa/selenium:client-combined.publish
  //java/src/org/openqa/selenium:core.publish
].freeze

def java_version
  File.foreach('java/version.bzl') do |line|
    return line.split('=').last.strip.tr('"', '') if line.include?('SE_VERSION')
  end
end

def java_release_targets
  unless @targets_verified
    verify_java_release_targets
    @targets_verified = true
  end

  JAVA_RELEASE_TARGETS
end

def verify_java_release_targets
  query = 'kind(maven_publish, set(//java/... //third_party/...))'
  current_targets = []

  Bazel.execute('query', [], query) do |output|
    current_targets = output.lines.map(&:strip).reject(&:empty?).select { |line| line.start_with?('//') }
  end

  obsolete_targets = JAVA_RELEASE_TARGETS - current_targets
  unlisted_targets = current_targets - JAVA_RELEASE_TARGETS

  return if obsolete_targets.empty? && unlisted_targets.empty?

  error_message = 'Java release targets are out of sync with Bazel query results.'

  unless obsolete_targets.empty?
    error_message += "\nObsolete targets (in list but not in Bazel): #{obsolete_targets.join(', ')}"
  end

  unless unlisted_targets.empty?
    error_message += "\nMissing targets (in Bazel but not in list): #{unlisted_targets.join(', ')}"
  end

  raise error_message
end

def sonatype_api_post(url, token)
  uri = URI(url)
  req = Net::HTTP::Post.new(uri)
  req['Authorization'] = "Basic #{token}"

  res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
  raise "Sonatype API error (#{res.code}): #{res.body}" unless res.is_a?(Net::HTTPSuccess)

  res.body.to_s.empty? ? {} : JSON.parse(res.body)
end

def read_m2_user_pass
  settings_path = File.join(Dir.home, '.m2', 'settings.xml')
  unless File.exist?(settings_path)
    warn "Maven settings file not found at #{settings_path}"
    return
  end

  puts 'Maven environment variables not set, inspecting ~/.m2/settings.xml.'
  settings = File.read(settings_path)
  found_section = false
  settings.each_line do |line|
    if !found_section
      found_section = line.include? '<id>central</id>'
    elsif line.include?('<username>')
      ENV['MAVEN_USER'] = line[%r{<username>(.*?)</username>}, 1]
    elsif line.include?('<password>')
      ENV['MAVEN_PASSWORD'] = line[%r{<password>(.*?)</password>}, 1]
    end
    break if ENV['MAVEN_PASSWORD'] && ENV['MAVEN_USER']
  end
end

def sonatype_auth_token
  read_m2_user_pass unless ENV['MAVEN_PASSWORD'] && ENV['MAVEN_USER']
  Base64.strict_encode64("#{ENV.fetch('MAVEN_USER')}:#{ENV.fetch('MAVEN_PASSWORD')}")
end

def trigger_sonatype_validation(token)
  puts 'Triggering Sonatype validation...'
  uri = URI('https://ossrh-staging-api.central.sonatype.com/manual/upload/defaultRepository/org.seleniumhq')

  req = Net::HTTP::Post.new(uri)
  req['Authorization'] = "Basic #{token}"
  req['Accept'] = '*/*'
  req['Content-Length'] = '0'

  begin
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true,
                                                  open_timeout: 10, read_timeout: 180) do |http|
      http.request(req)
    end
  rescue Net::ReadTimeout, Net::OpenTimeout => e
    warn <<~MSG
      Request timed out waiting for deployment ID.
      The deployment may still have been created on the server.
      Check https://central.sonatype.com/publishing/deployments for pending deployments,
      then run: ./go java:release <deployment_id>
    MSG
    raise e
  end

  unless res.is_a?(Net::HTTPSuccess)
    warn "Failed to get deployment ID (HTTP #{res.code}): #{res.body}"
    exit(1)
  end

  res.body.strip
end

def poll_and_publish_deployment(deployment_id, token)
  encoded_id = URI.encode_www_form_component(deployment_id.strip)
  status = {}
  max_attempts = 60
  delay = 5

  max_attempts.times do |attempt|
    status = sonatype_api_post("https://central.sonatype.com/api/v1/publisher/status?id=#{encoded_id}", token)
    state = status['deploymentState']
    puts "Deployment state: #{state}"

    case state
    when 'VALIDATED', 'PUBLISHED' then break
    when 'FAILED' then raise "Deployment failed: #{status['errors']}"
    end
    sleep(delay) unless attempt == max_attempts - 1
  rescue StandardError => e
    raise if e.message.start_with?('Deployment failed')

    warn "API error (attempt #{attempt + 1}/#{max_attempts}): #{e.message}"
    sleep(delay) unless attempt == max_attempts - 1
  end

  state = status['deploymentState']
  return if state == 'PUBLISHED'

  raise "Timed out after #{(max_attempts * delay) / 60} minutes waiting for validation" unless state == 'VALIDATED'

  expected = java_release_targets.size
  actual = status['purls']&.size || 0
  if actual != expected
    raise "Expected #{expected} packages but found #{actual}. " \
          'Drop the deployment at https://central.sonatype.com/publishing/deployments and redeploy.'
  end

  puts 'Publishing deployed packages...'
  sonatype_api_post("https://central.sonatype.com/api/v1/publisher/deployment/#{encoded_id}", token)
  puts "Published! Deployment ID: #{deployment_id}"
end

desc 'Build Java Client Jars'
task :build do |_task, arguments|
  java_release_targets.each { |target| Bazel.execute('build', arguments.to_a, target) }
end

desc 'Build the selenium client jars'
task :client do |_task, arguments|
  Bazel.execute('build', arguments.to_a, '//java/src/org/openqa/selenium:client-combined')
end

desc 'Build Grid Server'
task :grid do |_task, arguments|
  Bazel.execute('build', arguments.to_a, '//java/src/org/openqa/selenium/grid:executable-grid')
end

desc 'Package Java bindings and grid into releasable packages and stage for release'
task :package do |_task, arguments|
  args = arguments.to_a.empty? ? ['--config=release'] : arguments.to_a
  Bazel.execute('build', args, '//java/src/org/openqa/selenium:client-zip')
  Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:server-zip')
  Bazel.execute('build', args, '//java/src/org/openqa/selenium/grid:executable-grid')

  mkdir_p 'build/dist'
  Dir.glob('build/dist/*{java,server}*').each { |file| FileUtils.rm_f(file) }

  FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/server-zip.zip',
                 "build/dist/selenium-server-#{java_version}.zip")
  FileUtils.chmod(0o644, "build/dist/selenium-server-#{java_version}.zip")
  FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/client-zip.zip',
                 "build/dist/selenium-java-#{java_version}.zip")
  FileUtils.chmod(0o644, "build/dist/selenium-java-#{java_version}.zip")
  FileUtils.copy('bazel-bin/java/src/org/openqa/selenium/grid/selenium',
                 "build/dist/selenium-server-#{java_version}.jar")
  FileUtils.chmod(0o755, "build/dist/selenium-server-#{java_version}.jar")
end

desc 'Validate Java release credentials'
task :check_credentials do |_task, arguments|
  nightly = arguments.to_a.include?('nightly')

  has_env = (ENV['MAVEN_USER'] || ENV.fetch('SEL_M2_USER',
                                            nil)) && (ENV['MAVEN_PASSWORD'] || ENV.fetch('SEL_M2_PASS', nil))
  settings = File.join(Dir.home, '.m2', 'settings.xml')
  has_file = File.exist?(settings) && File.read(settings).include?('<id>central</id>')
  unless has_env || has_file
    raise 'Missing Maven credentials: set MAVEN_USER/MAVEN_PASSWORD or configure ~/.m2/settings.xml'
  end

  next if nightly

  has_gpg = system('which gpg >/dev/null 2>&1') || system('where gpg >NUL 2>&1')
  raise 'Missing GPG: gpg command not found (required for signing releases)' unless has_gpg
end

desc 'Deploy all jars to Maven (pass deployment_id to retry a failed publish)'
task :release do |_task, arguments|
  args = arguments.to_a
  nightly = args.delete('nightly')
  deployment_id = args.first

  Rake::Task['java:check_credentials'].invoke(*(nightly ? ['nightly'] : []))

  ENV['MAVEN_USER'] ||= ENV.fetch('SEL_M2_USER', nil)
  ENV['MAVEN_PASSWORD'] ||= ENV.fetch('SEL_M2_PASS', nil)
  token = sonatype_auth_token

  # Retry mode: just poll and publish an existing deployment
  if deployment_id
    puts "Retrying deployment: #{deployment_id}"
    poll_and_publish_deployment(deployment_id, token)
    next
  end

  repo_domain = 'central.sonatype.com'
  repo = if nightly
           "#{repo_domain}/repository/maven-snapshots"
         else
           "ossrh-staging-api.#{repo_domain}/service/local/staging/deploy/maven2/"
         end
  ENV['MAVEN_REPO'] = "https://#{repo}"
  ENV['GPG_SIGN'] = (!nightly).to_s

  if nightly
    puts 'Updating Java version to nightly...'
    Rake::Task['java:version'].invoke('nightly')
  end

  puts 'Packaging Java artifacts...'
  Rake::Task['java:package'].invoke('--config=release')
  Rake::Task['java:build'].invoke('--config=release')

  puts "Releasing Java artifacts to Maven repository at '#{ENV.fetch('MAVEN_REPO', nil)}'"
  java_release_targets.each { |target| Bazel.execute('run', ['--config=release'], target) }

  next if nightly

  deployment_id = trigger_sonatype_validation(token)
  puts "Got deployment ID: #{deployment_id}"
  poll_and_publish_deployment(deployment_id, token)
end

desc 'Verify Java packages are published on Maven Central'
task :verify do
  SeleniumRake.verify_package_published("https://repo1.maven.org/maven2/org/seleniumhq/selenium/selenium-java/#{java_version}/selenium-java-#{java_version}.pom")
end

desc 'Install jars to local m2 directory'
task :install do
  java_release_targets.each do |p|
    Bazel.execute('run',
                  ['--stamp',
                   '--define',
                   "maven_repo=file://#{Dir.home}/.m2/repository",
                   '--define',
                   'gpg_sign=false'],
                  p)
  end
end

desc 'Generate and stage Java documentation'
task :docs do |_task, arguments|
  if java_version.include?('SNAPSHOT') && !arguments.to_a.include?('force')
    abort('Aborting documentation update: snapshot versions should not update docs.')
  end

  Rake::Task['java:docs_generate'].invoke

  FileUtils.rm_rf('build/docs/api/java')
  FileUtils.mkdir_p('build/docs/api/java')
  out = 'bazel-bin/java/src/org/openqa/selenium/grid/all-javadocs.jar'

  cmd = %(cd build/docs/api/java && jar xf "../../../../#{out}" 2>&1)
  cmd = cmd.tr('/', '\\').tr(':', ';') if /mswin|msys|mingw32/.match?(RbConfig::CONFIG['host_os'])
  raise 'could not unpack javadocs' unless system(cmd)

  File.open('build/docs/api/java/stylesheet.css', 'a') do |file|
    file.write(<<~STYLE
      /* Custom selenium-specific styling */
      .blink {
        animation: 2s cubic-bezier(0.5, 0, 0.85, 0.85) infinite blink;
      }

      @keyframes blink {
        50% {
          opacity: 0;
        }
      }

    STYLE
              )
  end
end

desc 'Generate Java documentation without staging'
task :docs_generate do
  puts 'Generating Java documentation'
  Bazel.execute('build', [], '//java/src/org/openqa/selenium/grid:all-javadocs')
end

desc 'Update Maven dependencies'
task :update do
  puts 'Updating Maven dependencies'
  # Make sure things are in a good state to start with
  Rake::Task['java:pin'].invoke

  file_path = 'MODULE.bazel'
  content = File.read(file_path)
  output = nil
  Bazel.execute('run', [], '@maven//:outdated') do |out|
    output = out
  end

  versions = output.scan(/(\S+) \[\S+ -> (\S+)\]/).to_h
  versions.each do |artifact, version|
    if artifact.match?('graphql')
      # https://github.com/graphql-java/graphql-java/discussions/3187
      puts 'WARNING — Cannot automatically update graphql'
      next
    end
    content.sub!(/#{Regexp.escape(artifact)}:([\d.-]+(?:[-.]?[A-Za-z0-9]+)*)/, "#{artifact}:#{version}")
  end
  File.write(file_path, content)

  Rake::Task['java:pin'].invoke
end

desc 'Pin Maven dependencies'
task :pin do
  args = ['--action_env=RULES_JVM_EXTERNAL_REPIN=1']
  Bazel.execute('run', args, '@maven//:pin')
end

desc 'Update Java changelog'
task :changelogs do
  header = "v#{java_version}\n======"
  SeleniumRake.update_changelog(java_version, 'java', 'java/src/org/', 'java/CHANGELOG', header)
end

desc 'Update Java version'
task :version, [:version] do |_task, arguments|
  old_version = java_version
  new_version = SeleniumRake.updated_version(old_version, arguments[:version], '-SNAPSHOT')
  puts "Updating Java from #{old_version} to #{new_version}"

  file = 'java/version.bzl'
  text = File.read(file).gsub(old_version, new_version)
  File.open(file, 'w') { |f| f.puts text }
end

desc 'Format Java code with google-java-format'
task :format do
  puts '  Running google-java-format...'
  java_files = Dir.glob(File.join(Dir.pwd, 'java', '**', '*.java'))
  return if java_files.empty?

  args = ['--', '--replace'] + java_files
  Bazel.execute('run', args, '//scripts:google-java-format')
end

# ErrorProne runs at build time, SpotBugs runs as test targets in RBE
desc 'Run Java linter (docs only, other linting happens during build/test)'
task :lint do
  Rake::Task['java:docs_generate'].invoke
end
