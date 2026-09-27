"use client";

import {useEffect} from "react";

const STAFF_VIDEOS=[
  {alt:"Match Analyst",src:"/assets/staff/Match Analyst.mp4"},
  {alt:"Preparatore atletico",src:"/assets/staff/Preparatore Atletico.mp4"},
];

export default function StaffVideoEnhancer(){
  useEffect(()=>{
    const bind=()=>{
      for(const item of STAFF_VIDEOS){
        const images=Array.from(document.querySelectorAll<HTMLImageElement>(`.staffHubGrid img[alt="${item.alt}"]`));
        for(const img of images){
          if(img.dataset.staffVideoBound==="1")continue;
          img.dataset.staffVideoBound="1";

          const fallback=img.cloneNode(true) as HTMLImageElement;
          fallback.dataset.staffVideoBound="1";

          const video=document.createElement("video");
          video.src=encodeURI(item.src);
          video.poster=img.src;
          video.muted=true;
          video.loop=true;
          video.autoplay=true;
          video.playsInline=true;
          video.preload="metadata";
          video.className="staffHubMedia";
          video.setAttribute("aria-label",item.alt);
          video.setAttribute("disablePictureInPicture","");
          video.controls=false;

          const restoreFallback=()=>{
            if(video.isConnected)video.replaceWith(fallback);
          };
          video.addEventListener("error",restoreFallback,{once:true});
          video.addEventListener("loadeddata",()=>{
            video.play().catch(()=>{});
          },{once:true});

          // Replace the image in-place so the grid always has exactly two children:
          // media + copy. The poster keeps the original portrait visible while loading.
          img.replaceWith(video);
        }
      }
    };

    const t=window.setTimeout(bind,0);
    const observer=new MutationObserver(bind);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>{
      window.clearTimeout(t);
      observer.disconnect();
    };
  },[]);

  return null;
}
