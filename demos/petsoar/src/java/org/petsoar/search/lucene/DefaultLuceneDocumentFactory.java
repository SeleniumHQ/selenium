/*
 * Copyright (c) 2003-2005, Wiley & Sons, Joe Walnes,Ara Abrahamian,
 * Mike Cannon-Brookes,Patrick A Lightbody
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the distribution.
 *     * Neither the name of the 'Wiley & Sons', 'Java Open Source
 * Programming' nor the names of the authors may be used to endorse or
 * promote products derived from this software without specific prior
 * written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.petsoar.search.lucene;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.digester.Digester;
import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.lucene.analysis.*;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.*;

/**
 * The default implementation of LuceneDocumentFactory that looks after a file named <class-name>.lucene.xml and reads
 * the Lucene Document creation instuctions from it.
 */
public class DefaultLuceneDocumentFactory implements LuceneDocumentFactory {

    private Map classConfigurations = new HashMap();

    public Document createDocument(Object obj) {
        ClassConfiguration classConfig = getClassConfiguration(obj);

        return createDocumentForObjectFromClassConfiguration(obj, classConfig);
    }

    public String getHandleAttributeName(Object obj) {
        ClassConfiguration class_config = getClassConfiguration(obj);

        return class_config.getHandleField().getAttributeName();
    }

    public String getHandleFieldName(Object obj) {
        ClassConfiguration class_config = getClassConfiguration(obj);

        return class_config.getHandleField().getFieldName();
    }

    public Analyzer createAnalyzer() {
        return new DefaultAnalyzer();
    }

    private ClassConfiguration getClassConfiguration(Object obj) {
        ClassConfiguration class_config;

        synchronized (classConfigurations) {
            class_config = (ClassConfiguration) classConfigurations.get(obj.getClass().getName());

            if (class_config == null) {
                class_config = loadClassConfiguration(obj.getClass());
            }
        }

        return class_config;
    }

    private Document createDocumentForObjectFromClassConfiguration(Object obj,
                                                                   ClassConfiguration class_config) {
        Iterator iter = class_config.getFieldConfigurations().iterator();
        Document doc = new Document();

        while (iter.hasNext()) {
            FieldConfiguration fieldConfiguration = (FieldConfiguration) iter.next();
            String strContent = getStringContentOfAttribute(obj,
                    fieldConfiguration.getAttributeName());
            Field field = null;

            if (fieldConfiguration.getType().equals(FieldConfiguration.TYPE_TEXT)) {
                field = Field.Text(fieldConfiguration.getFieldName(), strContent);
            } else if (fieldConfiguration.getType().equals(FieldConfiguration.TYPE_KEYWORD)) {
                field = Field.Keyword(fieldConfiguration.getFieldName(),
                        strContent);
            } else if (fieldConfiguration.getType().equals(FieldConfiguration.TYPE_UNINDEXED)) {
                field = Field.UnIndexed(fieldConfiguration.getFieldName(),
                        strContent);
            } else if (fieldConfiguration.getType().equals(FieldConfiguration.TYPE_UNSTORED)) {
                field = Field.UnStored(fieldConfiguration.getFieldName(),
                        strContent);
            } else if (fieldConfiguration.getType().equals(FieldConfiguration.TYPE_HANDLE)) {
                field = Field.Keyword(fieldConfiguration.getFieldName(),
                        strContent);
            } else {
                throw new LuceneException(
                        "Unknown type for a field, fieldName=" +
                        fieldConfiguration.getFieldName());
            }

            doc.add(field);
        }

        return doc;
    }

    private static String getStringContentOfAttribute(Object obj,
                                                      String attributeName) {
        try {
            String str = BeanUtils.getProperty(obj, attributeName);

            return (str == null) ? "" : str;
        } catch (Exception e) {
            throw new LuceneException(
                    "Couldn't get string content of attribute, attributeName=" +
                    attributeName);
        }
    }

