const fs = require('fs');

var fail_log = [];

let Params = {};
function parseArguments()
{
    let args = process.argv.slice(2);

    args = args.map(arg =>
    {
        if (arg.split(" ").length > 1)
        {
            return `\"${arg}\"`;
        }
        return arg;
    });

    let argTypes = [
        { key: { short: "-f", long: "--filters" }, description: "Unit Test filters" },
        { key: { short: "-r", long: "--results" }, description: "Generate JUnit compatible xml" },
    ];

    for (let i = 0; i < args.length; i++)
    {
        let arg = args[i];
        let paramKey = arg.toLowerCase();
        for (let j = 0; j < argTypes.length; j++)
        {
            let argType = argTypes[j];
            if (argType.key.short == paramKey || argType.key.long == paramKey)
            {
                if (argType.singleFlag)
                {
                    Params[argType.key.long.substr(2)] = true;
                    args.splice(i, 1);
                    i -= 1;
                }
                else if (i < args.length - 1)
                {
                    Params[argType.key.long.substr(2)] = args[i + 1];
                    args.splice(i, 2);
                    i -= 1;
                }
                break;
            }
        }
    }

    argTypes.forEach(argType =>
    {
        if (argType.default)
        {
            if (!params.hasOwnProperty(argType.key.long.substr(2)))
            {
                params[argType.key.long.substr(2)] = argType.default;
            }
        }
    });
}
parseArguments();

var filters = Params.filters;
console.log("filters: " + filters);
var results = {};

var module_beforeFn;
var module_afterFn;
var isModuleRunnable;
var module_name;
var test_name;
var test_count = 0;
var test_passed = 0;
var resolve_test;
var sub_testCount = 0;
var sub_testPass = 0;

function resolveTest(...args)
{
    if (resolve_test) resolve_test(...args);
}

function testModule(name, beforeFn, afterFn)
{
    module_name = name;
    module_beforeFn = beforeFn;
    module_afterFn = afterFn;
    isModuleRunnable = filters ? name.match(new RegExp(filters, "i")) : true;
    return isModuleRunnable;
}

async function asyncTest(name, expected, testFn)
{
    if (arguments.length === 2)
    {
        testFn = expected;
        expected = 1;
    }

    test_name = module_name + " : " + name;

    if (!isModuleRunnable)
    {
        // if (filters && !name.match(new RegExp(filters, "i")))
        // {
            return;
        // }
    }

    ++test_count;

    console.log("TEST: \x1b[36m" + test_name + "\x1b[0m");

    if (module_beforeFn)
    {
        try
        {
            await module_beforeFn();
        }
        catch (e)
        {
            console.log(e);
            process.exit(-1);
        }
    }
    if (testFn)
    {
        sub_testPass = 0;

        try
        {
            await function()
            {
                return new Promise(resolve =>
                {
                    resolve_test = resolve;
                    testFn();
                });
            }();
        }
        catch (e)
        {
            console.log(e);
            resolve_test();
        }

        var test_result = {
            name: name,
            fullname: test_name,
            method_name: name,
            classname: module_name,
            runstate: "Runnable"
        };

        if (sub_testPass === expected)
        {
            ++test_passed;
            test_result.result = "Passed"
            console.log("\x1b[36m" + test_name + " \x1b[32m[PASSED]\x1b[0m (" + sub_testPass + " == " + expected + ")");
        }
        else
        {
            var log = "\x1b[36m" + test_name + " \x1b[31m[FAILED]\x1b[0m (" + sub_testPass + " != " + expected + ")";
            console.log(log);
            test_result.result = "Failed"
            test_result.failure_text = "(" + sub_testPass + " != " + expected + ")";
        }

        if (!results[module_name]) results[module_name] = {
            type: "TestFixture",
            name: module_name,
            fullname: module_name,
            classname: module_name,
            runstate: "Runnable",
            tests: []
        }
        results[module_name].tests.push(test_result);
    }
    if (module_afterFn)
    {
        try
        {
            await module_afterFn();
        }
        catch (e)
        {
            console.log(e);
            process.exit(-1);
        }
    }
}

function passed(expr, log)
{
    ++sub_testPass;
    console.log("\x1b[36m" + test_name + " \x1b[32m[OK]\x1b[36m (" + expr + ")\x1b[0m" + log);
}

function failed(expr, logex)
{
    var log = "\x1b[36m" + test_name + " \x1b[31m[failed]\x1b[36m (" + expr + ")\x1b[0m" + logex;
    var finallog = "\x1b[36m" + test_name + "\x1b[0m";
    fail_log.push("\x1b[31m[  FAILED  ]\x1b[36m " + finallog);
    console.log(log);
}

function ok(result, log)
{
    if (result) passed(result, log);
    else failed(result, log);
}

function equal(actual, expected, log)
{
    if (actual === expected) passed(actual + " == " + expected, log);
    else failed(actual + " != " + expected, log);
}

function nequal(actual, expected, log)
{
    if (actual != expected) passed(actual + " != " + expected, log);
    else failed(actual + " == " + expected, log);
}

function greaterEq(actual, expected, log)
{
    if (actual >= expected) passed(actual + " >= " + expected, log);
    else failed(actual + " < " + expected, log);
}

function outputXML(time_start, time_end)
{
    let output = ""

    output += '<?xml version="1.0" encoding="utf-8"?>\n'

    let test_suites = []
    let test_count = 0
    let failed_count = 0
    let id = 2;

    for (const [key, value] of Object.entries(results))
    {
        test_suites.push(value)
        value.fail_count = 0;
        test_count += value.tests.length;
        value.tests.forEach(test =>
        {
            if (test.result == "Failed")
            {
                failed_count++;
                value.fail_count++;
            }
        });
    }

    output += `<testsuites tests="${test_count}" failures="${failed_count}" disabled="0" errors="0" time="${(time_end.getTime() - time_start.getTime()) / 1000}" name="AllTests">\n`

    test_suites.forEach(test_suite =>
    {
        output += `  <testsuite name="${test_suite.name}" tests="${test_suite.tests.length}" failures="${test_suite.fail_count}" disabled="0" errors="0">\n`

        test_suite.tests.forEach(test_case =>
        {
            output += `    <testcase name="${test_case.name}" status="run" classname="${test_case.classname}"`
            if (test_case.result == "Failed")
            {
                output += `>\n      <failure>\n        <message><![CDATA[${test_case.failure_text}]]></message>\n      </failure>\n    </testcase>\n`
            }
            else
            {
                output += ` />\n`
            }
        });

        output += `  </testsuite>\n`
    });
    output += `</testsuites>\n`

    fs.writeFileSync(`./${Params.results}`, output);
    console.log(`${Params.results} saved`);
}

module.exports = {
    Params,
    fail_log,
    testModule,
    asyncTest,
    resolveTest,
    passed,
    failed,
    ok,
    equal,
    nequal,
    greaterEq,
    outputXML,
    test_count: () => test_count,
    test_passed: () => test_passed
}
