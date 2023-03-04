"use strict";
exports.__esModule = true;
exports.summarizeProject = void 0;
//@ts-nocheck
var ts = require("typescript");
// import * as fs from 'fs';
var glob_1 = require("glob");
function summarizeProject(projectPath) {
    var components = [];
    var services = [];
    // Find all TypeScript files in the project
    var fileNames = [];
    (0, glob_1.glob)("".concat(projectPath, "/**/*.ts"), { ignore: "".concat(projectPath, "/node_modules/**") }).then(function (files) {
        fileNames = files;
    });
    console.log(fileNames);
    var _loop_1 = function (fileName) {
        var filePath = "".concat(projectPath, "/").concat(fileName);
        var sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath).toString(), ts.ScriptTarget.ES2015, true);
        // Extract component metadata
        ts.forEachChild(sourceFile, function (node) {
            var _a, _b, _c, _d;
            if (ts.isClassDeclaration(node) && node.decorators) {
                var decorator = node.decorators.find(function (d) { return d.expression.getText() === 'Component'; });
                if (decorator) {
                    var metadata = ts.createCompilerHost({}).getMetadataForDecorators([decorator], sourceFile).pop();
                    components.push({
                        name: node.name.getText(),
                        selector: ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.selector) === null || _a === void 0 ? void 0 : _a.text) || '',
                        templateUrl: ((_b = metadata === null || metadata === void 0 ? void 0 : metadata.template) === null || _b === void 0 ? void 0 : _b.fileName) || '',
                        styleUrls: ((_c = metadata === null || metadata === void 0 ? void 0 : metadata.styleUrls) === null || _c === void 0 ? void 0 : _c.map(function (url) { return url.text; })) || [],
                        providers: ((_d = metadata === null || metadata === void 0 ? void 0 : metadata.providers) === null || _d === void 0 ? void 0 : _d.map(function (provider) { return provider.expression.getText(); })) || []
                    });
                }
            }
        });
        // Extract service metadata
        ts.forEachChild(sourceFile, function (node) {
            var _a;
            if (ts.isClassDeclaration(node) && node.decorators) {
                var decorator = node.decorators.find(function (d) { return d.expression.getText() === 'Injectable'; });
                if (decorator) {
                    var metadata = ts.createCompilerHost({}).getMetadataForDecorators([decorator], sourceFile).pop();
                    services.push({
                        name: node.name.getText(),
                        providedIn: ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.providedIn) === null || _a === void 0 ? void 0 : _a.getText()) || 'root'
                    });
                }
            }
        });
    };
    // Loop through each file and extract relevant information
    for (var _i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
        var fileName = fileNames_1[_i];
        _loop_1(fileName);
    }
    return { components: components, services: services };
}
exports.summarizeProject = summarizeProject;
var output = summarizeProject("ng-analysis");
console.log("Components");
output.components.forEach(function (component) {
    console.log(component.name);
});
console.log("Services");
output.services.forEach(function (service) {
    console.log(service.name);
});
