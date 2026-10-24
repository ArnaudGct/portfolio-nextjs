import test from 'node:test';
import assert from 'node:assert/strict';
import {progressAt, syncProgress} from '../lib/spotify/progress.mjs';
const sample = (progress) => ({progress, duration:240000, isPlaying:true});
test('avance avec le temps réel même après une suspension des timers',()=>{
 const clock=syncProgress(null,sample(60000),0);
 assert.equal(progressAt(clock,12000),72000);
 assert.equal(progressAt(clock,999999),240000);
});
test('une petite dérive arrière ne fait jamais reculer la lecture',()=>{
 let clock=syncProgress(null,sample(60000),0);
 clock=syncProgress(clock,sample(64000),5000);
 let last=65000;
 for(let t=5000;t<10000;t+=50){const current=progressAt(clock,t);assert.ok(current>=last);last=current;}
 assert.equal(progressAt(clock,10000),69000);
});
test('un déplacement avant ou arrière est interpolé puis rejoint la lecture',()=>{
 for(const target of [175000,10000]){
  const old=syncProgress(null,sample(60000),0);
  const clock=syncProgress(old,sample(target),5000);
  assert.equal(progressAt(clock,5000),65000);
  assert.ok(progressAt(clock,5350)>Math.min(65000,target));
  assert.ok(progressAt(clock,5350)<Math.max(65000,target)+700);
  assert.equal(progressAt(clock,5700),target+700);
 }
});
test('un nouveau morceau démarre à sa propre position',()=>{
 assert.equal(progressAt(syncProgress(null,sample(500),5000),5000),500);
});
