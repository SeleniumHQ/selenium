require 'uri'
require 'net/http'
require 'net/ftp'
require 'digest/md5'

class Downloader
  class Error < StandardError; end

  CL_RESET = Platform.windows? ? "\n" : "\r\e[0K"

  def self.fetch(source_url, destination_path = nil)
    if destination_path
      destination_dir = File.dirname destination_path
      FileUtils.mkdir_p(destination_dir) unless File.exist?(destination_dir)
    else
      tmpdir = Dir.mktmpdir("crazy-fun-download")
      destination_path = File.join(tmpdir, File.basename(source_url))
    end

    File.open(destination_path, "wb") do |io|
      new(source_url, io).download!
    end

    destination_path
  end

  def initialize(source, destination)
    raise ArgumentError, "destination must be an IO" unless destination.kind_of?(IO)

    @url         = URI.parse source
    @destination = destination
  end

  def download!
    case @url.scheme
    when 'ftp'
      ftp_download!
    when 'http', 'https'
      http_download!
    else
      raise Error, "unknown scheme: #{@url.scheme}"
    end

    complete_progress
  end

  private

  def net_http
    http_proxy = ENV['http_proxy'] || ENV['HTTP_PROXY']

    if http_proxy
      http_proxy = "http://#{http_proxy}" unless http_proxy.start_with?("http://")
      uri = URI.parse(http_proxy)

      Net::HTTP::Proxy(uri.host, uri.port)
    else
      Net::HTTP
    end
  end

  def http_download!
    resp = net_http.get_response(@url) do |response|
      total = response.content_length
      progress = 0
      segment_count = 0

      response.read_body do |segment|
        progress += segment.length
        segment_count += 1

        if segment_count % 15 == 0
          report_progress(progress, total)
          segment_count = 0
        end

        @destination.write(segment)
      end
    end

    unless resp.kind_of? Net::HTTPSuccess
      raise Error, "#{resp.code} for #{@url}"
    end
  end

  def ftp_download!
    raise Error, "no #path for #{@destination.inspect}" unless @destination.respond_to?(:path)

    Net::FTP.open(@url.host) do |ftp|
     ftp.login

     filename = @url.path
     total = ftp.size(filename)

     progress = 0
     segment_count = 0

     ftp.getbinaryfile(filename, @destination.path, 2048) do |segment|
       progress += segment.length
       segment_count += 1

       if segment_count % 15 == 0
         report_progress(progress, total)
         segment_count = 0
       end
     end
    end
  end

  def report_progress(progress, total)
    percent = (progress.to_f / total.to_f) * 100
    print "#{CL_RESET}Downloading #{basename}: #{percent.to_i}% (#{progress} / #{total})"
    $stdout.flush
  end

  def complete_progress
    puts CL_RESET
  end

  def basename
    @basename ||= File.basename @url.to_s
  end
end

class CachingDownloader < Downloader
  CACHE_DIR = File.expand_path("~/.crazyfun")

  def self.fetch(url, hash)
    cached_path = File.join(CACHE_DIR, url.gsub(/[^\w.]/, '_'))

    if File.exist?(cached_path)
      cached_hash = Digest::MD5.file(cached_path).hexdigest
      if cached_hash == hash
        $stderr.puts "Using cached Gecko SDK: #{cached_path}"
        return cached_path
      end

      $stderr.puts "MD5 mismatch: #{cached_path.inspect}, overwriting.."
    end

    super(url, cached_path)
  end
end
