package XMLParseUtils;
use strict;
use warnings;
use base 'Exporter';
our @EXPORT_OK = qw/strip_blockquotes/;

sub strip_blockquotes {
    my $xml = shift;
    while ($xml =~ m#(<blockquote>\n*)(.*?)(\n*</blockquote>)#s) {
        my ($start_bq, $new_text, $ending_bq) = ($1, $2, $3);
        if ($new_text =~ /<blockquote>/) {
            # found a nested blockquote!  Eek!
            $new_text = strip_blockquotes($new_text . $ending_bq);
            $new_text = "$start_bq$new_text\n";
#            warn "new_text=($new_text)";
        }
        else {
            my @lines = split "\n", $new_text;
            $new_text = "\n=over\n\n"
                       . join("\n", @lines)
                       . "\n\n=back\n\n";

            # hack for Element Filters section - it's inconsistent with the
            # other sections, and shouldn't be in a blockquote 
            # Remove this once fixed
            if ($lines[0] =~ m/^Element filters can be used/) {
                $new_text = "\n" . join("\n", @lines) . "\n";
            }

        }

        $xml =~ s#<blockquote>.*?</blockquote>\n?#$new_text#s or die;
#        warn "xml=($xml)";
    }
    return $xml;
}

1;
