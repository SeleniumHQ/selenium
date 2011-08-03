require "net/http"
require "uri"

class Downloader
  class Error < StandardError; end

  CL_RESET = Platform.windows? ? '' : "\r\e[0K"

  def self.fetch(source_url, destination_path = nil)
    unless destination_path
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
    response = Net::HTTP.get_response(@url) do |response|
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

    unless response.kind_of? Net::HTTPSuccess
      raise Error, "#{response.code} for #{@url}"
    end

    complete_progress
  end

  private

  def report_progress(progress, total)
    percent = (progress.to_f / total.to_f) * 100
    print "#{CL_RESET}Downloading #{@url}: #{percent.to_i}% (#{progress} / #{total})"
    $stdout.flush
  end

  def complete_progress
    puts CL_RESET
  end
end
