"use client";

import { useEffect } from "react";

type Pair = [string, string];

const TEAM_COLORS: Record<string, Pair> = {
  ATA: ["#111827", "#2563eb"],
  BOL: ["#b91c1c", "#1e3a8a"],
  CAG: ["#c81e2b", "#173f7a"],
  COM: ["#1f5fa8", "#f4f4f4"],
  FIO: ["#5b2a86", "#f4f4f4"],
  FRO: ["#f1c40f", "#1f5fa8"],
  GEN: ["#b91c1c", "#1e3a8a"],
  INT: ["#0057b8", "#111827"],
  JUV: ["#f4f4f4", "#111111"],
  LAZ: ["#80c8ef", "#173f7a"],
  LEC: ["#f5c400", "#d91f26"],
  MIL: ["#d71920", "#111111"],
  MON: ["#d71920", "#f4f4f4"],
  NAP: ["#39a9dc", "#172554"],
  PAR: ["#f1c40f", "#1f5fa8"],
  ROM: ["#8e1b2d", "#f0a500"],
  SAS: ["#16a34a", "#111111"],
  TOR: ["#7b1e2b", "#f4f4f4"],
  UDI: ["#f4f4f4", "#111111"],
  VEN: ["#f36f21", "#138447"],
};

const TEAM_NAMES: Record<string, string> = {
  ATALANTA: "ATA", BOLOGNA: "BOL", CAGLIARI: "CAG", COMO: "COM", FIORENTINA: "FIO",
  FROSINONE: "FRO", GENOA: "GEN", INTER: "INT", JUVENTUS: "JUV", LAZIO: "LAZ",
  LECCE: "LEC", MILAN: "MIL", MONZA: "MON", NAPOLI: "NAP", PARMA: "PAR", ROMA: "ROM",
  SASSUOLO: "SAS", TORINO: "TOR", UDINESE: "UDI", VENEZIA: "VEN",
};

function rgb(hex: string) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}

function distance(a: string, b: string) {
  const aa = rgb(a), bb = rgb(b);
  return Math.sqrt(aa.reduce((sum, v, i) => sum + Math.pow(v - bb[i], 2), 0));
}

function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map(v => {
    const x = v / 255;
    return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4);
  });
  return .2126 * r + .7152 * g + .0722 * b;
}

function contrast(a: string, b: string) {
  const aa = luminance(a), bb = luminance(b);
  return (Math.max(aa, bb) + .05) / (Math.min(aa, bb) + .05);
}

function chooseKits(homeCode: string, awayCode: string): Pair {
  const home = TEAM_COLORS[homeCode] || ["#24e39a", "#f4f4f4"];
  const away = TEAM_COLORS[awayCode] || ["#dce9e4", "#111827"];
  if (distance(home[0], away[0]) > 115 && contrast(home[0], away[0]) > 1.8) return [home[0], away[0]];

  const candidates: Array<[string, string, number]> = [];
  home.forEach((h, hi) => away.forEach((a, ai) => {
    const primaryBonus = (hi === 0 ? 12 : 0) + (ai === 0 ? 8 : 0);
    candidates.push([h, a, distance(h, a) + Math.min(contrast(h, a), 5) * 22 + primaryBonus]);
  }));
  candidates.sort((a, b) => b[2] - a[2]);
  return [candidates[0][0], candidates[0][1]];
}

