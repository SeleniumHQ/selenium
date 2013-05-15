// Copyright 2013 Software Freedom Conservancy
// Licensed under the Apache License, Version 2.0 (the "License");
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

#include <Wininet.h>
#include "WinInetUtilities.h"
#include "logging.h"

namespace webdriver {

namespace internal {

class UrlCacheGroup {
public:
  UrlCacheGroup(DWORD dwFilter = CACHEGROUP_SEARCH_ALL)
    : id_(0), hfind_(NULL) {
    hfind_ = FindFirstUrlCacheGroup(0, dwFilter, NULL, 0, &id_, NULL);
  }

  virtual ~UrlCacheGroup() {
    if (hfind_)
      FindCloseUrlCache(hfind_);
  }

  bool HasNext() {
    return hfind_ != NULL;
  }

  const GROUPID& id() const {
    return id_;
  }

  void Next() {
    if (!FindNextUrlCacheGroup(hfind_, &id_, 0)) {
      FindCloseUrlCache(hfind_);
      hfind_ = NULL;
    }
  }

private:
  DISALLOW_COPY_AND_ASSIGN(UrlCacheGroup);
  GROUPID id_;
  HANDLE hfind_;
};

class UrlCacheEntryInfo {
public:
  UrlCacheEntryInfo() : len_(0), info_(NULL) {}

  virtual ~UrlCacheEntryInfo() {
    if (info_) free(info_);
  }

  bool Resize(DWORD new_len) {
    void* q = realloc(info_, new_len);
    if (!q) {
      free(info_);
      new_len = 0;
    }
    info_ = (INTERNET_CACHE_ENTRY_INFO*) q;
    len_ = new_len;
    return info_ != NULL;
  }

  bool has_info() const {
    return info_ != NULL;
  }

  INTERNET_CACHE_ENTRY_INFO* info() const {
    return info_;
  }

  DWORD len() const {
    return len_;
  }

private:
  DISALLOW_COPY_AND_ASSIGN(UrlCacheEntryInfo);
  DWORD len_;
  HANDLE henum_;
  INTERNET_CACHE_ENTRY_INFO* info_;
};

class UrlCacheEntryEx;

class UrlCacheEntry {
public:
  UrlCacheEntry(UrlCacheEntryInfo& info)
    : henum_(NULL), info_(info) {
    henum_ = FindFirstWithRetry();
  }

  virtual ~UrlCacheEntry() {
    if (henum_)
      FindCloseUrlCache(henum_);
  }

  bool HasNext() {
    return henum_ != NULL;
  }

  void Next() {
    if (!FindNextWithRetry()) {
      FindCloseUrlCache(henum_);
      henum_ = NULL;
    }
  }

protected:
  HANDLE henum() const {
    return henum_;
  }

private:
  friend class UrlCacheEntryEx;

  virtual HANDLE FindFirst(DWORD* plen) {
    return FindFirstUrlCacheEntry(NULL, info_.info(), plen);
  }

  virtual BOOL FindNext(DWORD* plen) {
    return FindNextUrlCacheEntry(henum(), info_.info(), plen);
  }

  HANDLE FindFirstWithRetry() {
    DWORD len = info_.len();
    HANDLE henum = FindFirst(&len);
    if (!henum && GetLastError() == ERROR_INSUFFICIENT_BUFFER) {
      if (info_.Resize(len))
        henum = FindFirst(&len);
    }
    return henum;
  }

  BOOL FindNextWithRetry() {
    DWORD len = info_.len();
    BOOL result = FindNext(&len);
    if (!result && GetLastError() == ERROR_INSUFFICIENT_BUFFER) {
      if (info_.Resize(len))
        result = FindNext(&len);
    }
    return result;
  }

  DISALLOW_COPY_AND_ASSIGN(UrlCacheEntry);
  HANDLE henum_;
  UrlCacheEntryInfo& info_;
};

struct UrlCacheEntryExBase {
  UrlCacheEntryExBase(GROUPID id, DWORD dwFilter)
    : id_(id), filter_(dwFilter) {}
  GROUPID id_;
  DWORD filter_;
};

class UrlCacheEntryEx
  : private UrlCacheEntryExBase,
    public UrlCacheEntry {
public:
  UrlCacheEntryEx(UrlCacheEntryInfo& info, GROUPID id = 0,
                  DWORD dwFilter = ~(DWORD) 0)
    : UrlCacheEntryExBase(id, dwFilter), UrlCacheEntry(info) {}

private:
  virtual HANDLE FindFirst(DWORD* plen) {
    return FindFirstUrlCacheEntryEx(
        NULL, 0, filter_, id_, info_.info(), plen, NULL, NULL, NULL);
  }

  virtual BOOL FindNext(DWORD* plen) {
    return FindNextUrlCacheEntryEx(
        henum_, info_.info(), plen, NULL, NULL, NULL);
  }
};

} // namespace internal

using namespace internal;

void WinInetUtilities::ClearCache() {
  UrlCacheEntryInfo info;

  for (UrlCacheGroup group; group.HasNext(); group.Next()) {
    for (UrlCacheEntryEx entry(info, group.id());
         entry.HasNext(); entry.Next()) {
      if (info.info()) {
        LOG(DEBUG) << "DeleteUrlCacheEntry from group " << group.id() << ": "
                   << *info.info()->lpszSourceUrlName;
        DeleteUrlCacheEntry(info.info()->lpszSourceUrlName);
      }
    }
    DeleteUrlCacheGroup(group.id(), CACHEGROUP_FLAG_FLUSHURL_ONDELETE, 0);
  }

  for (UrlCacheEntryEx entry(info, 0); entry.HasNext(); entry.Next()) {
    if (info.info()) {
      LOG(DEBUG) << "DeleteUrlCacheEntry: " << *info.info()->lpszSourceUrlName;
      DeleteUrlCacheEntry(info.info()->lpszSourceUrlName);
    }
  }

  for (UrlCacheEntry entry(info); entry.HasNext(); entry.Next()) {
    if (info.info()) {
      LOG(DEBUG) << "DeleteUrlCacheEntry: " << *info.info()->lpszSourceUrlName;
      DeleteUrlCacheEntry(info.info()->lpszSourceUrlName);
    }
  }
}

} // namespace webdriver