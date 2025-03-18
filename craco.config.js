const MillionLint = require("@million/lint");

module.exports = {
    plugins: [
        MillionLint.craco({
            legacyHmr: true,
        }),
    ],
};
