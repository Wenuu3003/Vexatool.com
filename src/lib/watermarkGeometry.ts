export type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
/** Fit the rotated rectangle inside the visible CropBox, then map to PDF coordinates. */
export function watermarkPlacement(box: {x:number;y:number;width:number;height:number}, pageRotation:number, width:number, height:number, angle:number, position:WatermarkPosition) {
  const rotation = ((pageRotation % 360) + 360) % 360;
  const viewWidth = rotation % 180 ? box.height : box.width;
  const viewHeight = rotation % 180 ? box.width : box.height;
  const margin = Math.min(30, Math.min(viewWidth,viewHeight) * .08);
  const radians = angle * Math.PI / 180, c=Math.cos(radians), s=Math.sin(radians);
  const boundW=Math.abs(c)*width+Math.abs(s)*height, boundH=Math.abs(s)*width+Math.abs(c)*height;
  const scale=Math.min(1,(viewWidth-2*margin)/boundW,(viewHeight-2*margin)/boundH);
  width*=scale; height*=scale;
  const xs=[0,c*width,-s*height,c*width-s*height], ys=[0,s*width,c*height,s*width+c*height];
  const minX=Math.min(...xs),minY=Math.min(...ys),w=Math.max(...xs)-minX,h=Math.max(...ys)-minY;
  const left=position.endsWith('left')?margin:position.endsWith('right')?viewWidth-margin-w:(viewWidth-w)/2;
  const bottom=position.startsWith('top')?viewHeight-margin-h:position.startsWith('bottom')?margin:(viewHeight-h)/2;
  const vx=left-minX,vy=bottom-minY;
  let x=vx,y=vy;
  if(rotation===90){x=box.width-vy;y=vx;}
  else if(rotation===180){x=box.width-vx;y=box.height-vy;}
  else if(rotation===270){x=vy;y=box.height-vx;}
  return {x:x+box.x,y:y+box.y,width,height,angle:angle+rotation};
}
