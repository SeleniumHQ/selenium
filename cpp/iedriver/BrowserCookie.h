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

#ifndef WEBDRIVER_IE_BROWSERCOOKIE_H_
#define WEBDRIVER_IE_BROWSERCOOKIE_H_

#include <string>

namespace Json {
  class Value;
} // namespace Json

namespace webdriver {

class BrowserCookie {
 public:
  BrowserCookie(void);
  virtual ~BrowserCookie(void);

  static BrowserCookie FromJson(const Json::Value& json_cookie);

  Json::Value ToJson(void);
  std::string ToString(void) const;
  BrowserCookie Copy(void) const;

  std::string name(void) const { return this->name_; }
  void set_name(const std::string& name) { this->name_ = name; }

  std::string value(void) const { return this->value_; }
  void set_value(const std::string& value) { this->value_ = value; }

  std::string domain(void) const { return this->domain_; }
  void set_domain(const std::string& domain) { this->domain_ = domain; }

  std::string path(void) const { return this->path_; }
  void set_path(const std::string& path) { this->path_ = path; }

  bool is_secure(void) const { return this->is_secure_; }
  void set_is_secure(const bool is_secure) { this->is_secure_ = is_secure; }

  bool is_httponly(void) const { return this->is_httponly_; }
  void set_is_httponly(const bool is_httponly) {
    this->is_httponly_ = is_httponly;
  }

  unsigned long long  expiration_time(void) const {
    return this->expiration_time_;
  }
  void set_expiration_time(const unsigned long long  expiration_time) {
    this->expiration_time_ = expiration_time;
  }

 private:
  std::string name_;
  std::string value_;
  std::string domain_;
  std::string path_;
  unsigned long long expiration_time_;
  bool is_secure_;
  bool is_httponly_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSERCOOKIE_H_