function codeFromName(name: string) {
  return TEAM_NAMES[name.trim().toUpperCase()] || "";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function readPct(el: HTMLElement, prop: "left" | "top") {
  return Number.parseFloat(el.style[prop] || "50") || 50;
}

export default function PitchMotionEnhancer() {
  useEffect(() => {
    let phase = 0;

    const update = () => {
      const pitch = document.querySelector<HTMLElement>(".miniMatchPitch");
      if (!pitch) return;

      const homeDots = Array.from(pitch.querySelectorAll<HTMLElement>(".pitchDot.homeDot"));
      const awayDots = Array.from(pitch.querySelectorAll<HTMLElement>(".pitchDot.awayDot"));
      const ball = pitch.querySelector<HTMLElement>(".pitchBall");
      if (homeDots.length !== 11 || awayDots.length !== 11 || !ball) return;

      const homeName = document.querySelector<HTMLElement>(".scoreTeam.home b")?.textContent || "";
      const awayName = document.querySelector<HTMLElement>(".scoreTeam.away b")?.textContent || "";
      const homeCode = codeFromName(homeName);
      const awayCode = codeFromName(awayName);
      const [homeColor, awayColor] = chooseKits(homeCode, awayCode);

      pitch.style.setProperty("--pitch-home", homeColor);
      pitch.style.setProperty("--pitch-away", awayColor);

      const bx = readPct(ball, "left"), by = readPct(ball, "top");
      const actionTitle = document.querySelector<HTMLElement>(".eventPossessionLamp:not(.idle)")?.getAttribute("title") || "";
      const actionTeam = actionTitle.replace(/^Azione:\s*/i, "").trim().toUpperCase();
      const homeHasBall = !!actionTeam && actionTeam === homeName.trim().toUpperCase();
      const awayHasBall = !!actionTeam && actionTeam === awayName.trim().toUpperCase();

      const styleTeam = (dots: HTMLElement[], color: string, isHome: boolean, hasBall: boolean, opponentHasBall: boolean) => {
        let nearest = 0, nearestD = Infinity;
        dots.forEach((dot, i) => {
          const dx = readPct(dot, "left") - bx, dy = readPct(dot, "top") - by;
          const d = dx * dx + dy * dy;
          if (d < nearestD) { nearestD = d; nearest = i; }
        });

        dots.forEach((dot, i) => {
          const x = readPct(dot, "left"), y = readPct(dot, "top");
          const role = i === 0 ? "gk" : i <= 4 ? "def" : i <= 7 ? "mid" : "att";
          let xWeight = role === "gk" ? .035 : role === "def" ? .10 : role === "mid" ? .17 : .20;
          let yWeight = role === "gk" ? .07 : role === "def" ? .17 : role === "mid" ? .23 : .19;

          if (hasBall) {
            xWeight *= role === "att" ? 1.35 : 1.12;
            yWeight *= 1.05;
          } else if (opponentHasBall) {
            xWeight *= role === "def" ? 1.45 : .92;
            yWeight *= role === "def" || role === "mid" ? 1.35 : .9;
          } else {
            xWeight *= .65;
            yWeight *= .7;
          }

          let dx = (bx - x) * xWeight;
          let dy = (by - y) * yWeight;

          // The nearest player actively engages the ball while the rest keep the team shape.
          if (i === nearest && role !== "gk") {
            const close = hasBall ? .42 : opponentHasBall ? .48 : .28;
            dx = (bx - x) * close;
            dy = (by - y) * close;
          }

          // Lines advance/retreat coherently with the direction of play.
          const direction = isHome ? 1 : -1;
          if (hasBall && role !== "gk") dx += direction * (role === "att" ? 4.2 : role === "mid" ? 2.4 : 1.1);
          if (opponentHasBall && role === "att") dx -= direction * 2.2;

          const sway = Math.sin(phase * .75 + i * 1.31 + (isHome ? 0 : .8)) * (role === "gk" ? .25 : .8);
          dx = clamp(dx, -14, 14);
          dy = clamp(dy + sway, -15, 15);

          dot.style.background = color;
          dot.style.borderColor = contrast(color, "#f4f4f4") < 1.7 ? "#183129" : "rgba(255,255,255,.72)";
          dot.style.boxShadow = `0 2px 8px rgba(0,0,0,.55),0 0 0 2px ${color}2f`;
          dot.style.transition = "transform .72s cubic-bezier(.22,.61,.36,1), background .25s ease, border-color .25s ease";
          dot.style.transform = `translate(calc(-50% + ${dx.toFixed(2)}%), calc(-50% + ${dy.toFixed(2)}%))`;
          dot.style.zIndex = i === nearest ? "5" : "4";
        });
      };

      styleTeam(homeDots, homeColor, true, homeHasBall, awayHasBall);
      styleTeam(awayDots, awayColor, false, awayHasBall, homeHasBall);
      ball.style.transition = "left .65s cubic-bezier(.22,.61,.36,1), top .65s cubic-bezier(.22,.61,.36,1)";
      phase += 1;
    };

    update();
    const timer = window.setInterval(update, 620);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
