const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const directory = process.argv[2] || path.resolve(__dirname, '..');
const names = ['hanglvzongheng.js', 'caixinads.js', '555Ad.js', 'baishitv.js', 'ithome.js'];
const scripts = Object.fromEntries(names.map(name => [name, new vm.Script(fs.readFileSync(path.join(directory, name), 'utf8'))]));
let count = 0;
function run(name, globals = {}) {
    const calls = [];
    scripts[name].runInNewContext({...globals, $done(value) { calls.push(JSON.parse(JSON.stringify(value))); }}, {timeout: 1000});
    assert.equal(calls.length, 1, name + ': must finish exactly once');
    count++;
    return calls[0];
}
function response(name, value) { return run(name, {$response: {body: JSON.stringify(value)}}); }
function body(result) { assert.equal(typeof result.body, 'string'); return JSON.parse(result.body); }
for (const name of names) {
    assert.deepEqual(run(name), {});
    assert.deepEqual(run(name, {$response: null, $request: null}), {});
    let calls = 0;
    assert.throws(() => scripts[name].runInNewContext({$done() { calls++; throw new Error('done failure'); }}, {timeout: 1000}), /done failure/);
    assert.equal(calls, 1, 'must not retry a throwing $done'); count++;
}
for (const name of names.filter(n => n !== 'hanglvzongheng.js')) {
    for (const invalid of ['', ' ', '<html>upstream failed</html>', '{', null, 7, {}, 'null', 'true', '42', '"text"']) {
        assert.deepEqual(run(name, {$response: {body: invalid}}), {}, name + ': invalid body preserved');
    }
    const bad = {}; Object.defineProperty(bad, 'body', {get() { throw new Error('body unavailable'); }});
    assert.deepEqual(run(name, {$response: bad}), {});
}
for (const headers of [{}, null, 'text', [], {rpid: 10000012}, {rpid: {}}, {rpid: ['1000019']}, {rpid:'normal'}]) {
    assert.deepEqual(run('hanglvzongheng.js', {$request:{headers}}), {});
}
for (const headers of [{rpid:'10000012'}, {Rpid:'prefix-1000019-tail'}, {RPID:'10000012'}, {rpid:9,Rpid:'1000019'}]) {
    assert.deepEqual(run('hanglvzongheng.js', {$request:{headers}}), {status:'HTTP/1.1 404 Not Found'});
}
assert.deepEqual(body(response('caixinads.js', {sday:'old',eday:'old',intval:123,keep:'unchanged',nested:[{intval:456},{intval:-12.5},{intval:1e6}]})), {sday:'2029-12-01 00:00:00',eday:'2029-12-30 00:00:00',intval:0,keep:'unchanged',nested:[{intval:0},{intval:0},{intval:0}]});
assert.deepEqual(response('caixinads.js',{intval:'123',sday:42,eday:null,note:'intval":123',myintval:123}),{});
assert.deepEqual(response('caixinads.js',{intval:0,sday:'2029-12-01 00:00:00',eday:'2029-12-30 00:00:00'}),{});
assert.deepEqual(body(response('caixinads.js',[{intval:789}])),[{intval:0}]);
const mixed = {data:[{layout:'advert_self',list:[]},null,3,{layout:'content',list:[null,{type:3},{type:'3'},{type:1},{}]},{layout:'content',list:null},{layout:'unknown'}],other:7};
assert.deepEqual(body(response('555Ad.js',mixed)),{data:[null,3,{layout:'content',list:[null,{type:'3'},{type:1},{}]},{layout:'content',list:null},{layout:'unknown'}],other:7});
for(const value of [{}, {data:null},{data:{}},{data:'text'},{data:[null,{}, {list:'text'}]},[]])assert.deepEqual(response('555Ad.js',value),{});
for(const data of [[{jumpTypeString:'开屏广告'},{jumpTypeString:'内容'},null,{},7,{jumpTypeString:123}],{a:{jumpTypeString:'广告'},b:{jumpTypeString:'内容'},c:null,d:{},e:7,f:{jumpTypeString:123}}]) {
    assert.deepEqual(body(response('baishitv.js',{dt:{data},other:true})),{dt:{data:[{jumpTypeString:'内容'},null,{},7,{jumpTypeString:123}]},other:true});
}
for(const value of [{},{dt:null},{dt:{data:null}},{dt:{data:'text'}},{dt:{data:[null,{}]}},{dt:{data:{a:{jumpTypeString:'内容'}}}}])assert.deepEqual(response('baishitv.js',value),{});
for(const list of [[{feedContent:{flag:2}},{feedContent:{flag:'2'}},{feedContent:{flag:1}},null,{},3,{feedContent:null}],{a:{feedContent:{flag:2}},b:{feedContent:{flag:'2'}},c:{feedContent:{flag:1}},d:null,e:{},f:3,g:{feedContent:null}}]) {
    assert.deepEqual(body(response('ithome.js',{data:{list},other:7})),{data:{list:[{feedContent:{flag:1}},null,{},3,{feedContent:null}]},other:7});
}
for(const value of [{},{data:null},{data:{list:null}},{data:{list:'text'}},{data:{list:[null,{}]}},{data:{list:{a:{feedContent:{flag:1}}}}}])assert.deepEqual(response('ithome.js',value),{});
console.log('PASS: '+count+' isolated executions; normal responses, malformed input, missing fields, unknown records, full numeric values, and exactly-once completion.');
