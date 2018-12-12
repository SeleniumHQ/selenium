# [Google Closure Compiler](https://developers.google.com/closure/compiler/)

[![Build Status](https://travis-ci.org/google/closure-compiler.svg?branch=master)](https://travis-ci.org/google/closure-compiler)
[![Open Source Helpers](https://www.codetriage.com/google/closure-compiler/badges/users.svg)](https://www.codetriage.com/google/closure-compiler)

The [Closure Compiler](https://developers.google.com/closure/compiler/) is a tool for making JavaScript download and run faster. It is a true compiler for JavaScript. Instead of compiling from a source language to machine code, it compiles from JavaScript to better JavaScript. It parses your JavaScript, analyzes it, removes dead code and rewrites and minimizes what's left. It also checks syntax, variable references, and types, and warns about common JavaScript pitfalls.

## Getting Started
 * [Download the latest version](https://dl.google.com/closure-compiler/compiler-latest.zip) ([Release details here](https://github.com/google/closure-compiler/wiki/Releases))
 * [Download a specific version](https://github.com/google/closure-compiler/wiki/Binary-Downloads). Also available via:
   - [Maven](https://github.com/google/closure-compiler/wiki/Maven)
   - [NPM](https://www.npmjs.com/package/google-closure-compiler)
 * [Use the JavaScript version](https://github.com/google/closure-compiler-js), with no Java dependency
 * See the [Google Developers Site](https://developers.google.com/closure/compiler/docs/gettingstarted_app) for documentation including instructions for running the compiler from the command line.

## Options for Getting Help
1. Post in the [Closure Compiler Discuss Group](https://groups.google.com/forum/#!forum/closure-compiler-discuss).
2. Ask a question on [Stack Overflow](https://stackoverflow.com/questions/tagged/google-closure-compiler).
3. Consult the [FAQ](https://github.com/google/closure-compiler/wiki/FAQ).

## Building it Yourself

Note: The Closure Compiler requires [Java 8 or higher](https://www.java.com/).

### Using [Maven](https://maven.apache.org/)

1. Download [Maven](https://maven.apache.org/download.cgi).

2. Add sonatype snapshots repository to `~/.m2/settings.xml`:
   ```
   <profile>
     <id>allow-snapshots</id>
        <activation><activeByDefault>true</activeByDefault></activation>
     <repositories>
       <repository>
         <id>snapshots-repo</id>
         <url>https://oss.sonatype.org/content/repositories/snapshots</url>
         <releases><enabled>false</enabled></releases>
         <snapshots><enabled>true</enabled></snapshots>
       </repository>
     </repositories>
   </profile>
   ```

3. On the command line, at the root of this project, run `mvn -DskipTests` (omit the `-DskipTests` if you want to run all the
unit tests too).

    This will produce a jar file called `target/closure-compiler-1.0-SNAPSHOT.jar`. You can run this jar
    as per the [Running section](#running) of this Readme. If you want to depend on the compiler via
    Maven in another Java project, use the `com.google.javascript/closure-compiler-unshaded` artifact.

    Running `mvn -DskipTests -pl externs/pom.xml,pom-main.xml,pom-main-shaded.xml`
    will skip building the GWT version of the compiler. This can speed up the build process significantly.

### Using [Eclipse](https://www.eclipse.org/)

1. Download and open [Eclipse IDE](https://www.eclipse.org/). Disable `Project > Build automatically` during this process.
2. On the command line, at the root of this project, run `mvn eclipse:eclipse -DdownloadSources=true` to download JARs and build Eclipse project configuration.
3. Run `mvn clean` and `mvn -DskipTests` to ensure AutoValues are generated and updated.
4. In Eclipse, navigate to `File > Import > Maven > Existing Maven Projects` and browse to closure-compiler.
5. Import both closure-compiler and the nested externs project.
6. Disregard the warnings about maven-antrun-plugin and build errors.
7. Configure the project to use the [Google Eclipse style guide](https://github.com/google/styleguide/blob/gh-pages/eclipse-java-google-style.xml)
8. Edit `.classpath` in closure-compiler-parent. Delete the `<classpathentry ... kind="src" path="src" ... />` line, then add:
   ```
   <classpathentry excluding="com/google/debugging/sourcemap/super/**|com/google/javascript/jscomp/debugger/gwt/DebuggerGwtMain.java|com/google/javascript/jscomp/gwt/|com/google/javascript/jscomp/resources/super-gwt/**" kind="src" path="src"/>
   <classpathentry kind="src" path="target/generated-sources/annotations"/>
   ```
9. Ensure the Eclipse project settings specify 1.8 compliance level in "Java Compiler".
10. Build project in Eclipse (right click on the project `closure-compiler-parent` and select `Build Project`).
11. See *Using Maven* above to build the JAR.

## Running

On the command line, at the root of this project, type

```
java -jar target/closure-compiler-1.0-SNAPSHOT.jar
```

This starts the compiler in interactive mode. Type

```javascript
var x = 17 + 25;
```

then hit "Enter", then hit "Ctrl-Z" (on Windows) or "Ctrl-D" (on Mac or Linux)
and "Enter" again. The Compiler will respond:

```javascript
var x=42;
```

The Closure Compiler has many options for reading input from a file, writing
output to a file, checking your code, and running optimizations. To learn more,
type

```
java -jar compiler.jar --help
```

More detailed information about running the Closure Compiler is available in the
[documentation](https://developers.google.com/closure/compiler/docs/gettingstarted_app).


### Run using Eclipse

1. Open the class `src/com/google/javascript/jscomp/CommandLineRunner.java` or create your own extended version of the class.
2. Run the class in Eclipse.
3. See the instructions above on how to use the interactive mode - but beware of the [bug](https://stackoverflow.com/questions/4711098/passing-end-of-transmission-ctrl-d-character-in-eclipse-cdt-console) regarding passing "End of Transmission" in the Eclipse console.


## Compiling Multiple Scripts

If you have multiple scripts, you should compile them all together with one
compile command.

```bash
java -jar compiler.jar --js_output_file=out.js in1.js in2.js in3.js ...
```

You can also use minimatch-style globs.

```bash
# Recursively include all js files in subdirs
java -jar compiler.jar --js_output_file=out.js 'src/**.js'

# Recursively include all js files in subdirs, excluding test files.
# Use single-quotes, so that bash doesn't try to expand the '!'
java -jar compiler.jar --js_output_file=out.js 'src/**.js' '!**_test.js'
```

The Closure Compiler will concatenate the files in the order they're passed at
the command line.

If you're using globs or many files, you may start to run into
problems with managing dependencies between scripts. In this case, you should
use the [Closure Library](https://developers.google.com/closure/library/). It
contains functions for enforcing dependencies between scripts, and Closure Compiler
will re-order the inputs automatically.

## How to Contribute
### Reporting a bug
1. First make sure that it is really a bug and not simply the way that Closure Compiler works (especially true for ADVANCED_OPTIMIZATIONS).
 * Check the [official documentation](https://developers.google.com/closure/compiler/)
 * Consult the [FAQ](https://github.com/google/closure-compiler/wiki/FAQ)
 * Search on [Stack Overflow](https://stackoverflow.com/questions/tagged/google-closure-compiler) and in the [Closure Compiler Discuss Group](https://groups.google.com/forum/#!forum/closure-compiler-discuss)
2. If you still think you have found a bug, make sure someone hasn't already reported it. See the list of [known issues](https://github.com/google/closure-compiler/issues).
3. If it hasn't been reported yet, post a new issue. Make sure to add enough detail so that the bug can be recreated. The smaller the reproduction code, the better.

### Suggesting a Feature
1. Consult the [FAQ](https://github.com/google/closure-compiler/wiki/FAQ) to make sure that the behaviour you would like isn't specifically excluded (such as string inlining).
2. Make sure someone hasn't requested the same thing. See the list of [known issues](https://github.com/google/closure-compiler/issues).
3. Read up on [what type of feature requests are accepted](https://github.com/google/closure-compiler/wiki/FAQ#how-do-i-submit-a-feature-request-for-a-new-type-of-optimization).
4. Submit your request as an issue.

### Submitting patches
1. All contributors must sign a contributor license agreement (CLA).
   A CLA basically says that you own the rights to any code you contribute,
   and that you give us permission to use that code in Closure Compiler.
   You maintain the copyright on that code.
   If you own all the rights to your code, you can fill out an
   [individual CLA](https://code.google.com/legal/individual-cla-v1.0.html).
   If your employer has any rights to your code, then they also need to fill out
   a [corporate CLA](https://code.google.com/legal/corporate-cla-v1.0.html).
   If you don't know if your employer has any rights to your code, you should
   ask before signing anything.
   By default, anyone with an @google.com email address already has a CLA
   signed for them.
2. To make sure your changes are of the type that will be accepted, ask about your patch on the [Closure Compiler Discuss Group](https://groups.google.com/forum/#!forum/closure-compiler-discuss)
3. Fork the repository.
4. Make your changes. Check out our
   [coding conventions](https://github.com/google/closure-compiler/wiki/Contributors#coding-conventions)
   for details on making sure your code is in correct style.
5. Submit a pull request for your changes. A project developer will review your work and then merge your request into the project.

## Closure Compiler License

Copyright 2009 The Closure Compiler Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Dependency Licenses

### Rhino

<table>
  <tr>
    <td>Code Path</td>
    <td>
      <code>src/com/google/javascript/rhino</code>, <code>test/com/google/javascript/rhino</code>
    </td>
  </tr>

  <tr>
    <td>URL</td>
    <td>https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>1.5R3, with heavy modifications</td>
  </tr>

  <tr>
    <td>License</td>
    <td>Netscape Public License and MPL / GPL dual license</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>A partial copy of Mozilla Rhino. Mozilla Rhino is an
implementation of JavaScript for the JVM.  The JavaScript
parse tree data structures were extracted and modified
significantly for use by Google's JavaScript compiler.</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>The packages have been renamespaced. All code not
relevant to the parse tree has been removed. A JsDoc parser and static typing
system have been added.</td>
  </tr>
</table>

### Args4j

<table>
  <tr>
    <td>URL</td>
    <td>http://args4j.kohsuke.org/</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>2.33</td>
  </tr>

  <tr>
    <td>License</td>
    <td>MIT</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>args4j is a small Java class library that makes it easy to parse command line
options/arguments in your CUI application.</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>None</td>
  </tr>
</table>

### Guava Libraries

<table>
  <tr>
    <td>URL</td>
    <td>https://github.com/google/guava</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>20.0</td>
  </tr>

  <tr>
    <td>License</td>
    <td>Apache License 2.0</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>Google's core Java libraries.</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>None</td>
  </tr>
</table>

### JSR 305

<table>
  <tr>
    <td>URL</td>
    <td>https://github.com/findbugsproject/findbugs</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>3.0.1</td>
  </tr>

  <tr>
    <td>License</td>
    <td>BSD License</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>Annotations for software defect detection.</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>None</td>
  </tr>
</table>

### JUnit

<table>
  <tr>
    <td>URL</td>
    <td>http://junit.org/junit4/</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>4.12</td>
  </tr>

  <tr>
    <td>License</td>
    <td>Common Public License 1.0</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>A framework for writing and running automated tests in Java.</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>None</td>
  </tr>
</table>

### Protocol Buffers

<table>
  <tr>
    <td>URL</td>
    <td>https://github.com/google/protobuf</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>3.0.2</td>
  </tr>

  <tr>
    <td>License</td>
    <td>New BSD License</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>Supporting libraries for protocol buffers,
an encoding of structured data.</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>None</td>
  </tr>
</table>

### Truth

<table>
  <tr>
    <td>URL</td>
    <td>https://github.com/google/truth</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>0.32</td>
  </tr>

  <tr>
    <td>License</td>
    <td>Apache License 2.0</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>Assertion/Proposition framework for Java unit tests</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>None</td>
  </tr>
</table>

### Ant

<table>
  <tr>
    <td>URL</td>
    <td>https://ant.apache.org/bindownload.cgi</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>1.9.7</td>
  </tr>

  <tr>
    <td>License</td>
    <td>Apache License 2.0</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>Ant is a Java based build tool. In theory it is kind of like "make"
without make's wrinkles and with the full portability of pure java code.</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>None</td>
  </tr>
</table>

### GSON

<table>
  <tr>
    <td>URL</td>
    <td>https://github.com/google/gson</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>2.7</td>
  </tr>

  <tr>
    <td>License</td>
    <td>Apache license 2.0</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>A Java library to convert JSON to Java objects and vice-versa</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>None</td>
  </tr>
</table>

### Node.js Closure Compiler Externs

<table>
  <tr>
    <td>Code Path</td>
    <td><code>contrib/nodejs</code></td>
  </tr>

  <tr>
    <td>URL</td>
    <td>https://github.com/dcodeIO/node.js-closure-compiler-externs</td>
  </tr>

  <tr>
    <td>Version</td>
    <td>e891b4fbcf5f466cc4307b0fa842a7d8163a073a</td>
  </tr>

  <tr>
    <td>License</td>
    <td>Apache 2.0 license</td>
  </tr>

  <tr>
    <td>Description</td>
    <td>Type contracts for NodeJS APIs</td>
  </tr>

  <tr>
    <td>Local Modifications</td>
    <td>Substantial changes to make them compatible with NpmCommandLineRunner.</td>
  </tr>
</table>
