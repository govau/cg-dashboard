import "./test/global_setup";

const context = require.context("./test/unit", true, /.+\.spec\.js$/);
context.keys().forEach(context);
module.exports = context;
