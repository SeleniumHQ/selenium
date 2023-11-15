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

package org.openqa.selenium.grid.graphql;

import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

class Types {

  static final GraphQLScalarType Url = urlType();
  static final GraphQLScalarType Uri = uriType();

  private static GraphQLScalarType uriType() {
    return GraphQLScalarType.newScalar()
        .name("Uri")
        .coercing(
            new Coercing<URI, String>() {
              @Override
              public String serialize(Object o) throws CoercingSerializeException {
                if (o instanceof String) {
                  return (String) o;
                }

                if (o instanceof URL || o instanceof URI) {
                  return String.valueOf(o);
                }

                throw new CoercingSerializeException("Unable to coerce " + o);
              }

              @Override
              public URI parseValue(Object input) throws CoercingParseValueException {
                if (input == null) {
                  return null;
                }

                if (input instanceof URI) {
                  return (URI) input;
                }

                try {
                  if (input instanceof String) {
                    return new URI((String) input);
                  }

                  if (input instanceof URL) {
                    return ((URL) input).toURI();
                  }
                } catch (URISyntaxException e) {
                  throw new CoercingParseValueException("Unable to create URI: " + input, e);
                }

                throw new CoercingParseValueException("Unable to create URI: " + input);
              }

              @Override
              public URI parseLiteral(Object input) throws CoercingParseLiteralException {
                if (!(input instanceof StringValue)) {
                  throw new CoercingParseLiteralException("Cannot convert to URL: " + input);
                }

                try {
                  return new URI(((StringValue) input).getValue());
                } catch (URISyntaxException e) {
                  throw new CoercingParseLiteralException("Unable to parse: " + input);
                }
              }
            })
        .build();
  }

  private static GraphQLScalarType urlType() {
    return GraphQLScalarType.newScalar()
        .name("Url")
        .coercing(
            new Coercing<URL, String>() {
              @Override
              public String serialize(Object o) throws CoercingSerializeException {
                if (o instanceof String) {
                  return (String) o;
                }

                if (o instanceof URL || o instanceof URI) {
                  return String.valueOf(o);
                }

                throw new CoercingSerializeException("Unable to coerce " + o);
              }

              @Override
              public URL parseValue(Object input) throws CoercingParseValueException {
                if (input == null) {
                  return null;
                }

                if (input instanceof URL) {
                  return (URL) input;
                }

                try {
                  if (input instanceof String) {
                    return new URL((String) input);
                  }

                  if (input instanceof URI) {
                    return ((URI) input).toURL();
                  }
                } catch (MalformedURLException e) {
                  throw new CoercingParseValueException("Unable to create URL: " + input, e);
                }

                throw new CoercingParseValueException("Unable to create URL: " + input);
              }

              @Override
              public URL parseLiteral(Object input) throws CoercingParseLiteralException {
                if (!(input instanceof StringValue)) {
                  throw new CoercingParseLiteralException("Cannot convert to URL: " + input);
                }

                try {
                  return new URL(((StringValue) input).getValue());
                } catch (MalformedURLException e) {
                  throw new CoercingParseLiteralException("Unable to parse: " + input);
                }
              }
            })
        .build();
  }
}
