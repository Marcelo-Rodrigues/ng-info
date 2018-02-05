const CodeInfo = require('./code-info');
const CodeType = require('./code-type');


class DependencyInfo extends CodeInfo {

    constructor(path) {
        super(path, CodeType.Html);
    }

    getDependencies() {
        var match;
        let result = [];

        const regex_tag_component = /<((my|app)-[\w-]*)\s*/g;

        while (match = regex_tag_component.exec(this.codeNoComments)) {
            if (match && !result.find(item => item === match[1])) {
                result.push(match[1]);

                console.log(this.path, match[1]);
            }
        }

        return result;
    }
}

module.exports = DependencyInfo;