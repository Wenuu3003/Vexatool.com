import {describe,it,expect} from 'vitest';
import {watermarkPlacement} from './watermarkGeometry';
describe('watermark placement in visible CropBox',()=>{
 for(const rotation of [0,90,180,270])for(const angle of [-90,-45,0,45,90]){
  it(`keeps large rotated watermark visible: page ${rotation}, mark ${angle}`,()=>{
   const box={x:20,y:40,width:240,height:400};
   for(const position of ['center','top-left','top-right','bottom-left','bottom-right'] as const){
    const p=watermarkPlacement(box,rotation,1600,900,angle,position),r=p.angle*Math.PI/180;
    const corners=[[0,0],[p.width,0],[0,p.height],[p.width,p.height]].map(([x,y])=>({x:p.x+x*Math.cos(r)-y*Math.sin(r),y:p.y+x*Math.sin(r)+y*Math.cos(r)}));
    for(const c of corners){expect(c.x).toBeGreaterThanOrEqual(box.x-1e-7);expect(c.x).toBeLessThanOrEqual(box.x+box.width+1e-7);expect(c.y).toBeGreaterThanOrEqual(box.y-1e-7);expect(c.y).toBeLessThanOrEqual(box.y+box.height+1e-7);}
    if(position==='center'){expect(corners.reduce((s,c)=>s+c.x,0)/4).toBeCloseTo(box.x+box.width/2);expect(corners.reduce((s,c)=>s+c.y,0)/4).toBeCloseTo(box.y+box.height/2);}
   }
  });
 }
});
