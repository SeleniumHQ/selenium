require 'yaml'
require 'net/http'

class TestRequest
  def call(env)
    status = env["QUERY_STRING"] =~ /secret/ ? 403 : 200
    env["test.postdata"] = env["rack.input"].read
    body = env.to_yaml
    size = body.respond_to?(:bytesize) ? body.bytesize : body.size
    [status, {"Content-Type" => "text/yaml", "Content-Length" => size.to_s}, [body]]
  end

  module Helpers
    attr_reader :status, :response

    def GET(path, header={})
      Net::HTTP.start(@host, @port) { |http|
        user = header.delete(:user)
        passwd = header.delete(:passwd)

        get = Net::HTTP::Get.new(path, header)
        get.basic_auth user, passwd  if user && passwd
        http.request(get) { |response|
          @status = response.code.to_i
          @response = YAML.load(response.body)
        }
      }
    end

    def POST(path, formdata={}, header={})
      Net::HTTP.start(@host, @port) { |http|
        user = header.delete(:user)
        passwd = header.delete(:passwd)

        post = Net::HTTP::Post.new(path, header)
        post.form_data = formdata
        post.basic_auth user, passwd  if user && passwd
        http.request(post) { |response|
          @status = response.code.to_i
          @response = YAML.load(response.body)
        }
      }
    end
  end
end

class StreamingRequest
  def self.call(env)
    [200, {"Content-Type" => "text/plain"}, new]
  end

  def each
    yield "hello there!\n"
    sleep 5
    yield "that is all.\n"
  end
end
