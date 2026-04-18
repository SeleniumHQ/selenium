// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

use crate::logger::Logger;
use anyhow::Error;
use std::cell::RefCell;
use std::fs::File;
use std::path::{Path, PathBuf};

use crate::files::{create_parent_path_if_not_exists, create_path_if_not_exists};
use fs2::FileExt;
use std::fs;

thread_local!(static LOCK_PATH: RefCell<Option<PathBuf>> = const { RefCell::new(None) });

const LOCK_FILE: &str = "sm.lock";

pub struct Lock {
    file: Option<File>,
    path: PathBuf,
}

impl Lock {
    // Acquire file lock to prevent race conditions accessing the cache folder by concurrent SM processes
    pub fn acquire(
        log: &Logger,
        target: &Path,
        single_file: Option<String>,
    ) -> Result<Self, Error> {
        let lock_folder = if single_file.is_some() {
            create_parent_path_if_not_exists(target)?;
            target.parent().unwrap()
        } else {
            create_path_if_not_exists(target)?;
            target
        };
        let path = lock_folder.join(LOCK_FILE);
        let file = File::create(&path)?;

        log.debug(format!("Acquiring lock: {}", path.display()));
        file.lock_exclusive().unwrap_or_default();
        set_lock_path(Some(path.to_path_buf()));

        Ok(Self {
            file: Some(file),
            path,
        })
    }

    pub fn release(&mut self) {
        if let Some(file) = self.file.take() {
            FileExt::unlock(&file).unwrap_or_default();
            fs::remove_file(&self.path).unwrap_or_default();
        }
        set_lock_path(None);
    }

    pub fn exists(&mut self) -> bool {
        self.path.exists()
    }
}

impl Drop for Lock {
    fn drop(&mut self) {
        self.release();
    }
}

pub fn clear_lock_if_required() {
    if let Some(lock) = get_lock_path()
        && lock.exists()
    {
        fs::remove_file(lock).unwrap_or_default();
    }
}

fn set_lock_path(path: Option<PathBuf>) {
    LOCK_PATH.with(|lock_path| {
        *lock_path.borrow_mut() = path;
    });
}

fn get_lock_path() -> Option<PathBuf> {
    LOCK_PATH.with(|lock_path| lock_path.borrow().clone())
}

#[cfg(test)]
mod tests {
    use super::{LOCK_FILE, Lock};
    use crate::logger::Logger;
    use std::fs;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn create_test_dir(prefix: &str) -> PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let dir = std::env::temp_dir().join(format!("{}_{}", prefix, unique));
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn release_is_idempotent_and_removes_lock_file() {
        let root = create_test_dir("lock_release");
        let lock_path = root.join(LOCK_FILE);
        let logger = Logger::new();
        let mut lock = Lock::acquire(&logger, &root, None).unwrap();

        assert!(lock_path.exists());

        lock.release();
        assert!(!lock_path.exists());

        lock.release();
        assert!(!lock_path.exists());

        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn drop_releases_lock_file() {
        let root = create_test_dir("lock_drop");
        let lock_path = root.join(LOCK_FILE);
        let logger = Logger::new();

        {
            let _lock = Lock::acquire(&logger, &root, None).unwrap();
            assert!(lock_path.exists());
        }

        assert!(!lock_path.exists());
        fs::remove_dir_all(root).unwrap();
    }
}
