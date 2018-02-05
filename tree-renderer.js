class TreeRenderer {

    _renderChild(ref) {
        let content = encodeHtmlEntity(ref.label);

        if (ref.children && ref.children.length) {
            content += '<ul>' + ref.children.reduce((p, c) => p + this._renderChild(c), '') + '</ul>';
        }

        return `\n<li>${content}</li>`;
    }

    renderHtml(referenceTree) {
        return `<div id="jstree"><ul>${this._renderChild(referenceTree)}<ul></div>`;
    }
}

// var decodeHtmlEntity = function (str) {
//     return str.replace(/&#(\d+);/g, function (match, dec) {
//         return String.fromCharCode(dec);
//     });
// };

function encodeHtmlEntity(str) {
    var buf = [];
    for (var i = str.length - 1; i >= 0; i--) {
        buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
    }
    return buf.join('');
};

module.exports = TreeRenderer;