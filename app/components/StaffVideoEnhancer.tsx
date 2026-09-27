"use client";

import {useEffect} from "react";

const STAFF_VIDEOS=[
  {alt:"Match Analyst",src:"/assets/staff/Match Analyst.mp4"},
  {alt:"Preparatore atletico",src:"/assets/staff/Preparatore Atletico.mp4"},
];

export default function StaffVideoEnhancer(){
  useEffect(()=>{
    if(location.pathname!=="/stagione")return;

    const sizeVideo=(video:HTMLVideoElement)=>{
      const narrow=matchMedia("(max-width:420px)").matches;
      const mobile=matchMedia("(max-width:800px)").matches;
      Object.assign(video.style,{
        display:"block",
        objectFit:"cover",
        objectPosition:"center 20%",
        filter:"saturate(.78) contrast(1.04)",
        background:"#07100d",
        maxWidth:"100%",
        minWidth:"0",
        width:narrow?"78px":mobile?"88px":"100%",
        height:narrow?"104px":mobile?"112px":"150px",
        minHeight:narrow?"104px":mobile?"112px":"150px",
      });
    };

    const bind=()=>{
      for(const item of STAFF_VIDEOS){
        const img=document.querySelector<HTMLImageElement>(`.staffHubGrid img[alt="${item.alt}"]`);
        if(!img||img.dataset.staffVideoBound==="1")continue;

        const fallback=img.cloneNode(true) as HTMLImageElement;
        fallback.dataset.staffVideoBound="1";

        const video=document.createElement("video");
        video.src=item.src;
        video.poster=img.src;
        video.muted=true;
        video.defaultMuted=true;
        video.loop=true;
        video.autoplay=true;
        video.playsInline=true;
        video.preload="auto";
        video.className="staffHubMedia";
        video.setAttribute("aria-label",item.alt);
        video.setAttribute("disablePictureInPicture","");
        video.controls=false;
        sizeVideo(video);

        video.addEventListener("error",()=>{
          if(video.isConnected)video.replaceWith(fallback);
        },{once:true});
        video.addEventListener("canplay",()=>{
          sizeVideo(video);
          void video.play().catch(()=>{});
        },{once:true});

        img.dataset.staffVideoBound="1";
        img.replaceWith(video);
      }
    };

    const resize=()=>document.querySelectorAll<HTMLVideoElement>(".staffHubGrid video.staffHubMedia").forEach(sizeVideo);
    bind();
    const observer=new MutationObserver(bind);
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("resize",resize);

    return()=>{
      observer.disconnect();
      window.removeEventListener("resize",resize);
    };
  },[]);

  return null;
}
