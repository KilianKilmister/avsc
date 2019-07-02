/* jshint node: true */

'use strict';

var idl = require('@avro/idl');
var types = require('@avro/types');
var streams = require('@avro/streams');
var fs = require('fs');
var path = require('path');

function parse(s, opts) {
  var schema;
  if (typeof s == 'string' && ~s.indexOf(path.sep) && fs.existsSync(s)) {
    // Try interpreting `s` as path to a file contain a JSON schema or an IDL
    // protocol. Note that we add the second check to skip primitive references
    // (e.g. `"int"`, the most common use-case for `avro.parse`).
    var contents = fs.readFileSync(s, {encoding: 'utf8'});
    try {
      schema = JSON.parse(contents);
    } catch (err) {
      schema = idl.assembleProtocolSync(s, opts);
    }
  } else {
    schema = s;
  }
  if (typeof schema == 'string' && schema !== 'null') {
    // This last predicate is to allow `read('null')` to work similarly to
    // `read('int')` and other primitives (null needs to be handled separately
    // since it is also a valid JSON identifier).
    try {
      schema = JSON.parse(schema);
    } catch (err) {}
  }
  return types.Type.forSchema(schema);
}

module.exports = Object.assign(
  {
    parse: parse,
    Type: types.Type,
    types: types,
    createFileDecoder: streams.createFileDecoder,
    createFileEncoder: streams.createFileEncoder,
    extractFileHeader: streams.extractFileHeader,
    streams: streams
  },
  require('@avro/services'),
  idl
);
