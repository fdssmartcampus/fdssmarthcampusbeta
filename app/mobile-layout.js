(() => {
 'use strict';
 // Some Android browsers keep a wide desktop viewport. Scale rem-based app
 // controls to the real phone width without blocking user zoom.
 function scaleFor(width, screenWidth, touches) {
  if(!touches||!Number.isFinite(screenWidth)||screenWidth<240||screenWidth>600||width<screenWidth*1.35)return 1;
  return Math.min(3.5,width/screenWidth);
 }
 function sync(){const realWidth=Math.min(screen.width||innerWidth,screen.availWidth||screen.width||innerWidth);const scale=scaleFor(innerWidth,realWidth,navigator.maxTouchPoints||0);document.documentElement.style.fontSize=(100*scale)+'%';document.documentElement.dataset.phoneScale=scale.toFixed(2);}
 window.CampusMobileLayout={scaleFor};sync();addEventListener('resize',sync,{passive:true});addEventListener('pageshow',sync);
})();
