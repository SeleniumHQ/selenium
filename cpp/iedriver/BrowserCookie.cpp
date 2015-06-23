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
#include "json.h"

namespace webdriver {

BrowserCookie::BrowserCookie(void) {
  this->name_ = "";
  this->value_ = "";
  this->domain_ = "";
  this->path_ = "";
  this->expiration_time_ = 0L;
  this->is_secure_ = false;
  this->is_httponly_ = false;
}

BrowserCookie::~BrowserCookie(void) {
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

}