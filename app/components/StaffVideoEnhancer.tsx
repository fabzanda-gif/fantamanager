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
          const video=document.createElement("video");
          video.src=encodeURI(item.src);
          video.poster=img.src;
          video.muted=true;
          video.loop=true;
          video.autoplay=true;
          video.playsInline=true;
          video.preload="metadata";
          video.setAttribute("aria-label",item.alt);
          video.style.display="block";
          video.style.width="100%";
          video.style.height="150px";
          video.style.objectFit="cover";
          video.style.objectPosition="center 24%";
          video.style.filter="saturate(.78) contrast(1.04)";
          video.style.background="#07100d";
          img.parentElement?.insertBefore(video,img);
          const reveal=()=>{img.style.display="none";video.play().catch(()=>{})};
          video.addEventListener("loadeddata",reveal,{once:true});
          video.addEventListener("error",()=>{video.remove();img.style.display="block"},{once:true});
        }
      }
    };
    const t=window.setTimeout(bind,0),observer=new MutationObserver(bind);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>{window.clearTimeout(t);observer.disconnect()};
  },[]);
  return null;
}