    private void addClassConfiguration(Class clazz,
                                       ClassConfiguration classConfiguration) {
        classConfigurations.put(clazz.getName(), classConfiguration);
    }

    private ClassConfiguration loadClassConfiguration(Class clazz) {
        InputStream configXml = loadConfigFile(clazz);

        ClassConfiguration newClassConfig = new ClassConfiguration();
        Digester digester = new Digester();

        digester.push(newClassConfig);
        digester.addObjectCreate("configuration/field",
                FieldConfiguration.class.getName());
        digester.addSetProperties("configuration/field");
        digester.addSetNext("configuration/field", "addFieldConfiguration",
                FieldConfiguration.class.getName());

        try {
            digester.parse(new InputStreamReader(configXml));

            addClassConfiguration(clazz, newClassConfig);

            return newClassConfig;
        } catch (Exception e) {
            throw new LuceneException(
                    "Couldn't load lucene config file successfully, file=" + clazz, e);
        }
    }

    private InputStream loadConfigFile(Class clazz) {
        String configFileName = clazz.getName().replace('.', '/') + ".lucene.xml";
        InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream(configFileName);

        if (is != null) {
            return is;
        } else {
            // Hibernate generates a CGLIB-based subclass when the POJO is a proxy, so check the superclass too
            configFileName = clazz.getSuperclass().getName().replace('.', '/') + ".lucene.xml";
            is = Thread.currentThread().getContextClassLoader().getResourceAsStream(configFileName);
            return is;
        }
    }

    //~ Classes ----------------------------------------------------------------

    public static final class ClassConfiguration {
        private List fieldConfigurations = new ArrayList();

        public void addFieldConfiguration(FieldConfiguration fieldConfiguration) {
            fieldConfigurations.add(fieldConfiguration);
        }

        public List getFieldConfigurations() {
            return fieldConfigurations;
        }

        private FieldConfiguration getHandleField() {
            for (int i = 0; i < fieldConfigurations.size(); i++) {
                FieldConfiguration fieldConfiguration = (FieldConfiguration) fieldConfigurations.get(i);

                if (fieldConfiguration.getType().equals(FieldConfiguration.TYPE_HANDLE)) {
                    return fieldConfiguration;
                }
            }

            throw new LuceneException("No handle field found.");
        }

        public boolean equals(Object obj) {
            return EqualsBuilder.reflectionEquals(this, obj);
        }

        public int hashCode() {
            return HashCodeBuilder.reflectionHashCode(this);
        }

        public String toString() {
            return ToStringBuilder.reflectionToString(this);
        }
    }

    public static final class FieldConfiguration {
        public static final String TYPE_TEXT = "Text";
        public static final String TYPE_KEYWORD = "Keyword";
        public static final String TYPE_UNINDEXED = "UnIndexed";
        public static final String TYPE_UNSTORED = "UnStored";
        public static final String TYPE_HANDLE = "Handle";
        private String type;
        private String fieldName;
        private String attributeName;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getFieldName() {
            return fieldName;
        }

        public void setFieldName(String fieldName) {
            this.fieldName = fieldName;
        }

        public String getAttributeName() {
            return attributeName;
        }

        public void setAttributeName(String attributeName) {
            this.attributeName = attributeName;
        }

        public boolean equals(Object obj) {
            return EqualsBuilder.reflectionEquals(this, obj);
        }

        public int hashCode() {
            return HashCodeBuilder.reflectionHashCode(this);
        }

        public String toString() {
            return ToStringBuilder.reflectionToString(this);
        }
    }

    public static class DefaultAnalyzer extends Analyzer {
        public TokenStream tokenStream(String fieldName, Reader reader) {
            LetterTokenizer tokenizer = new LetterTokenizer(reader);
            TokenStream result = null;
            result = new LowerCaseFilter(tokenizer);
            result = new StopFilter(result, StopAnalyzer.ENGLISH_STOP_WORDS);
            result = new PorterStemFilter(result);

            return result;
        }
    }
}
