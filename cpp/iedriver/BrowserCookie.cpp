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

#include "BrowserCookie.h"
#include <ctime>
#include "json.h"

namespace webdriver {

BrowserCookie::BrowserCookie(void) {
  this->name_ = "";
  this->value_ = "";
  this->domain_ = "";
  this->path_ = "";
  this->expiration_time_ = 0;
  this->is_secure_ = false;
  this->is_httponly_ = false;
}

BrowserCookie::~BrowserCookie(void) {
}

BrowserCookie BrowserCookie::FromJson(const Json::Value& json_cookie) {
  BrowserCookie cookie;
  cookie.name_ = json_cookie["name"].asString();
  cookie.value_ = json_cookie["value"].asString();
  cookie.is_secure_ = json_cookie["secure"].asBool();

  Json::Value expiry = json_cookie.get("expiry", Json::Value::null);
  if (!expiry.isNull()) {
    if (expiry.isNumeric()) {
      cookie.expiration_time_ = expiry.asUInt64();
    }
  }

  Json::Value domain = json_cookie.get("domain", Json::Value::null);
  if (!domain.isNull() && domain.isString() && domain.asString() != "") {
    cookie.domain_ = domain.asString();
  }

  Json::Value path = json_cookie.get("path", Json::Value::null);
  if (!path.isNull() && path.isString() && path.asString() != "") {
    cookie.path_ = path.asString();
  }
  return cookie;
}

std::string BrowserCookie::ToString() const {
  std::string cookie_string(this->name_ +
    "=" +
    this->value_ +
    "; ");

  if (this->is_secure_) {
    cookie_string += "secure; ";
  }

  if (this->expiration_time_ > 0) {
    time_t expiration_time = static_cast<time_t>(this->expiration_time_);
    time_t current_time;
    time(&current_time);
    long long expiration_seconds = expiration_time - current_time;
    cookie_string += "max-age=" + std::to_string(expiration_seconds) + ";";
  }

  if (this->domain_.size() > 0) {
    cookie_string += "domain=" + this->domain_ + "; ";
  }
  if (this->path_.size() > 0) {
    cookie_string += "path=" + this->path_ + "; ";
  }
  return cookie_string;
}

Json::Value BrowserCookie::ToJson() {
  Json::Value cookie;
  cookie["name"] = this->name_;
  cookie["value"] = this->value_;
  cookie["secure"] = this->is_secure_;
  cookie["httpOnly"] = this->is_httponly_;
  if (this->domain_.size() > 0) {
    cookie["domain"] = this->domain_;
  }
  if (this->path_.size() > 0) {
    cookie["path"] = this->path_;
  }
  if (this->expiration_time_ > 0) {
    cookie["expiry"] = this->expiration_time_;
  }
  return cookie;
}

BrowserCookie BrowserCookie::Copy(void) const {
  BrowserCookie destination_cookie;
  destination_cookie.set_name(this->name_);
  destination_cookie.set_value(this->value_);
  destination_cookie.set_domain(this->domain_);
  destination_cookie.set_path(this->path_);
  destination_cookie.set_is_secure(this->is_secure_);
  destination_cookie.set_is_httponly(this->is_httponly_);
  destination_cookie.set_expiration_time(this->expiration_time_);
  return destination_cookie;
}

}
