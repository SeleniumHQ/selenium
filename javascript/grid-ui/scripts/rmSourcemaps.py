import os

BUILD_DIR = "build"

for current, dirs, files in os.walk(BUILD_DIR):
  for file in files:
    if file.endswith('.map'):
      # remove the source map
      os.remove(os.path.join(current, file))
