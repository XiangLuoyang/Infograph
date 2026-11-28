import test from 'node:test';
import assert from 'node:assert/strict';
import {embeddedDesign,embedVerifiedScene} from './execution-integration.mjs';
const direction={"id":"editorial","palette":{"canvas":"#f4f1ea","surface":"#fffdf8","text":"#1f2421","muted":"#5c645f","accent":"#2f5d50","warning":"#a34525","controlBorder":"#72695a","line":"#d9d3c6"},"typography":{"body":"sans","heading":"serif","bodyPx":14,"notePx":12,"headingPx":22,"lineHeight":1.5},"geometry":{"spacing":16,"radius":4}};
const fixture="<!doctype html><html><head><style>body{color:black}</style></head><body><svg></svg></body></html>";
test('verified host design becomes locked embedded CSS',()=>{const {html,design}=embedVerifiedScene(fixture,direction);assert.equal(design.id,'editorial');assert.match(html,/data-ig-inherited="editorial"/);assert.match(html,/--background:#f4f1ea/);assert.match(html,/--line:#72695a/);assert.match(html,/font:14px\/1.5/);assert.ok(html.includes('<svg></svg>'));assert.equal(design.radius,4);assert.equal(design.headingPx,22)});
test('without ART preserve preview exactly',()=>assert.deepEqual(embedVerifiedScene(fixture,null),{html:fixture,design:null}));
test('fail closed on contrast and unsupported tokens',()=>{for(const bad of [{...direction,palette:{...direction.palette,text:'#ffffff'}},{...direction,typography:{...direction.typography,body:'x;bad'}},{...direction,geometry:{...direction.geometry,spacing:200}},{...direction,palette:{...direction.palette,accent:'red'}}])assert.throws(()=>embeddedDesign(bad));assert.throws(()=>embedVerifiedScene('<html></html>',direction))});
