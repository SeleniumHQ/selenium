declare module emailAddresses {
    function parseOneAddress(input: string | Options): ParsedMailbox | ParsedGroup;
    function parseAddressList(input: string | Options): (ParsedMailbox | ParsedGroup)[];
    function parseFrom(input: string | Options): (ParsedMailbox | ParsedGroup)[];
    function parseSender(input: string | Options): ParsedMailbox | ParsedGroup;
    function parseReplyTo(input: string | Options): (ParsedMailbox | ParsedGroup)[];

    interface ParsedMailbox {
        node?: ASTNode;
        parts: {
            name: ASTNode;
            address: ASTNode;
            local: ASTNode;
            domain: ASTNode;
            comments: ASTNode[];
        };
        type: string;
        name: string;
        address: string;
        local: string;
        domain: string;
    }

    interface ParsedGroup {
        node?: ASTNode;
        parts: {
            name: ASTNode;
        };
        type: string;
        name: string;
        addresses: ParsedMailbox[];
    }

    interface ASTNode {
        name: string;
        tokens: string;
        semantic: string;
        children: ASTNode[];
    }

    interface Options {
        input: string;
        oneResult?: boolean;
        partial?: boolean;
        rejectTLD?: boolean;
        rfc6532?: boolean;
        simple?: boolean;
        startAt?: string;
        strict?: boolean;
    }

    interface ParsedResult {
        ast: ASTNode;
        addresses: (ParsedMailbox | ParsedGroup)[];
    }
}

declare function emailAddresses(opts: emailAddresses.Options): emailAddresses.ParsedResult;

declare module "email-addresses" {
    export = emailAddresses;
}

/* Example usage:

// Run this file with:
//  tsc test.ts && NODE_PATH="../emailaddresses/lib" node test.js
/// <reference path="../emailaddresses/lib/email-addresses.d.ts"/>
import emailAddresses = require('email-addresses');

function isParsedMailbox(mailboxOrGroup: emailAddresses.ParsedMailbox | emailAddresses.ParsedGroup): mailboxOrGroup is emailAddresses.ParsedMailbox {
    return mailboxOrGroup.type === 'mailbox';
}

var testEmail : string = "TestName (a comment) <test@example.com>";
console.log(testEmail);

var parsed = emailAddresses.parseOneAddress(testEmail);
console.log(parsed);

var a : string = parsed.parts.name.children[0].name;
console.log(a);

if (isParsedMailbox(parsed)) {
    var comment : string = parsed.parts.comments[0].tokens;
    console.log(comment);
} else {
    console.error('error, should be a ParsedMailbox');
}

//

var emailList : string = "TestName <test@example.com>, TestName2 <test2@example.com>";
console.log(emailList);

var parsedList = emailAddresses.parseAddressList(emailList);
console.log(parsedList);

var b : string = parsedList[1].parts.name.children[0].semantic;
console.log(b);

//

var parsedByModuleFxn = emailAddresses({ input: emailList, rfc6532: true });
console.log(parsedByModuleFxn.addresses[0].name);

*/
