module Copyright
    NOTICE = <<-eos
Licensed to the Software Freedom Conservancy (SFC) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The SFC licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
eos
  def Update(files, options = {})
    style = options[:style] || "//"
    prefix = options[:prefix] || nil

    notice_lines = Copyright::NOTICE.split(/\n/).map{|line|
      (style + " " + line).rstrip + "\n"
    }
    notice_lines = Array(prefix) + notice_lines
    notice = notice_lines.join("")

    files.each do |f|
      lines = IO.readlines(f)

      index = -1
      lines.any? {|line|
        done = true
        if (line.index(style) == 0) ||
           (notice_lines[index + 1] && (line.index(notice_lines[index + 1]) == 0))
          index += 1
          done = false
        end
        done
      }
      if index == -1
        puts "Adding notice to #{f}"
        File.open(f, "w") do |f|
          f.write(notice + "\n")
          lines.each {|line| f.write(line) }
        end
      else
        current = lines.shift(index + 1).join("")
        if current != notice
          puts "Updating notice in #{f}"
          File.open(f, "w") do |f|
            f.write(notice)
            lines.each {|line| f.write(line) }
          end
        end
      end
    end
  end
  module_function :Update
end
