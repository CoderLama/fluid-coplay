
module.exports = {
    endOfLine: "lf",
    jsxBracketSameLine: true,
    printWidth: 100,
    singleQuote: false,
    tabWidth: 4,
    trailingComma: "es5",
    overrides: [
        {
            files: ["*.css", "*.scss"],
            options: {
                printWidth: 80,
            },
        },
    ],
};
