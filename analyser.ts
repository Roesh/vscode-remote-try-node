//@ts-nocheck
import * as ts from 'typescript';
// import * as fs from 'fs';
import { glob } from 'glob'

interface Component {
    name: string;
    selector: string;
    templateUrl: string;
    styleUrls: string[];
    providers: string[];
}

interface Service {
    name: string;
    providedIn: string;
}

export function summarizeProject(projectPath: string): { components: Component[], services: Service[] } {
    const components: Component[] = [];
    const services: Service[] = [];

    // Find all TypeScript files in the project
    let fileNames:string[] = []
    glob(`${projectPath}/**/*.ts`, { ignore: `${projectPath}/node_modules/**` }).then((files) => {
        fileNames = files
    })
    console.log(fileNames)

    // Loop through each file and extract relevant information
    for (const fileName of fileNames) {
        const filePath = `${projectPath}/${fileName}`;
        const sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath).toString(), ts.ScriptTarget.ES2015, true);

        // Extract component metadata
        ts.forEachChild(sourceFile, node => {
            if (ts.isClassDeclaration(node) && node.decorators) {
                const decorator = node.decorators.find(d => d.expression.getText() === 'Component');
                if (decorator) {
                    const metadata = ts.createCompilerHost({}).getMetadataForDecorators([decorator], sourceFile).pop();
                    components.push({
                        name: node.name.getText(),
                        selector: metadata?.selector?.text || '',
                        templateUrl: metadata?.template?.fileName || '',
                        styleUrls: metadata?.styleUrls?.map(url => url.text) || [],
                        providers: metadata?.providers?.map(provider => provider.expression.getText()) || [],
                    });
                }
            }
        });

        // Extract service metadata
        ts.forEachChild(sourceFile, node => {
            if (ts.isClassDeclaration(node) && node.decorators) {
                const decorator = node.decorators.find(d => d.expression.getText() === 'Injectable');
                if (decorator) {
                    const metadata = ts.createCompilerHost({}).getMetadataForDecorators([decorator], sourceFile).pop();
                    services.push({
                        name: node.name.getText(),
                        providedIn: metadata?.providedIn?.getText() || 'root',
                    });
                }
            }
        });
    }

    return { components, services };
}

const output = summarizeProject("ng-analysis")
console.log("Components")
output.components.forEach((component) => {
    console.log(component.name)
})
console.log("Services")
output.services.forEach((service) => {
    console.log(service.name)
})