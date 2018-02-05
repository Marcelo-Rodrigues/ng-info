const regex_start_component = /@Component\s*\(\s*\{\s*/;
const regex_end_component = /\s*\}\s*\)/;
const regex_component_selector = /\s*selector:\s*["']([\w-_]*)/;
const regex_component_templateUrl = /\s*templateUrl:\s*["']([\.\/\\\w-_]*)/;
const regex_inputs = /@Input\s*\(('[\w-]*')?\)\s*([\w-]*)(\s*:\s*)?([\w-<>\(\)]*)(\s*=\s*(new)?\s*)?(([\w<>'"])*|'[^']*')?\(?\w*\s*\)?;/g;
const regex_outputs = /@Output\s*\(('[\w-]*')?\)\s*([\w-]*)(\s*:\s*)?([\w-<>\(\)]*)(\s*=\s*(new)?\s*)?(([\w<>'"])*|'[^']*')?\(?\w*\s*\)?;/g;

const fs = require('fs');
const path = require('path');
const CodeInfo = require('./code-info');
const DependencyInfo = require('./dependency-info');
const CodeType = require('./code-type');

class ComponentInfo extends CodeInfo {

    constructor(path) {
        super(path, CodeType.TypeScript);
    }

    get decoratorProps() {
        if (!this._decoratorProps) {
            const matchStartCompDec = regex_start_component.exec(this.code);
            const posStartCompDec = matchStartCompDec.index + matchStartCompDec[0].length;
            const posEndCompDec = regex_end_component.exec(this.code.substring(posStartCompDec)).index;
            this._decoratorProps = this.code.substring(posStartCompDec, posEndCompDec + posStartCompDec);
        }

        return this._decoratorProps;
    }

    get selector() {
        if (!this._selector) {
            this._selector = regex_component_selector.exec(this.decoratorProps)[1];
        }

        return this._selector;
    }

    get templateUrl() {
        if (!this._templateUrl) {
            this._templateUrl = regex_component_templateUrl.exec(this.decoratorProps)[1];
        }

        return this._templateUrl;
    }

    get absoluteTemplateUrl() {
        if (!this._absoluteTemplateUrl) {
            this._absoluteTemplateUrl = this.getAbsoluteUrl(this.templateUrl);
        }

        return this._absoluteTemplateUrl;
    }

    get dependencies() {
        if (!this._dependencyInfo) {
            this._dependencyInfo = new DependencyInfo(this.absoluteTemplateUrl);
        }

        return this._dependencyInfo;
    }

    _findIOs(regex) {

        var match;
        let result = [];

        while (match = regex.exec(this.codeNoComments)) {
            if (match && !result.find(item => item === match[1])) {
                result.push({
                    inputName: match[2],
                    inputType: match[4] ? match[4] : match[7]
                });
            }
        }

        regex.lastIndex = 0;

        return result;
    }

    get inputs() {
        return this._findIOs(regex_inputs);
    }

    get outputs() {
        return this._findIOs(regex_outputs);
    }

    getAll() {
        return {
            code: this.code,
            path: this.path,
            decoratorProps: this.decoratorProps,
            selector: this.selector,
            templateUrl: this.templateUrl,
            absoluteTemplateUrl: this.absoluteTemplateUrl,
            cleanCode: super.codeNoComments,
            dependencies: this.dependencies.getDependencies(),
            inputs: this.inputs,
            outputs: this.outputs
        };
    }
}

module.exports = ComponentInfo;