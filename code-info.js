const fs = require('fs');
const path = require('path');
const CodeType = require('./code-type');

class CodeInfo {

    constructor(path, codeType = CodeType.TypeScript) {
        this.path = path;
        this.codeType = codeType;
    }

    _findRemoveComment(regex, code) {
        const match = regex.exec(code);

        if (match && match.length) {
            const init = code.substring(0, match.index - 1);
            const end = code.substring(match.index + match[0].length);
            return init + end;
        }

        return null;
    }

    get codeNoComments() {

        if(!this._codeNoComments) {
            let cleanCode = this.code;
    
            const regexToRun = [];
            if (this.codeType.regexCodeComment) {
                regexToRun.push(this.codeType.regexCodeComment);
            }
    
            if (this.codeType.regexCodeCommentBlock) {
                regexToRun.push(this.codeType.regexCodeCommentBlock);
            }
    
            regexToRun.forEach(regex => {
                let newCode = this.code;
                do {
                    newCode = this._findRemoveComment(regex, newCode);
    
                    if (newCode) {
                        cleanCode = newCode;
                    }
                } while (newCode);
            });

            this._codeNoComments = cleanCode;
        }

        return this._codeNoComments;
    }

    get code() {
        if (!this._code) {
            this._code = fs.readFileSync(this.path, 'utf8');
        }

        return this._code;
    }

    getAbsoluteUrl(relativeUrl) {
        return path.normalize(path.join(path.dirname(this.path), relativeUrl));
    }
}

module.exports = CodeInfo;