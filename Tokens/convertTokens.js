const fs = require('fs');

const data = JSON.parse(fs.readFileSync('design-tokens.tokens.json', 'utf8'));

function resolveAlias(val, root) {
    if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
        let pathStr = val.slice(1, -1);
        let parts = pathStr.split('.');

        let current = root;
        for (let part of parts) {
            if (current && current.hasOwnProperty(part)) {
                current = current[part];
            } else {
                return val;
            }
        }

        if (current && current.value !== undefined) {
            return resolveAlias(current.value, root);
        }
        return val;
    }
    return val;
}

let cssVariables = [];

function processTokens(obj, path, prefix) {
    if (obj && obj.value !== undefined) {
        if (typeof obj.value === 'object') return;

        // Use split(' ').join('-') to safely replace spaces without worrying about regex backslash issues in artifacts
        const formatSegment = (s) => s.split(' ').join('-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

        let formattedPath = path.map(formatSegment).join('-');
        // Simplify "color-color-roles" to "color-roles"
        if (prefix === 'color' && formattedPath.startsWith('color-roles-')) {
            formattedPath = formattedPath.substring('color-roles-'.length);
        }

        let variableName = `--sys-${prefix}-${formattedPath}`;
        let value = resolveAlias(obj.value, data);

        if (obj.type === 'dimension' && typeof value === 'number') {
            value = value + 'px';
        }
        else if (obj.type === 'dimension' && typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
            value = value + 'px';
        }
        else if (obj.type === 'fontFamilies' || (typeof value === 'string' && obj.type === 'string' && path[path.length - 1] === 'fontFamily')) {
            if (value.includes(' ') && !value.includes('"') && !value.includes("'")) {
                value = '"' + value + '"';
            }
        }

        cssVariables.push(`  ${variableName}: ${value};`);
    } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
            if (key === 'extensions' || key === 'description' || key === 'type') continue;
            processTokens(value, [...path, key], prefix);
        }
    }
}

if (data['color roles']) {
    processTokens(data['color roles'], [], 'color');
}
if (data['typography']) {
    processTokens(data['typography'], [], 'typography');
}

const cssOutput = "/* System Design Tokens */\n:root {\n" + cssVariables.join("\n") + "\n}\n";

fs.writeFileSync('tokens.css', cssOutput, 'utf8');
console.log('Successfully generated tokens.css with system variables!');
