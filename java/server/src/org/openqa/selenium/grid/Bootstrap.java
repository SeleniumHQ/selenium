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

package org.openqa.selenium.grid;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Bootstrap {

  private static final String MAIN_CLASS = Bootstrap.class.getPackage().getName() + ".Main";
  private static final Logger LOG = Logger.getLogger(Bootstrap.class.getName());

  public static void main(String[] args) {
    ClassLoader classLoader = Bootstrap.class.getClassLoader();

    if (args.length == 0) {
      runMain(classLoader, args);
      return;
    }

    if ("--ext".equals(args[0])) {
      if (args.length < 2) {
        runMain(classLoader, args);
        return;
      }

      ClassLoader parent = createExtendedClassLoader(args[1]);

      String[] remainingArgs = new String[args.length - 2];
      System.arraycopy(args, 2, remainingArgs, 0, args.length - 2);
      args = remainingArgs;

      classLoader = new PossessiveClassLoader(parent);

      // Ensure that we use our freshly minted classloader by default.
      Thread.currentThread().setContextClassLoader(classLoader);
    }

    runMain(classLoader, args);
  }

  private static void runMain(ClassLoader loader, String[] args) {
    try {
      Class<?> clazz = loader.loadClass(MAIN_CLASS);
      Method main = clazz.getMethod("main", String[].class);
      main.invoke(null, new Object[] {args});
    } catch (ReflectiveOperationException e) {
      e.printStackTrace();
      System.exit(1);
    }
  }

  private static ClassLoader createExtendedClassLoader(String ext) {
    List<File> jars = new ArrayList<>();
    for (String part : ext.split(File.pathSeparator)) {
      File file = new File(part);
      if (!file.exists()) {
        LOG.warning("Extension file or directory does not exist: " + file);
        continue;
      }

      if (file.isDirectory()) {
        File[] files = file.listFiles();
        if (files == null) {
          LOG.warning("Cannot list files in directory: " + file);
        } else {
          for (File subdirFile : files) {
            if (subdirFile.isFile() && subdirFile.getName().endsWith(".jar")) {
              jars.add(subdirFile);
            }
          }
        }
      } else {
        jars.add(file);
      }
    }

    URL[] jarUrls = jars.stream()
      .map(file -> {
        try {
          return file.toURI().toURL();
        } catch (MalformedURLException e) {
          LOG.log(Level.SEVERE, "Unable to find JAR file " + file, e);
          throw new UncheckedIOException(e);
        }
      })
      .toArray(URL[]::new);

    return AccessController.doPrivileged((PrivilegedAction<URLClassLoader>) () ->
      new URLClassLoader(jarUrls, Bootstrap.class.getClassLoader()));
  }

  private static class PossessiveClassLoader extends ClassLoader {
    private final ClassLoader delegate;
    private final Set<String> blessed;

    PossessiveClassLoader(ClassLoader delegate) {
      super(delegate);
      this.delegate = delegate;
      blessed = new HashSet<>();
      blessed.add("java.");
      blessed.add("javax.");
      blessed.add("sun.");
      blessed.add("jdk.");
    }

    @Override
    protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
      for (String prefix : blessed) {
        if (name.startsWith(prefix)) {
          return super.loadClass(name, resolve);
        }
      }

      Class<?> clazz = findLoadedClass(name);
      if (clazz != null) {
        return clazz;
      }

      URL resource = delegate.getResource(name.replaceAll("\\.", "/") + ".class");
      if (resource == null) {
        throw new ClassNotFoundException("Unable to find " + name);
      }

      ByteArrayOutputStream bos = new ByteArrayOutputStream();
      try (InputStream is = resource.openStream();
          BufferedInputStream bis = new BufferedInputStream(is)) {

        int read;
        byte[] bytes = new byte[4096];
        while ((read = bis.read(bytes, 0, bytes.length)) != -1) {
          bos.write(bytes, 0, read);
        }
      } catch (IOException e) {
        throw new ClassNotFoundException("Could not load " + name, e);
      }

      byte[] rawClass = bos.toByteArray();

      Class<?> defined = defineClass(name, rawClass, 0, rawClass.length);
      if (resolve) {
        resolveClass(defined);
      }
      return defined;
    }
  }
}
