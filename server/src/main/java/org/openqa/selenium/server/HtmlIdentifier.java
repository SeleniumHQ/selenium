package org.openqa.selenium.server;

import java.util.ArrayList;
import java.util.List;

public class HtmlIdentifier {
    private static List<Rule> rules = new ArrayList<Rule>();

    static {
        rules.add(new ExtensionRule(new String[]{"html", "htm"}, 10000));
        rules.add(new ExtensionRule(new String[]{"jsp", "asp", "php", "pl"}, 100));
        // ebay dll contains HTML snippets which fool InjectionHelper.  -nas
        rules.add(new ExtensionRule(new String[]{"dll", "gif", "ico", "jpg", "jpeg", "png", "dwr", "js"}, -1000));
        rules.add(new ContentRule("<html", 1000, -100));
        rules.add(new ContentRule("<!DOCTYPE html", 1000, -100));
        rules.add(new ContentRule("<!DOCTYPE html", 1000, -100));
        rules.add(new ContentTypeRule("text/html", 100, -1000));
        rules.add(new Rule() {
            public int score(String path, String contentType, String contentPreview) {
                if (path == null) {
                    return 0;
                }

                // dojo should never be processed
                if (path.contains("/dojo/")) {
                    return -100000;
                }

                return 0;
            }
        });
    }

    public static boolean shouldBeInjected(String path, String contentType, String contentPreview) {
        int score = 0;

        for (Rule rule : rules) {
            score += rule.score(path, contentType, contentPreview);
        }

        return score > 200;
    }

    static interface Rule {
        int score(String path, String contentType, String contentPreview);
    }

    static class ExtensionRule implements Rule {
        List<String> exts = new ArrayList<String>();
        int score;

        public ExtensionRule(String ext, int score) {
            exts.add(ext);
            this.score = score;
        }

        public ExtensionRule(String[] ext, int score) {
            for (String s : ext) {
                exts.add(s);
            }
            this.score = score;
        }

        public int score(String path, String contentType, String contentPreview) {
            if (path == null) {
                return 0;
            }

            for (String ext : exts) {
                if (path.endsWith("." + ext)) {
                    return score;
                }
            }

            return 0;
        }
    }

    static class ContentRule implements Rule {
        String content;
        int score;
        int missingScore;

        public ContentRule(String content, int score, int missingScore) {
            this.content = content;
            this.score = score;
            this.missingScore = missingScore;
        }

        public int score(String path, String contentType, String contentPreview) {
            if (contentPreview == null) {
                return 0;
            }

            if (contentPreview.toLowerCase().contains(content.toLowerCase())) {
                return score;
            }

            return missingScore;
        }
    }

    static class ContentTypeRule implements Rule {
        String type;
        int score;
        int missingScore;

        public ContentTypeRule(String type, int score, int missingScore) {
            this.type = type;
            this.score = score;
            this.missingScore = missingScore;
        }

        public int score(String path, String contentType, String contentPreview) {
            if (type.equals(contentType)) {
                return score;
            }

            return missingScore;
        }
    }
}
