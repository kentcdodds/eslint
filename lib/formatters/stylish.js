/**
 * @fileoverview Stylish reporter
 * @author Sindre Sorhus
 */
"use strict";

var chalk = require("chalk"),
    table = require("text-table");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word, count) {
    return (count === 1 ? word : word + "s");
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function(results, ruleIssues) {

    var output = "\n",
        total = 0,
        errors = 0,
        warnings = 0,
        summaryColor = "yellow";

    if (!ruleIssues) {
        ruleIssues = {};
    }

    results.forEach(function(result) {
        var messages = result.messages;

        if (messages.length === 0) {
            return;
        }

        total += messages.length;
        output += chalk.underline(result.filePath) + "\n";

        output += table(
            messages.map(function(message) {
                var messageType;

                if (message.fatal || message.severity === 2) {
                    messageType = chalk.red("error");
                    summaryColor = "red";
                    errors++;
                } else {
                    messageType = chalk.yellow("warning");
                    warnings++;
                }

                return [
                    "",
                    message.line || 0,
                    message.column || 0,
                    messageType,
                    message.message.replace(/\.$/, ""),
                    chalk.gray(message.ruleId || "")
                ];
            }),
            {
                align: ["", "r", "l"],
                stringLength: function(str) {
                    return chalk.stripColor(str).length;
                }
            }
        ).split("\n").map(function(el) {
            return el.replace(/(\d+)\s+(\d+)/, function(m, p1, p2) {
                return chalk.gray(p1 + ":" + p2);
            });
        }).join("\n") + "\n\n";
    });

    if (total > 0) {
        output += chalk[summaryColor].bold([
            "\u2716 ", total, pluralize(" problem", total),
            " (", errors, pluralize(" error", errors), ", ",
            warnings, pluralize(" warning", warnings), ")\n"
        ].join(""));
    }

    if (Object.keys(ruleIssues).length) {
        output += "\n\n" + chalk.underline("Rule issues:") + "\n\n";
        output += table(
            Object.keys(ruleIssues).map(function(key) {
                var issue = ruleIssues[key];

                return [
                    "",
                    (issue.unknown) ? chalk.red(key) : chalk.yellow(key),
                    issue.message,
                    chalk.gray((issue.unknown) ? "Unknown" : "Deprecated"),
                    issue.replacement
                ];
            }),
            {
                align: ["", "l", "l", "l", "l"],
                stringLength: function(str) {
                    return chalk.stripColor(str).length;
                }
            }
        );
    }

    return total > 0 && Object.keys(ruleIssues).length ? output : "";
};
