require 'rake-tasks/downloader'

class GeckoSDKs
  include ::Rake::DSL if defined?(::Rake::DSL)

  def initialize
    @sdks = []

    yield self if block_given?

    @sdks.each do |path, url, md5|
      define_rule(path, url, md5)
    end
  end

  def add(path, url, md5 = nil)
    @sdks << [path, url, md5]
  end

  private

  def define_rule(path, url, md5 = nil)
    download_task = file(path) do
      mkdir_p path
      next if offline? || !platform_matches?(path)

      begin
        if md5
          sdk = CachingDownloader.fetch(url, md5)
        else
          sdk = Downloader.fetch(url)
        end

        destination = File.dirname path
        unpack sdk, destination

        # The directory was created - but for the move to replace it,
        # it must be erased first.
        rm_rf path
        mv File.join(destination, "xulrunner-sdk"), path
      rescue StandardError, Timeout::Error => ex
        # ignore errors - dependant targets will fall back to prebuilts
        $stderr.puts "Failed to download the Gecko 2 SDK - manually delete #{path} to retry. (#{ex.inspect})"

        next
      ensure
        rm_rf sdk if !md5 && sdk && File.exist?(sdk)
      end
    end

    # this really shouldn't be necessary.
    if Platform.windows?
      file path.gsub("/", "\\") => download_task
    end
  end

  def platform_matches?(path)
    case path
    when /linux/
      Platform.linux?
    when /mac/
      Platform.mac?
    when /win32/
      Platform.windows?
    else
      raise "unknown platform #{path.inspect}"
    end
  end

  def offline?
    ENV['offline'] == "true"
  end

  def unpack(path, destination)
    if Platform.windows?
      require 'third_party/jruby/rubyzip.jar' if RUBY_PLATFORM == "java"
      require 'zip/zip'

      puts "Unzipping: #{File.basename path}"
      Zip::ZipFile.open(path) do |zip|
        zip.each do |entry|
          to      = File.join(destination, entry.name)
          dirname = File.dirname(to)

          FileUtils.mkdir_p dirname unless File.exist? dirname
          zip.extract(entry, to)
        end
      end
    else
      puts "Unpacking: #{File.basename path} to #{destination}"
      sh "tar", "jxf", path, "-C", destination
    end
  end
end

