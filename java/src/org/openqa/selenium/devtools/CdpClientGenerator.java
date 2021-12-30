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

package org.openqa.selenium.devtools;

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.BodyDeclaration;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.ConstructorDeclaration;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.TypeDeclaration;
import com.github.javaparser.ast.stmt.BlockStmt;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.ByteStreams;
import org.openqa.selenium.Beta;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiConsumer;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.nio.file.FileVisitResult.CONTINUE;
import static java.util.stream.Collectors.joining;

public class CdpClientGenerator {

  public static void main(String[] args) throws IOException {
    Path browserProtocol = Paths.get(args[0]);
    Path jsProtocol = Paths.get(args[1]);
    String version = args[2];

    Path target = Files.createTempDirectory("devtools");
    String devtoolsDir = "org/openqa/selenium/devtools/" + version + "/";

    Model model = new Model("org.openqa.selenium.devtools." + version);
    Stream.of(browserProtocol, jsProtocol).forEach(protoFile -> {
      try {
        String text = String.join("\n", Files.readAllLines(protoFile));
        Map<String, Object> json = new Json().toType(text, Json.MAP_TYPE);
        model.parse(json);
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    });
    model.dumpTo(target);

    Path outputJar = Paths.get(args[3]).toAbsolutePath();
    Files.createDirectories(outputJar.getParent());

    try (OutputStream os = Files.newOutputStream(outputJar);
         JarOutputStream jos = new JarOutputStream(os)) {
      Files.walkFileTree(target, new SimpleFileVisitor<Path>() {
        @Override
        public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
          String relative = target.relativize(dir).toString().replace('\\', '/');
          JarEntry entry = new JarEntry(devtoolsDir + relative + "/");
          jos.putNextEntry(entry);
          jos.closeEntry();
          return CONTINUE;
        }


        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
          String relative = target.relativize(file).toString().replace('\\', '/');
          JarEntry entry = new JarEntry(devtoolsDir + relative);
          jos.putNextEntry(entry);
          try (InputStream is = Files.newInputStream(file)) {
            ByteStreams.copy(is, jos);
          }
          jos.closeEntry();
          return CONTINUE;
        }
      });
    }
  }

  private static class Model {
    private List<Domain> domains = new ArrayList<>();
    private String basePackage;

    public Model(String basePackage) {
      this.basePackage = basePackage;
    }

    @SuppressWarnings("unchecked")
    public void parse(Map<String, Object> json) {
      json.forEach((key, value) -> {
        switch (key) {
          case "version":
            //parseVersion((Map<String, Object>) value);
            break;
          case "domains":
            ((List<Map<String, Object>>) value).forEach(item -> {
              Domain domain = new Domain(this);
              domain.parse(item);
              domains.add(domain);
            });
            break;
          default:
            throw new RuntimeException("Unexpected top level key " + key);
        }
      });
    }

    public void dumpTo(Path target) {
      ensureDirectoryExists(target);
      domains.forEach(domain -> domain.dumpTo(target));
    }
  }

  private static class Parser<T extends BaseSpec> {
    private Map<String, BiConsumer<T, Object>> processors;

    public Parser(Map<String, BiConsumer<T, Object>> processors) {
      this.processors = processors;
    }

    public void parse(T target, Map<String, Object> json) {
      json.forEach((key, value) -> processors
          .getOrDefault(key, (x, y) -> { throw new RuntimeException("Parsing domain: unexpected key " + key); })
          .accept(target, value));
    }
  }

  private static class BaseSpec {
    protected String name;
    protected String description;
    protected boolean experimental;
    protected boolean deprecated;
  }

  private static class BaseSpecParser<T extends BaseSpec> extends Parser<T> {
    public BaseSpecParser(Map<String, BiConsumer<T, Object>> extraProcessors) {
      super(new ImmutableMap.Builder<String, BiConsumer<T, Object>>()
                .put("name", (x, value) -> x.name = (String) value)
                .put("description", (x, value) -> x.description = (String) value)
                .put("experimental", (x, value) -> x.experimental = (Boolean) value)
                .put("deprecated", (x, value) -> x.deprecated = (Boolean) value)
                .putAll(extraProcessors)
                .build());
    }
  }

  private static class TypedSpec extends BaseSpec {
    protected Domain domain;
    protected IType type = new VoidType();

    public TypedSpec(Domain domain) {
      this.domain = domain;
    }

    public String getNamespace() {
      return domain.getPackage();
    }

    public TypeDeclaration<?> toTypeDeclaration() {
      TypeDeclaration<?> typeDeclaration =
          type instanceof VoidType
          ? new ClassOrInterfaceDeclaration().setName(capitalize(name)).setPublic(true)
          : type.toTypeDeclaration().setPublic(true);

      if (description != null) {
        typeDeclaration.setJavadocComment(description);
      }
      if (experimental) {
        typeDeclaration.addAnnotation(Beta.class.getCanonicalName());
      }
      if (deprecated) {
        typeDeclaration.addAnnotation(Deprecated.class.getCanonicalName());
      }

      return typeDeclaration;
    }
  }

  private static class TypedSpecParser<T extends TypedSpec> extends BaseSpecParser<T> {
    @SuppressWarnings("unchecked")
    public TypedSpecParser(boolean inline, Map<String, BiConsumer<T, Object>> extraProcessors) {
      super(new ImmutableMap.Builder<String, BiConsumer<T, Object>>()
                .put("type", (x, value) -> x.type = new SimpleType(x.name, (String) value))
                .put("$ref", (x, value) -> x.type = new RefType(x.name, x.domain, (String) value))
                .put("enum", (x, value) -> x.type =
                    inline ? new InlineEnumType(x, x.name, (List<String>) value)
                           : new EnumType(x, x.name, (List<String>) value))
                .put("items", (x, value) -> {
                  ArrayType array = new ArrayType(x.name);
                  array.parse(x.domain, (Map<String, Object>) value);
                  x.type = array;
                })
                .putAll(extraProcessors)
                .build());
    }
  }

  private static class Domain extends BaseSpec {
    private Model model;

    private List<TypeSpec> types = new ArrayList<>();
    private List<CommandSpec> commands = new ArrayList<>();
    private List<EventSpec> events = new ArrayList<>();

    public Domain(Model model) {
      this.model = model;
    }

    public String getPackage() {
      return model.basePackage + "." + name.toLowerCase();
    }

    public void parse(Map<String, Object> json) {
      new DomainParser(model.basePackage).parse(this, json);
    }

    public void dumpTo(Path target) {
      Path domainDir = target.resolve(name.toLowerCase());
      ensureDirectoryExists(domainDir);
      dumpMainClass(domainDir);
      if (types.size() > 0) {
        Path typesDir = domainDir.resolve("model");
        ensureDirectoryExists(typesDir);
        types.forEach(type -> type.dumpTo(typesDir));
      }
      if (events.size() > 0) {
        Path eventsDir = domainDir.resolve("model");
        ensureDirectoryExists(eventsDir);
        events.forEach(event -> event.dumpTo(eventsDir));
      }
    }

    private void dumpMainClass(Path target) {
      CompilationUnit unit = new CompilationUnit();
      unit.setPackageDeclaration(String.format("%s.%s", model.basePackage, name.toLowerCase()));
      unit.addImport(Beta.class);
      unit.addImport(Command.class);
      unit.addImport(Event.class);
      unit.addImport(ConverterFunctions.class);
      unit.addImport(ImmutableMap.class);
      unit.addImport(JsonInput.class);

      ClassOrInterfaceDeclaration classDecl = unit.addClass(name);
      if (description != null) {
        classDecl.setJavadocComment(description);
      }
      if (experimental) {
        classDecl.addAnnotation(Beta.class);
      }
      if (deprecated) {
        classDecl.addAnnotation(Deprecated.class);
      }

      commands.forEach(command -> {
        if (command.type instanceof ObjectType || command.type instanceof EnumType) {
          classDecl.addMember(command.type.toTypeDeclaration().setPublic(true).setStatic(true));
        }
        command.parameters.forEach(parameter -> {
          if (parameter.type instanceof EnumType) {
            EnumType parameterType = ((EnumType) parameter.type);
            parameterType.name = capitalize(command.name) + parameterType.name;
            classDecl.addMember(parameter.type.toTypeDeclaration().setPublic(true));
          }

        });
        classDecl.addMember(command.toMethodDeclaration());
      });

      events.forEach(event -> {
        if (event.type instanceof EnumType) {
          classDecl.addMember(event.type.toTypeDeclaration().setPublic(true));
        }
        classDecl.addMember(event.toMethodDeclaration());
      });

      Path commandFile = target.resolve(name + ".java");
      ensureFileDoesNotExists(commandFile);

      try {
        Files.write(commandFile, unit.toString().getBytes());
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }
  }

  private static class DomainParser extends BaseSpecParser<Domain> {
    @SuppressWarnings("unchecked")
    public DomainParser(String basePackage) {
      super(new ImmutableMap.Builder<String, BiConsumer<Domain, Object>>()
                .put("domain", (domain, value) -> domain.name = (String) value)
                .put("dependencies", (domain, value) -> {
                  // TODO: what to do with dependencies?
                })
                .put("types", (domain, value) -> ((List<Map<String, Object>>) value).forEach(item -> {
                  TypeSpec type = new TypeSpec(basePackage, domain);
                  type.parse(item);
                  domain.types.add(type);
                }))
                .put("commands", (domain, value) -> ((List<Map<String, Object>>) value).forEach(item -> {
                  CommandSpec command = new CommandSpec(domain);
                  command.parse(item);
                  domain.commands.add(command);
                }))
                .put("events", (domain, value) -> ((List<Map<String, Object>>) value).forEach(item -> {
                  EventSpec event = new EventSpec(domain);
                  event.parse(item);
                  domain.events.add(event);
                }))
                .build());
    }
  }

  private static class EventSpec extends TypedSpec {

    public EventSpec(Domain domain) {
      super(domain);
    }

    public void parse(Map<String, Object> json) {
      new EventParser().parse(this, json);
    }

    public String getNamespace() {
      return domain.getPackage() + ".model";
    }

    private String getFullJavaType() {
      return type.getJavaType();
    }

    public void dumpTo(Path target) {
      if (type instanceof ObjectType) {
        CompilationUnit unit = new CompilationUnit();
        unit.setPackageDeclaration(getNamespace());
        unit.addImport(Beta.class);
        unit.addImport(JsonInput.class);
        unit.addType(toTypeDeclaration());

        Path eventFile = target.resolve(capitalize(name) + ".java");
        ensureFileDoesNotExists(eventFile);

        try {
          Files.write(eventFile, unit.toString().getBytes());
        } catch (IOException e) {
          throw new UncheckedIOException(e);
        }
      }
    }

    public BodyDeclaration<?> toMethodDeclaration() {
      MethodDeclaration methodDecl = new MethodDeclaration().setName(name).setPublic(true).setStatic(true);
      if (type == null) {
        methodDecl.setType("Event<Void>").getBody().get().addStatement(
            String.format("return new Event<>(\"%s.%s\");", domain.name, name));
      } else {
        methodDecl.setType(String.format("Event<%s>", getFullJavaType()));
        if (type instanceof VoidType) {
          methodDecl.getBody().get().addStatement(
              String.format("return new Event<>(\"%s.%s\", input -> null);", domain.name, name));
        } else if (type instanceof ObjectType) {
          methodDecl.getBody().get().addStatement(String.format(
              "return new Event<>(\"%s.%s\", input -> %s);",
              domain.name, name, type.getMapper()));
        } else {
          methodDecl.getBody().get().addStatement(String.format(
              "return new Event<>(\"%s.%s\", ConverterFunctions.map(\"%s\", %s));",
              domain.name, name, type.getName(), type.getTypeToken()));
        }
      }
      return methodDecl;
    }
  }

  private static class EventParser extends TypedSpecParser<EventSpec> {
    @SuppressWarnings("unchecked")
    public EventParser() {
      super(true, new ImmutableMap.Builder<String, BiConsumer<EventSpec, Object>>()
                .put("parameters", (event, value) -> {
                  List<VariableSpec> parameters = new ArrayList<>();
                  ((List<Map<String, Object>>) value).forEach(item -> {
                    VariableSpec parameter = new VariableSpec(event.domain);
                    parameter.parse(item);
                    parameters.add(parameter);
                  });
                  if (parameters.size() == 0) {
                    event.type = new VoidType();
                  } else if (parameters.size() == 1) {
                    event.type = parameters.get(0).type;
                  } else {
                    event.type = new ObjectType(event, event.name, parameters);
                  }
                })
                .build());
    }
  }

  private static class TypeSpec extends TypedSpec {

    private final String basePackage;

    public TypeSpec(String basePackage, Domain domain) {
      super(domain);
      this.basePackage = basePackage;
    }

    public void parse(Map<String, Object> json) {
      new TypeSpecParser().parse(this, json);
    }

    public String getNamespace() {
      return domain.getPackage() + ".model";
    }

    public void dumpTo(Path target) {
      CompilationUnit unit = new CompilationUnit();
      unit.setPackageDeclaration(basePackage + "." + domain.name.toLowerCase() + ".model");
      unit.addImport(Beta.class);
      unit.addImport(JsonInput.class);
      unit.addType(toTypeDeclaration());

      Path typeFile = target.resolve(capitalize(name) + ".java");
      ensureFileDoesNotExists(typeFile);

      try {
        Files.write(typeFile, unit.toString().getBytes());
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }
  }

  private static class TypeSpecParser extends TypedSpecParser<TypeSpec> {
    @SuppressWarnings("unchecked")
    public TypeSpecParser() {
      super(false, new ImmutableMap.Builder<String, BiConsumer<TypeSpec, Object>>()
                .put("id", (type, value) -> type.name = capitalize((String) value))
                .put("properties", (type, value) -> {
                  List<VariableSpec> properties = new ArrayList<>();
                  ((List<Map<String, Object>>) value).forEach(item -> {
                    VariableSpec property = new VariableSpec(type.domain);
                    property.parse(item);
                    properties.add(property);
                  });
                  type.type = new ObjectType(type, type.name, properties);
                })
                .build());
    }
  }

  private static class VariableSpec extends TypedSpec {

    private boolean optional = false;

    public VariableSpec(Domain domain) {
      super(domain);
    }

    public String getJavaType() {
      if (optional) {
        return String.format("java.util.Optional<%s>", type.getJavaType());
      }
      return type.getJavaType();
    }

    public String getFieldName() {
      if (Objects.equals(name, "this")) {
        return "_this";
      } else {
        return name;
      }
    }

    public void parse(Map<String, Object> json) {
      new VariableSpecParser().parse(this, json);
    }

    public String getDefaultValue() {
      return type.getJavaDefaultValue();
    }
  }

  private static class VariableSpecParser extends TypedSpecParser<VariableSpec> {
    public VariableSpecParser() {
      super(true, new ImmutableMap.Builder<String, BiConsumer<VariableSpec, Object>>()
                .put("optional", (field, value) -> field.optional = (Boolean) value)
                .build());
    }
  }

  private static class CommandSpec extends TypedSpec {
    private String redirect;
    private List<VariableSpec> parameters = new ArrayList<>();

    public CommandSpec(Domain domain) {
      super(domain);
    }

    public String getNamespace() {
      return domain.getPackage() + "." + capitalize(domain.name);
    }

    public void parse(Map<String, Object> json) {
      new CommandSpecParser().parse(this, json);
    }

    public MethodDeclaration toMethodDeclaration() {
      MethodDeclaration methodDecl = new MethodDeclaration().setName(name).setPublic(true).setStatic(true);
      if (description != null) {
        methodDecl.setJavadocComment(description);
      }
      if (experimental) {
        methodDecl.addAnnotation(Beta.class);
      }
      if (deprecated) {
        methodDecl.addAnnotation(Deprecated.class);
      }

      methodDecl.setType(String.format("Command<%s>", type.getJavaType()));

      parameters.forEach(param -> {
        if (param.optional) {
          methodDecl.addParameter(String.format("java.util.Optional<%s>", param.type.getJavaType()), param.name);
        } else {
          methodDecl.addParameter(param.type.getJavaType(), param.name);
        }
      });

      BlockStmt body = methodDecl.getBody().get();

      parameters.stream().filter(parameter -> !parameter.optional)
          .map(parameter -> parameter.name)
          .forEach(name -> body.addStatement(
              String.format("java.util.Objects.requireNonNull(%s, \"%s is required\");", name, name)));
      body.addStatement("ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();");
      parameters.forEach(parameter -> {
        if (parameter.optional) {
          body.addStatement(String.format("%s.ifPresent(p -> params.put(\"%s\", p));", parameter.name, parameter.name));
        } else {
          body.addStatement(String.format("params.put(\"%s\", %s);", parameter.name, parameter.name));
        }
      });

      if (type instanceof VoidType) {
        body.addStatement(String.format(
            "return new Command<>(\"%s.%s\", params.build());", domain.name, name));
      } else if (type instanceof ObjectType) {
        body.addStatement(String.format(
            "return new Command<>(\"%s.%s\", params.build(), input -> %s);",
            domain.name, name, type.getMapper()));
      } else {
        body.addStatement(String.format(
            "return new Command<>(\"%s.%s\", params.build(), ConverterFunctions.map(\"%s\", %s));",
            domain.name, name, type.getName(), type.getTypeToken()));
      }

      return methodDecl;
    }
  }

  private static class CommandSpecParser extends BaseSpecParser<CommandSpec> {
    @SuppressWarnings("unchecked")
    public CommandSpecParser() {
      super(new ImmutableMap.Builder<String, BiConsumer<CommandSpec, Object>>()
                .put("redirect", (command, value) -> command.redirect = (String) value)
                .put("parameters", (command, value) -> {
                  List<VariableSpec> parameters = new ArrayList<>();
                  ((List<Map<String, Object>>) value).forEach(item -> {
                    VariableSpec parameter = new VariableSpec(command.domain);
                    parameter.parse(item);
                    parameters.add(parameter);
                  });
                  command.parameters = parameters;
                })
                .put("returns", (command, value) -> {
                  List<VariableSpec> returns = new ArrayList<>();
                  ((List<Map<String, Object>>) value).forEach(item -> {
                    VariableSpec res = new VariableSpec(command.domain);
                    res.parse(item);
                    returns.add(res);
                  });
                  if (returns.size() == 0) {
                    command.type = new VoidType();
                  } else if (returns.size() == 1) {
                    command.type = returns.get(0).type;
                  } else {
                    String name = capitalize(command.name) + "Response";
                    List<VariableSpec> properties = returns.stream().map(item -> {
                      VariableSpec field = new VariableSpec(command.domain);
                      field.name = item.name;
                      field.description = item.description;
                      field.optional = item.optional;
                      field.type = item.type;
                      return field;
                    }).collect(Collectors.toList());
                    command.type = new ObjectType(command, name, properties);
                  }
                })
                .build());
    }
  }

  private interface IType {
    String getName();
    String getTypeToken();
    String getJavaType();
    String getJavaDefaultValue();
    TypeDeclaration<?> toTypeDeclaration();
    String getMapper();
  }

  private static class VoidType implements IType {

    @Override
    public String getName() {
      return "void";
    }

    @Override
    public String getTypeToken() {
      return "Void.class";
    }

    @Override
    public String getJavaType() {
      return "Void";
    }

    @Override
    public String getJavaDefaultValue() {
      return "null";
    }

    @Override
    public TypeDeclaration<?> toTypeDeclaration() {
      throw new UnsupportedOperationException();
    }

    @Override
    public String getMapper() {
      throw new UnsupportedOperationException();
    }
  }

  private static class SimpleType implements IType {
    private String name;
    private String type;

    public SimpleType(String name, String type) {
      this.name = name;
      this.type = type;
    }

    @Override
    public String getName() {
      return name;
    }

    @Override
    public String getTypeToken() {
      if (type.equals("object")) {
        return "new com.google.common.reflect.TypeToken<java.util.Map<String, Object>>() {}.getType()";
      } else {
        return getJavaType() + ".class";
      }
    }

    @Override
    public String getJavaType() {
      switch (type) {
        case "boolean":
          return Boolean.class.getName();
        case "integer":
          return Integer.class.getName();
        case "number":
          return Number.class.getName();
        case "string":
          return String.class.getName();
        case "any":
          return Object.class.getName();
        case "object":
          return "java.util.Map<String, Object>";
        case "array":
          return Object.class.getName();
        default:
          throw new RuntimeException("Unknown simple type: " + name);
      }
    }

    @Override
    public String getJavaDefaultValue() {
      switch (type) {
        case "boolean":
          return "false";
        case "integer":
          return "0";
        case "number":
          return "0";
        case "any":
        case "array":
        case "object":
        case "string":
          return "null";
        default:
          throw new RuntimeException("Unknown simple type: " + name);
      }
    }

    public TypeDeclaration<?> toTypeDeclaration() {
      ClassOrInterfaceDeclaration classDecl = new ClassOrInterfaceDeclaration().setName(name);

      if (type.equals("object")) {
        classDecl.addExtendedType("com.google.common.collect.ForwardingMap<String, Object>");
      }

      String propertyName = decapitalize(name);
      classDecl.addField(getJavaType(), propertyName).setPrivate(true).setFinal(true);

      ConstructorDeclaration constructor = classDecl.addConstructor().setPublic(true);
      constructor.addParameter(getJavaType(), propertyName);
      constructor.getBody().addStatement(String.format(
          "this.%s = java.util.Objects.requireNonNull(%s, \"Missing value for %s\");",
          propertyName, propertyName, name
      ));

      if (type.equals("object")) {
        MethodDeclaration delegate = classDecl.addMethod("delegate").setProtected(true);
        delegate.setType("java.util.Map<String, Object>");
        delegate.getBody().get().addStatement(String.format("return %s;", propertyName));
      }

      MethodDeclaration fromJson = classDecl.addMethod("fromJson").setPrivate(true).setStatic(true);
      fromJson.setType(name);
      fromJson.addParameter(JsonInput.class, "input");
      fromJson.getBody().get().addStatement(
          String.format("return new %s(%s);", name, getMapper()));

      MethodDeclaration toJson = classDecl.addMethod("toJson").setPublic(true);
      if (type.equals("object")) {
        toJson.setType("java.util.Map<String, Object>");
        toJson.getBody().get().addStatement(String.format("return %s;", propertyName));
      } else if (type.equals("number")) {
        toJson.setType(Number.class);
        toJson.getBody().get().addStatement(String.format("return %s;", propertyName));
      } else if (type.equals("integer")) {
        toJson.setType(Integer.class);
        toJson.getBody().get().addStatement(String.format("return %s;", propertyName));
      } else {
        toJson.setType(String.class);
        toJson.getBody().get().addStatement(String.format("return %s.toString();", propertyName));
      }

      MethodDeclaration toString = classDecl.addMethod("toString").setPublic(true);
      toString.setType(String.class);
      toString.getBody().get().addStatement(String.format("return %s.toString();", propertyName));

      return classDecl;
    }

    @Override
    public String getMapper() {
      switch (type) {
        case "boolean":
          return "input.nextBoolean()";
        case "integer":
          return "input.nextNumber().intValue()";
        case "number":
          return "input.nextNumber()";
        case "string":
          return "input.nextString()";
        case "any":
          return "input.read(Object.class)";
        case "object":
          return "input.read(new com.google.common.reflect.TypeToken<java.util.Map<String, Object>>() {}.getType())";
        case "array":
          return "input.nextString()";
        default:
          return String.format("input.read(%s.class)", getJavaType());
      }
    }
  }

  private static class EnumType implements IType {

    protected TypedSpec parent;
    protected String name;
    protected final List<String> values;

    public EnumType(TypedSpec parent, String name, List<String> values) {
      this.parent = parent;
      this.name = capitalize(name);
      this.values = values;
    }

    @Override
    public String getName() {
      return name;
    }

    @Override
    public String getTypeToken() {
      return getJavaType() + ".class";
    }

    @Override
    public String getJavaType() {
      return parent.getNamespace() + "." + name;
    }

    @Override
    public String getJavaDefaultValue() {
      return "null";
    }

    public TypeDeclaration<?> toTypeDeclaration() {
      EnumDeclaration enumDecl = new EnumDeclaration().setName(capitalize(name)).setPublic(true);

      values.forEach(val ->
        enumDecl.addEnumConstant(toJavaConstant(val)).addArgument(String.format("\"%s\"", val))
      );

      enumDecl.addField(String.class, "value").setPrivate(true);

      enumDecl.addConstructor()
          .addParameter(String.class, "value")
          .getBody().addStatement("this.value = value;");

      enumDecl.addMethod("fromString").setPublic(true).setStatic(true)
          .addParameter(String.class, "s")
          .setType(name)
          .getBody().get()
          .addStatement(String.format("return java.util.Arrays.stream(%s.values())\n"
                                      + ".filter(rs -> rs.value.equalsIgnoreCase(s))\n"
                                      + ".findFirst()\n"
                                      + ".orElseThrow(() -> new org.openqa.selenium.devtools.DevToolsException(\n"
                                      + "\"Given value \" + s + \" is not found within %s \"));",
                                      name, name));

      enumDecl.addMethod("toString").setPublic(true)
        .setType(String.class)
        .getBody().get()
          .addStatement("return value;");

      enumDecl.addMethod("toJson").setPublic(true)
          .setType(String.class)
          .getBody().get()
          .addStatement("return value;");

      enumDecl.addMethod("fromJson").setPrivate(true).setStatic(true)
          .setType(name)
          .addParameter(JsonInput.class, "input")
          .getBody().get()
          .addStatement("return fromString(input.nextString());");

      return enumDecl;
    }

    @Override
    public String getMapper() {
      return String.format("%s.fromString(input.nextString())", name);
    }
  }

  private static class InlineEnumType extends EnumType {
    public InlineEnumType(TypedSpec parent, String name, List<String> values) {
      super(parent, name, values);
    }

    @Override
    public String getTypeToken() {
      return getJavaType() + ".class";
    }

    public String getJavaType() {
      return name;
    }
  }

  private static class ObjectType implements IType {

    private TypedSpec parent;
    private String name;
    private List<VariableSpec> properties;

    public ObjectType(TypedSpec parent, String name, List<VariableSpec> properties) {
      this.parent = parent;
      this.name = name;
      this.properties = properties;
    }

    @Override
    public String getName() {
      return name;
    }

    @Override
    public String getTypeToken() {
      return getJavaType() + ".class";
    }

    @Override
    public String getJavaType() {
      return parent.getNamespace() + "." + capitalize(name);
    }

    @Override
    public String getJavaDefaultValue() {
      return "null";
    }

    public TypeDeclaration<?> toTypeDeclaration() {
      ClassOrInterfaceDeclaration classDecl = new ClassOrInterfaceDeclaration().setName(capitalize(name));

      properties.stream().filter(property -> property.type instanceof EnumType).forEach(
          property -> classDecl.addMember(property.type.toTypeDeclaration()));

      properties.forEach(property -> classDecl.addField(
          property.getJavaType(), property.getFieldName()).setPrivate(true).setFinal(true));

      ConstructorDeclaration constructor = classDecl.addConstructor().setPublic(true);
      properties.forEach(
          property -> constructor.addParameter(property.getJavaType(), property.getFieldName()));
      properties.forEach(property -> {
        if (property.optional) {
          constructor.getBody().addStatement(String.format(
              "this.%s = %s;", property.getFieldName(), property.getFieldName()));
        } else {
          constructor.getBody().addStatement(String.format(
              "this.%s = java.util.Objects.requireNonNull(%s, \"%s is required\");",
              property.getFieldName(), property.getFieldName(), property.name));
        }
      });

      properties.forEach(property -> {
        MethodDeclaration getter = classDecl.addMethod("get" + capitalize(property.name)).setPublic(true);
        getter.setType(property.getJavaType());
        if (property.description != null) {
          getter.setJavadocComment(property.description);
        }
        if (property.experimental) {
          getter.addAnnotation(Beta.class);
        }
        if (property.deprecated) {
          getter.addAnnotation(Deprecated.class);
        }
        getter.getBody().get().addStatement(String.format("return %s;", property.getFieldName()));
      });

      MethodDeclaration fromJson = classDecl.addMethod("fromJson").setPrivate(true).setStatic(true);
      fromJson.setType(capitalize(name));
      fromJson.addParameter(JsonInput.class, "input");
      BlockStmt body = fromJson.getBody().get();
      if (properties.size() > 0) {
        properties.forEach(property -> {
          if (property.optional) {
            body.addStatement(String.format("%s %s = java.util.Optional.empty();", property.getJavaType(), property.getFieldName()));
          } else {
            body.addStatement(String.format("%s %s = %s;", property.getJavaType(), property.getFieldName(), property.getDefaultValue()));
          }
        });

        body.addStatement("input.beginObject();");
        body.addStatement(
            "while (input.hasNext()) {"
            + "switch (input.nextName()) {"
            + properties.stream().map(property -> {
              String mapper = String.format(
                property.optional ? "java.util.Optional.ofNullable(%s)" : "%s",
                property.type.getMapper());

              return String.format(
                "case \"%s\":"
                  + "  %s = %s;"
                  + "  break;",
                property.name, property.getFieldName(), mapper);
            })
                .collect(joining("\n"))
            + "  default:\n"
            + "    input.skipValue();\n"
            + "    break;"
            + "}}");
        body.addStatement("input.endObject();");
        body.addStatement(String.format(
            "return new %s(%s);", capitalize(name),
            properties.stream().map(VariableSpec::getFieldName)
                .collect(joining(", "))));
      } else {
        body.addStatement(String.format("return new %s();", capitalize(name)));
      }

      return classDecl;
    }

    @Override
    public String getMapper() {
      return String.format("input.read(%s.class)", getJavaType());
    }
  }

  private static class ArrayType implements IType {
    private IType itemType;
    private String name;

    public ArrayType(String name) {
      this.name = name;
    }

    @Override
    public String getTypeToken() {
      return String.format("new com.google.common.reflect.TypeToken<%s>() {}.getType()", getJavaType());
    }

    @Override
    public String getName() {
      return name;
    }

    @Override
    public String getJavaType() {
      return String.format("java.util.List<%s>", itemType.getJavaType());
    }

    @Override
    public String getJavaDefaultValue() {
      return "null";
    }

    public TypeDeclaration<?> toTypeDeclaration() {
      ClassOrInterfaceDeclaration classDecl = new ClassOrInterfaceDeclaration().setName(name);

      String propertyName = decapitalize(name);
      classDecl.addField(getJavaType(), propertyName).setPrivate(true).setFinal(true);

      ConstructorDeclaration constructor = classDecl.addConstructor().setPublic(true);
      constructor.addParameter(getJavaType(), propertyName);
      constructor.getBody().addStatement(String.format(
          "this.%s = java.util.Objects.requireNonNull(%s, \"Missing value for %s\");",
          propertyName, propertyName, name
      ));

      MethodDeclaration fromJson = classDecl.addMethod("fromJson").setPrivate(true).setStatic(true);
      fromJson.setType(name);
      fromJson.addParameter(JsonInput.class, "input");
      fromJson.getBody().get().addStatement(String.format("return %s;", getMapper()));

      MethodDeclaration toString = classDecl.addMethod("toString").setPublic(true);
      toString.setType(String.class);
      toString.getBody().get().addStatement(String.format("return %s.toString();", propertyName));

      return classDecl;
    }

    @Override
    public String getMapper() {
      return String.format(
          "input.read(new com.google.common.reflect.TypeToken<java.util.List<%s>>() {}.getType())",
          itemType.getJavaType());
    }

    public void parse(Domain domain, Map<String, Object> json) {
      json.forEach((key, value) -> {
        switch (key) {
          case "type":
            itemType = new SimpleType("", (String) value);
            break;
          case "$ref":
            itemType = new RefType("", domain, (String) value);
            break;
          default:
            throw new RuntimeException("Parsing event: unexpected key " + key);
        }
      });
    }
  }

  private static class RefType implements IType {
    private String name;
    private Domain domain;
    private String type;

    public RefType(String name, Domain domain, String type) {
      this.name = name;
      this.domain = domain;
      this.type = type;
    }

    @Override
    public String getName() {
      return name;
    }

    @Override
    public String getTypeToken() {
      return getJavaType() + ".class";
    }

    @Override
    public String getJavaType() {
      int dotPoint = type.indexOf('.');
      if (dotPoint >= 0) {
        // external domain
        String extDomain = type.substring(0, dotPoint);
        String typeName = type.substring(dotPoint + 1);
        return String.format("%s.%s.model.%s", domain.model.basePackage, extDomain.toLowerCase(), typeName);

      } else {
        return String.format("%s.%s.model.%s", domain.model.basePackage, domain.name.toLowerCase(), type);
      }
    }

    @Override
    public String getJavaDefaultValue() {
      return "null";
    }

    public TypeDeclaration<?> toTypeDeclaration() {
      return null;
    }

    @Override
    public String getMapper() {
      return String.format("input.read(%s.class)", getJavaType());
    }
  }

  private static void ensureDirectoryExists(Path domainDir) {
    if (!Files.exists(domainDir)) {
      try {
        Files.createDirectories(domainDir);
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }
  }

  private static void ensureFileDoesNotExists(Path file) {
    if (Files.exists(file)) {
      try {
        Files.delete(file);
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }
  }

  private static String capitalize(String text) {
    return text.substring(0, 1).toUpperCase() + text.substring(1);
  }

  private static String decapitalize(String text) {
    return text.substring(0, 1).toLowerCase() + text.substring(1);
  }

  private static String toJavaConstant(String text) {
    return text.toUpperCase().replace("-", "_");
  }
}
