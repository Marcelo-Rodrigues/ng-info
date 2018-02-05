class CodeType {
    static get TypeScript() {
        return {
            regexCodeComment: /\/\/[^\n]*/,
            regexCodeCommentBlock: /\/\*(\*(?!\/)|[^*])*\*\//
        };
    };

    static get Html() {
        return {
            regexCodeComment: null,
            regexCodeCommentBlock: /<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-]|--[^\>])*--[ \r\n\t]*)\>/
        };
    };
}

module.exports = CodeType;