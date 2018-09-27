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

#include "uri_info.h"

namespace webdriver {

UriInfo::UriInfo(const std::string& uri,
                 const std::string& verb,
                 const std::string& command_name) {
  ParseUri(uri, &this->fragments_, &this->parameter_indexes_);
  this->AddHttpVerb(verb, command_name);
}

void UriInfo::ParseUri(const std::string& uri,
                       std::vector<std::string>* fragments,
                       std::vector<size_t>* parameter_indexes) {
  size_t current_position = 0;
  size_t token_end_position = 0;
  size_t current_token_index = 0;
  do {
    token_end_position = uri.find("/", current_position);
    std::string token = uri.substr(current_position,
                                   token_end_position - current_position);
    if (parameter_indexes != NULL && token.find(":") == 0) {
      parameter_indexes->push_back(current_token_index);
    }
    fragments->push_back(token);
    ++current_token_index;
    current_position = token_end_position + 1;
  } while (token_end_position != std::string::npos);
} 


bool UriInfo::IsUriMatch(const std::vector<std::string>& uri_fragments,
                         std::vector<std::string>* uri_param_names,
                         std::vector<std::string>* uri_param_values) {
  if (uri_fragments.size() != this->fragments_.size()) {
    return false;
  }

  // Loop through the fragments of the URI, and if any of them don't match,
  // then the passed in URI isn't a match. However, if the current fragment
  // is a template parameter (e.g., ":sessionid"), ignore the fact that the
  // values of the fragment don't match, and move to the next parameter index.
  size_t next_parameter_index = 0;
  for (size_t index = 0; index < this->fragments_.size(); ++index) {
    if (uri_fragments[index] != this->fragments_[index]) {
      if (this->fragments_[index].find(":") != 0) {
        return false;
      }
      if (next_parameter_index < this->parameter_indexes_.size() && 
          this->parameter_indexes_[next_parameter_index] != index) {
        return false;
      } else {
        if (!this->IsValidParameterValue(
            this->fragments_[this->parameter_indexes_[next_parameter_index]],
            uri_fragments[this->parameter_indexes_[next_parameter_index]])) {
          return false;
        }
        ++next_parameter_index;
      }
    }
  }

  // At this point, we know the URI is a match. Now we just need to copy the
  // parameter names and values back to the caller. Note that the parameter
  // name has a colon in front of it which must be stripped.
  for (size_t index = 0; index < this->parameter_indexes_.size(); ++index) {
    std::string param_name = this->fragments_[this->parameter_indexes_[index]];
    uri_param_names->push_back(param_name.substr(1));
    uri_param_values->push_back(uri_fragments[this->parameter_indexes_[index]]);
  }

  return true;
}

bool UriInfo::HasHttpVerb(const std::string& http_verb,
                          std::string* command_name) {
  HttpVerbMap::const_iterator verb_iterator = this->verb_map_.find(http_verb);
  if (verb_iterator != this->verb_map_.end()) {
    *command_name = verb_iterator->second;
    return true;
  }
  return false;
}

void UriInfo::AddHttpVerb(const std::string& http_verb,
                          const std::string& command_name) {
  this->verb_map_[http_verb] = command_name;
}

bool UriInfo::IsValidParameterValue(const std::string& param_name,
                                    const std::string& param_value) {
  // TODO(JimEvans): Create an extensible mechanism for this.
  if (param_name == ":id" && param_value == "active") {
    return false;
  }
  return true;
}


std::string UriInfo::GetSupportedVerbs(void) {
  std::string supported_verbs = "";
  HttpVerbMap::const_iterator verb_iterator = this->verb_map_.begin();
  for (; verb_iterator != this->verb_map_.end(); ++verb_iterator) {
    if (supported_verbs.size() != 0) {
      supported_verbs.append(",");
    }
    supported_verbs.append(verb_iterator->first);
  }
  return supported_verbs;
}

}  // namespace WebDriver
