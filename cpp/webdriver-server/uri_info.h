// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Defines the server to respond to WebDriver JSON wire protocol commands.
// Subclasses are expected to provide their own initialization mechanism.

#ifndef WEBDRIVER_SERVER_URI_INFO_H_
#define WEBDRIVER_SERVER_URI_INFO_H_

#include <map>
#include <string>
#include <vector>

namespace webdriver {

class UriInfo {
 public:
  UriInfo(const std::string& uri,
          const std::string& verb,
          const std::string& command_name);
  
  static void ParseUri(const std::string& uri,
                       std::vector<std::string>* fragments,
                       std::vector<size_t>* parameter_indexes);

  bool IsUriMatch(const std::vector<std::string>& uri_fragments,
                  std::vector<std::string>* uri_param_names,
                  std::vector<std::string>* uri_param_values);
  bool HasHttpVerb(const std::string& http_verb, std::string* command_name);
  std::string GetSupportedVerbs(void);
  void AddHttpVerb(const std::string& http_verb,
                   const std::string& command_name);
  
 private:
  typedef std::map<std::string, std::string> HttpVerbMap;

  bool IsValidParameterValue(const std::string& param_name,
                             const std::string& param_value);

  std::vector<std::string> fragments_;
  std::vector<size_t> parameter_indexes_;
  HttpVerbMap verb_map_;

  DISALLOW_COPY_AND_ASSIGN(UriInfo);
};

}  // namespace WebDriver

#endif  // WEBDRIVER_SERVER_URI_INFO_H_
