const walkSync = require('walk-sync');
const path = require('path');
const ComponentInfo = require('./component-info');
const TreeRenderer = require('./tree-renderer');
const fs = require('fs');

const projectPath = '../ng-architect';
const basePath = path.join(projectPath, 'src/app');

const componentsPath = walkSync(basePath, { globs: ['**/*.component.ts'] });

const componentsInfo = componentsPath.map(componentPath => new ComponentInfo(path.join(basePath, componentPath)).getAll());

console.log(componentsInfo.map(a => a.selector + '=>' + JSON.stringify(a.dependencies)));

dependenciesTree = {
    label: 'Componentes',
    children: []
};

function resolveItemAndDependencies(resItem) {
    const component = {
        label: (resItem.inputs && resItem.inputs.length ? `[${resItem.inputs.map(i => i.inputName + '=' + i.inputType).join(', ')}]=>` : '')
         + resItem.selector 
         +  (resItem.outputs && resItem.outputs.length ? `=> (${resItem.outputs.map(i => i.inputName + '=' + i.inputType).join(', ')})` : ''),
        ref: resItem,
        children: []
    };

    // console.log(resItem.selector);
    const dependencies = resItem.dependencies;

    if (dependencies && dependencies.length) {

        // console.log(dependencies);

        dependencies.forEach((dp) => {
            const ref = componentsInfo.find(c => c.selector === dp);

            // console.log(resItem.selector, ref.selector);

            if (ref) {
                component.children.push(resolveItemAndDependencies(ref));
            } else {
                component.children.push({ label: dp });
            }
        });
    }

    return component;
}

// const rootComponents = componentsInfo.filter(item => item.dependencies && item.dependencies.length);


for (let compIndex = 0; compIndex < componentsInfo.length; compIndex++) {
    dependenciesTree.children.push(resolveItemAndDependencies(componentsInfo[compIndex]));
};


const generatedHtml = new TreeRenderer().renderHtml(dependenciesTree);

const htmlTemplate = fs.readFileSync(path.resolve(__dirname, 'bundles/index.html'), 'utf8');

const resultHtml = htmlTemplate.replace('!!!Generate the div here!!!', generatedHtml);

deleteFolderRecursive(path.resolve(__dirname, 'dist'));
fs.mkdirSync(path.resolve(__dirname, 'dist'));

copyRecursiveSync(path.resolve(__dirname, 'bundles/themes'), path.resolve(__dirname, 'dist/themes'))

copyFileSync(path.resolve(__dirname, 'bundles/jquery.min.js'), path.resolve(__dirname, 'dist/jquery.min.js'));
copyFileSync(path.resolve(__dirname, 'bundles/jstree.min.js'), path.resolve(__dirname, 'dist/jstree.min.js'));

fs.writeFile(path.resolve(__dirname, 'dist/index.html'), resultHtml);

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function copyFileSync(source, target) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyRecursiveSync(src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (exists && isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function (childItemName) {
            copyRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        fs.linkSync(src, dest);
    }
};
// console.log(JSON.stringify(dependenciesTree));