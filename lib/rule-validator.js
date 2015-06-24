/**
 * @fileoverview Handle deprecated or unknown rule errors
 * @author Gyandeep Singh
 * @copyright 2015 Gyandeep Singh
 */

"use strict";

var rules = require("./rules");
var reportData = {};

/**
 * Check if the rule is valid or unknown or deprecated.
 * @param {string} ruleName name of the rule
 * @returns {boolean} Whether to use the rule or not
 * @ublic
 */
function check(ruleName) {
    var rule = rules.get(ruleName);

    if (!rule) {
        reportData[ruleName] = {
            message: "Rule " + ruleName + " is an unknown rule",
            unknown: 1,
            deprecated: 0,
            replacement: ""
        };
        return false;
    } else if (rule && rule.deprecation) {
        reportData[ruleName] = {
            message: rule.deprecation.message || "Rule " + ruleName + " has been deprecated",
            unknown: 0,
            deprecated: 1,
            replacement: rule.deprecation.replacement || ""
        };
    }
    return true;
}

/**
 * Returns the report object which contains all the details
 * @returns {object} report object
 * @public
 */
function report() {
    return reportData;
}

module.exports.check = check;
module.exports.report = report;
