"use client";

import {useEffect} from "react";

const STAFF_VIDEOS=[
  {alt:"Match Analyst",src:"https://raw.githubusercontent.com/fabzanda-gif/fantamanager/mvp-calendar-flow/app/assets/staff/Match%20Analyst.mp4"},
  {alt:"Preparatore atletico",src:"https://raw.githubusercontent.com/fabzanda-gif/fantamanager/mvp-calendar-flow/app/assets/staff/Preparatore%20Atletico.mp4"},
];

function sizeVideo(video:HTMLVideoElement){
  const narrow=window.matchMedia("(max-width:420px)").matches;
  const mobile=window.matchMedia("(max-width:800px)").matches;
  video.style.display="block";
  video.style.objectFit="cover";
  video.style.objectPosition="center 20%";
  video.style.filter="saturate(.78) contrast(1.04)";
  video.style.background="#07100d";
  video.style.maxWidth="100%";
  video.style.minWidth="0";
  if(narrow){
    video.style.width="78px";
    video.style.height="104px";
    video.style.minHeight="104px";
  }else if(mobile){
    video.style.width="88px";
    video.style.height="112px";
    video.style.minHeight="112px";
  }else{
    video.style.width="100%";
    video.style.height="150px";
    video.style.minHeight="150px";
  }
}

export default function StaffVideoEnhancer(){
  useEffect(()=>{
    if(location.pathname!=="/stagione")return;

    const bind=()=>{
      for(const item of STAFF_VIDEOS){
        const images=Array.from(document.querySelectorAll<HTMLImageElement>(`.staffHubGrid img[alt="${item.alt}"]`));
        for(const img of images){
          if(img.dataset.staffVideoBound==="1")continue;
          img.dataset.staffVideoBound="1";

          const fallback=img.cloneNode(true) as HTMLImageElement;
          fallback.dataset.staffVideoBound="1";

          const video=document.createElement("video");
          video.src=item.src;
          video.poster=img.src;
          video.muted=true;
          video.loop=true;
          video.autoplay=true;
          video.playsInline=true;
          video.preload="auto";
          video.className="staffHubMedia";
          video.setAttribute("aria-label",item.alt);
          video.setAttribute("disablePictureInPicture","");
          video.controls=false;
          sizeVideo(video);

          const restoreFallback=()=>{
            if(video.isConnected)video.replaceWith(fallback);
          };
          video.addEventListener("error",restoreFallback,{once:true});
          video.addEventListener("canplay",()=>{
            sizeVideo(video);
            video.play().catch(()=>{});
          },{once:true});

          img.replaceWith(video);
        }
      }
    };

    const resize=()=>document.querySelectorAll<HTMLVideoElement>(".staffHubGrid video.staffHubMedia").forEach(sizeVideo);
    const t=window.setTimeout(bind,0);
    const observer=new MutationObserver(bind);
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("resize",resize);
    return()=>{
      window.clearTimeout(t);
      observer.disconnect();
      window.removeEventListener("resize",resize);
    };
  },[]);

  return null;
}
