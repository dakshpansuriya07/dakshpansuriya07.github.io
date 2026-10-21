// Robot world: an isometric robotics hall drawn live in SVG. Scroll drives one continuous camera
// from station to station while a cleaning robot drives along with it, its lidar mapping the walls.
import * as k from "./iso-kit.js";

const P = { origin: [0, 0], scale: 8 };
const iso = (x, y, z) => k.iso([x, y, z], P);

// ---- palettes: four-tone shading, SRCo greens ----
const PAL = {
  paper: { fill: "#fbfbfa", shades: ["#dcdcd9", "#e5e5e2", "#ededea", "#f4f4f1"], top: "#ffffff", line: "#8a8a8f", crease: "#d4d4d6" },
  subject: { fill: "#fbfbfa", shades: ["#d9d9d6", "#e3e3e0", "#ecece9", "#f4f4f1"], top: "#ffffff", line: "#26262a", crease: "#b4b4b8" },
  floor: { fill: "#f2f2ef", shades: ["#d3d3cf", "#dadad6", "#e1e1dd", "#e8e8e4"], top: "#f6f6f3", line: "#b4b4b8", crease: "#e2e2df" },
  dark: { fill: "#2b2b2f", shades: ["#1f1f22", "#27272a", "#2f2f33", "#37373b"], top: "#45454a", line: "#111113", crease: "#58585d" },
  brand: { fill: "#1f7a3d", shades: ["#175c2e", "#1a6a35", "#1f7a3d", "#238843"], top: "#2aa34c", line: "#0f3d1f", crease: "#2aa34c" },
  cinema: { fill: "#1d201e", shades: ["#141615", "#181a19", "#1d201e", "#232624"], top: "#2b2e2c", line: "#0b0c0b", crease: "#313532" },
  carpet: { fill: "#262927", shades: ["#1c1e1d", "#202321", "#262927", "#2b2e2c"], top: "#2c2f2d", line: "#1a1c1b", crease: "#2c2f2d" },
  yellow: { fill: "#f2c230", shades: ["#c99d1d", "#d9aa22", "#e6b628", "#f2c230"], top: "#f7d35a", line: "#5e4a0e", crease: "#f7d35a" },
  hot: { fill: "#b3372f", shades: ["#8a2a24", "#9b2f29", "#b3372f", "#c2433a"], top: "#d0564d", line: "#4f1612", crease: "#d0564d" },
  mat: { fill: "#33463a", shades: ["#24312a", "#29382f", "#2e3f34", "#334639"], top: "#3b5244", line: "#1b2620", crease: "#3b5244" },
  nickel: { fill: "#d9dcde", shades: ["#a9aeb2", "#b7bcc0", "#c5cacd", "#d3d7da"], top: "#e8ebed", line: "#6b7175", crease: "#eef0f1" },
  seat: { fill: "#1f3d2a", shades: ["#142a1c", "#183121", "#1c3826", "#21402c"], top: "#2a5238", line: "#0a140e", crease: "#2f5a3e" },
  kraft: { fill: "#d9bc8c", shades: ["#b8975f", "#c4a46c", "#ceb07a", "#d9bc8c"], top: "#e6cc9f", line: "#6e5530", crease: "#e6cc9f" },
  clay: { fill: "#c9774f", shades: ["#9c5536", "#a95e3d", "#b86845", "#c9774f"], top: "#d88a63", line: "#5a2d18", crease: "#d88a63" },
  coffee: { fill: "#4a2f1f", shades: ["#3a2416", "#3a2416", "#3a2416", "#3a2416"], top: "#5b3a26", line: "#2a190f", crease: "#5b3a26" },
  cloth: { fill: "#a9dcc0", shades: ["#86bfa0", "#90c9aa", "#9bd2b4", "#a9dcc0"], top: "#bfe8d1", line: "#3d6b52", crease: "#bfe8d1" },
};
const solid = (p, pal, w = 1.3, sides = false) =>
  (sides ? "" : `<path d="${p.fill}" fill="${pal.fill}"/>`) +
  p.shades.map((d, i) => (d ? `<path d="${d}" fill="${pal.shades[i]}" stroke="${pal.shades[i]}" stroke-width="0.4" stroke-linejoin="round"/>` : "")).join("") +
  (sides ? "" : `<path d="${p.top}" fill="${pal.top}"/><path d="${p.crease}" fill="none" stroke="${pal.crease}" stroke-width="${w * 0.8}" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`) +
  `<path d="${p.outline}" fill="none" stroke="${pal.line}" stroke-width="${w}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>`;
const line = (d, color, w = 1) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>`;
const poly = (pts, closed = false) => k.pathOf(pts.map(([x, y, z]) => iso(x, y, z)), closed);
const slab = (x, y, w, d, z, h, r = 0, steps = 1, bevel = 0) => k.slabOf({ x, y, w, d, r }, z, h, P, steps, bevel);
const cyl = (x, y, r, z, h, steps = 32, bevel = 0) => k.cylinder(x, y, r, z, h, P, steps, bevel);

// ---- the hall (world units ≈ 10 cm) ----
const L = 800, D = 62, T = 2, H = 42;
const RY = 40; // the robot drives along this line
const FACE = T + 0.9; // screens sit on the wall, 9 cm proud of it
const CINEMA = [440, 704]; // the screening room's dark walls and carpet
const BEAM_Z = 11.6;
const EMAIL = "dakshpansuriya07@gmail.com";
const GITHUB = "github.com/dakshpansuriya07";
const HRT_INSTA = "https://www.instagram.com/reel/DeuvXOCvkQq/"; // the Instagram post for The New PayPal Mafia
const INSTA_FOR = { "assets/full/hrt-mafia.mp4": HRT_INSTA || "#" };

// ---- lidar point text on a wall: the name at the start, LET'S TALK at the end ----
const NAME = { x0: 10, x1: 96, z0: 16, z1: 39, cols: 56 };
const TALK = { x0: 712, x1: 792, z0: 20, z1: 36, cols: 40 };

// ---- stations: the order the camera visits ----
// acts: what the robot does when it stops there (scan = boxes an object, wall = measures to the wall,
// width = measures the screen, say = a speech chip, charge = charging at the dock)
const clip = (name, a = 16 / 9) => ({ a, loop: `assets/loops/${name}.mp4`, full: `assets/full/${name}.mp4`, poster: `assets/full/${name}.jpg` });
const S = [
  { id: "intro", x: 52, rx: 88, label: "Intro", acts: [{ type: "say", text: "Hi! I'll show you around", wiggle: true }] },
  {
    id: "ohms", x: 142, label: "Ohm's law", group: "Made for you",
    screens: [{ w: 46, ...clip("ohms-law") }],
    card: { title: "Your Ohm's law pilot, already made", p: "You suggested Ohm's law as a pilot, so I made it myself. A special demo, just for you.", play: 0 },
    acts: [{ type: "scan", box: [137.2, 14.1, 6.05, 144.8, 17.5, 8.7], tag: "loose connector · 2 V lost" }, { type: "wall", tag: "wall · 3.80 m" }],
  },
  {
    id: "lidar", x: 208, label: "Lidar", group: "Made for you",
    screens: [{ w: 46, ...clip("lidar") }],
    card: { title: "How a robot's lidar sees", p: "A second demo for you: how a robot measures distance with light, and why a smudge can stop it.", play: 0 },
    acts: [{ type: "wall", tag: "3.80 m · light back in 25 ns" }, { type: "scan", box: [195.6, 8.2, 6, 204.4, 10.4, 14.8], tag: "target · 0.60 m" }],
  },
  {
    id: "pwm", x: 274, label: "PWM", group: "Explainers",
    screens: [{ w: 46, ...clip("pwm") }],
    card: { title: "How a controller slows a motor", p: "It switches the power on and off, fast. More time on means more speed.", play: 0 },
    acts: [{ type: "scan", box: [284.2, 9.6, 6.1, 289.8, 15.2, 12], tag: () => `motor · duty ${Math.round(pwmDuty * 100)}%` }],
  },
  {
    id: "cells", x: 340, label: "Cells", group: "Explainers",
    screens: [{ w: 46, ...clip("cells") }],
    card: { title: "Battery cells in series", p: "Small cells add up. Ten of them make one 36-volt battery.", play: 0 },
    acts: [{ type: "scan", box: [319.6, 10.8, 6.1, 346.6, 14.2, 13.7], tag: "10 × 3.6 V = 36 V" }],
  },
  {
    id: "hrt", x: 486, rx: 461, label: "HRT mafia", group: "Best work", dark: true, box: [446, 504, 41],
    screens: [{ h: 30, z0: 10, x0: 479, ...clip("hrt-mafia", 9 / 16) }],
    card: { title: "The New PayPal Mafia", p: "A short documentary about the maths-contest kids who went on to found some of AI's biggest companies.", play: 0, insta: true },
    acts: [{ type: "say", text: "Shh… film's on" }],
  },
  {
    id: "salt", x: 572, rx: 536, label: "Salt Hollow", group: "Best work", dark: true,
    screens: [{ w: 52, ...clip("salt-hollow") }],
    card: { title: "Salt Hollow", p: "My own fun take on the Gravity Falls opening, with a new town, new characters and new music.", play: 0 },
    acts: [{ type: "width", tag: "screen · 5.2 m wide" }],
  },
  {
    id: "more", x: 660, label: "More work", group: "More work", dark: true,
    screens: [
      { x0: 626, z0: 25.5, w: 22, ...clip("receipt") },
      { x0: 651, z0: 18.8, w: 22, ...clip("turbofan") },
      { x0: 626, z0: 12, w: 22, ...clip("tehri") },
      { x0: 676, z0: 12, h: 25.5, ...clip("npfa-library", 9 / 16) },
    ],
    card: {
      title: "More work", p: "An explainer, a 3D short, and two 3D scenes built with code.",
      minis: [["The Receipt", "Animated explainer", 0], ["Never Pay for AI", "3D short", 3], ["X-ray turbofan", "3D, built in Python", 1], ["Tehri Dam", "3D map from real data", 2]],
    },
    acts: [{ type: "scan", box: [670.8, 13.6, 6, 677.4, 18.6, 6.8], tag: "scene 1 · take 3" }],
  },
  {
    id: "contact", x: 750, rx: 759.4, box: [708, 790, 38], label: "Contact", group: "Contact", dark: true,
    card: { title: "Let's build your first module.", p: "Happy to start whenever you are.", mail: EMAIL, link: `https://${GITHUB}` },
    acts: [{ type: "charge" }],
  },
];
for (const st of S) {
  for (const sc of st.screens ?? []) {
    if (sc.h) sc.w = sc.h * sc.a;
    sc.h = sc.w / sc.a;
    sc.x0 ??= st.x - sc.w / 2;
    sc.z0 ??= 13;
    sc.x1 = sc.x0 + sc.w;
    sc.z1 = sc.z0 + sc.h;
  }
}

// ---- painting flat SVG onto faces ----
// local (0,0) → o, (u,0) → a, (0,v) → b
function planeMatrix(o, a, b, u, v) {
  const O = iso(...o), A = iso(...a), Bq = iso(...b);
  return [(A[0] - O[0]) / u, (A[1] - O[1]) / u, (Bq[0] - O[0]) / v, (Bq[1] - O[1]) / v, O[0], O[1]];
}
const onPlane = (o, a, b, u, v, body) => `<g transform="matrix(${planeMatrix(o, a, b, u, v).map((n) => n.toFixed(4)).join(" ")})">${body}</g>`;
function faceMatrix(x0, x1, z0, z1, u, v, y = FACE) {
  return planeMatrix([x0, y, z1], [x1, y, z1], [x0, y, z0], u, v);
}
// a face looking at the viewer (the x–z plane at depth y), local y running down
const wallGroup = (x0, x1, z0, z1, u, body, y = FACE) => onPlane([x0, y, z1], [x1, y, z1], [x0, y, z0], u, (u * (z1 - z0)) / (x1 - x0), body);
// a top face, local y running toward the viewer
const topGroup = (x0, y0, x1, y1, z, u, body) => onPlane([x0, y0, z], [x1, y0, z], [x0, y1, z], u, (u * (y1 - y0)) / (x1 - x0), body);

// a smooth cable through 3D control points
function curve(pts, n = 6) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < n; s++) {
      const t = s / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1, 2].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return poly(out);
}
const cable = (pts, color, w = 2.2) => line(curve(pts), "#0d0d0e", w + 1.4) + line(curve(pts), color, w);
const RED = "#c2412d", BLACK = "#3a3a3e";
const MONO = "JetBrains Mono, monospace", SANS = "Manrope, sans-serif";

// ---- static geometry ----
function buildWorld() {
  let s = `<defs><linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".3" stop-color="#fa7e1e"/><stop offset=".62" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs>`;
  s += solid(slab(-1, -1, L + 2, D + 2, -3, 3), PAL.floor);
  s += solid(slab(CINEMA[0], T, CINEMA[1] - CINEMA[0], D - T - 4, 0, 0.12), PAL.carpet, 0.6);
  const g = [];
  for (let x = 8; x < L; x += 8) if (x < CINEMA[0] || x > CINEMA[1]) g.push(poly([[x, T, 0.02], [x, D - T, 0.02]]));
  for (let y = 8; y < D - T; y += 8) {
    g.push(poly([[T, y, 0.02], [CINEMA[0], y, 0.02]]));
    g.push(poly([[CINEMA[1], y, 0.02], [L - T, y, 0.02]]));
  }
  s += line(g.join(""), "#e4e4e0");
  s += solid(slab(0, 0, T, D, 0, H), PAL.paper);
  s += solid(slab(T, 0, CINEMA[0] - T, T, 0, H), PAL.paper);
  s += solid(slab(CINEMA[0], 0, CINEMA[1] - CINEMA[0], T, 0, H), PAL.cinema);
  s += solid(slab(CINEMA[1], 0, L - CINEMA[1], T, 0, H), PAL.paper);
  s += solid(slab(T, T, CINEMA[0] - T, 0.4, 0, 1.2), PAL.paper, 1);
  s += solid(slab(CINEMA[1], T, L - CINEMA[1] - T, 0.4, 0, 1.2), PAL.paper, 1);
  s += solid(slab(108, T + 0.4, 330, 0.3, 0.02, 0.05), PAL.brand, 0.4);
  for (const st of S) for (const sc of st.screens ?? []) s += solid(slab(sc.x0 - 0.8, T, sc.w + 1.6, FACE - T, sc.z0 - 0.8, sc.h + 1.6, 0.3, 4), PAL.dark, 1);
  s += props();
  // HRT gets a painted title, like a cinema poster
  s += wallGroup(450, 476, 12, 40, 440, `<text font-family="${SANS}" font-weight="800" fill="#ffffff" letter-spacing="-2">
    <tspan x="0" y="118" font-size="62" fill="#7fd197">THE NEW</tspan><tspan x="0" y="222" font-size="104">PAYPAL</tspan><tspan x="0" y="326" font-size="104">MAFIA</tspan></text>
    <text x="2" y="388" font-family="${MONO}" font-size="21" fill="#8a948d" letter-spacing="1">DOCUMENTARY SHORT</text>`);
  // the contact wall: email and GitHub on two plates under the mural; a click copies them
  s += `<g id="links" opacity="0">` + plate("plMail", 12.6, EMAIL, EMAIL, MAIL_ICON) + plate("plGit", 5.8, GITHUB, `https://${GITHUB}`, GIT_ICON) + `</g>`;
  s += solid(slab(L - T, 0, T, D, 0, 4), PAL.paper);
  s += solid(slab(0, D - T, L, T, 0, 3), PAL.paper);
  return s;
}

const MAIL_ICON = `<rect x="15.5" y="16" width="23" height="17" rx="3" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M17 18.5l10 7.5 10-7.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
// GitHub's mark, from Octicons (MIT)
const GIT_ICON = `<path transform="translate(15 12.5) scale(1.5)" fill="#fff" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>`;
// a dark plate on the contact wall with an icon, the text and a COPY chip
function plate(id, z0, label, copy, icon) {
  // as wide as the painted LET'S TALK above (its letters end at x ≈ 786)
  const x0 = TALK.x0 + 0.3, w = 786 - x0, h = 5.4, u = 760, v = (u * (h - 0.2)) / (w - 0.2);
  let s = solid(slab(x0, T, w, 0.7, z0, h, 0.6, 4), PAL.dark, 1);
  s += wallGroup(x0 + 0.1, x0 + w - 0.1, z0 + 0.1, z0 + h - 0.1, u, `
    <rect width="${u}" height="${v}" rx="12" fill="#1b1d1c"/>
    <rect x="8" y="7" width="${v - 14}" height="${v - 14}" rx="9" fill="#1f7a3d"/>${icon}
    <text x="${v + 10}" y="${v / 2 + 9}" font-family="${SANS}" font-weight="700" font-size="26" fill="#f2f7f3">${label}</text>
    <rect class="chipbg" x="${u - 50}" y="${v / 2 - 19}" width="38" height="38" rx="11" fill="#1b1d1c" stroke="#2aa34c" stroke-width="2"/>
    <g class="ic-copy" transform="translate(${u - 31} ${v / 2})" fill="#1b1d1c" stroke="#7fd197" stroke-width="2.2" stroke-linejoin="round">
      <rect x="-8" y="-9" width="11.5" height="13.5" rx="2.6"/><rect class="front" x="-3.5" y="-4.5" width="11.5" height="13.5" rx="2.6"/></g>
    <path class="ic-done" d="M${u - 40} ${v / 2}l5.5 5.5 9.5-10.5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`, T + 0.72);
  return `<g class="plq" id="${id}" data-copy="${copy}" role="button" tabindex="0" aria-label="Copy ${label}">${s}</g>`;
}

// ---- furniture ----
// a workbench: legs, a low shelf, the top, and optionally an anti-static mat; `under` goes on the shelf
function desk(x0, w, { y0 = 7, d = 12, h = 6, top = PAL.paper, legs = PAL.subject, mat = false, under = "" } = {}) {
  let s = "";
  const leg = (x, y) => solid(slab(x, y, 0.9, 0.9, 0, h - 0.7, 0.2, 2), legs, 1);
  s += leg(x0 + 0.6, y0 + 0.6) + leg(x0 + w - 1.5, y0 + 0.6);
  s += solid(slab(x0 + 0.9, y0 + 0.9, w - 1.8, d - 1.8, 1.5, 0.45, 0.2, 2), top, 1);
  s += under;
  s += leg(x0 + 0.6, y0 + d - 1.5) + leg(x0 + w - 1.5, y0 + d - 1.5);
  s += solid(slab(x0, y0, w, d, h - 0.7, 0.7, 0.4, 4, 0.15), top);
  if (mat) s += solid(slab(x0 + 1.2, y0 + 1, w - 2.4, d - 2, h, 0.1, 0.3, 4), PAL.mat, 0.6);
  return s;
}

// a multimeter lying flat on a desk at height z; `live` leaves the digits to the live layer
const lcd = (val) => `<text x="112" y="64" text-anchor="end" font-family="${MONO}" font-weight="700" font-size="50" fill="#1c241c">${val}</text><text x="118" y="64" font-family="${MONO}" font-weight="700" font-size="24" fill="#1c241c">V</text>`;
const LCD_AT = (x, y, z) => [x + 0.9, y + 0.8, x + 4.6, y + 2.9, z + 1.42];
function multimeter(x, y, z, val, live = false) {
  let s = solid(slab(x, y, 8, 5, z, 1.3, 0.8, 4, 0.2), PAL.yellow, 1.1);
  s += solid(slab(x + 0.45, y + 0.4, 7.1, 4.2, z + 1.3, 0.1, 0.5, 4), PAL.dark, 0.8);
  const [a, b, c, d, zz] = LCD_AT(x, y, z);
  s += topGroup(a, b, c, d, zz, 148, `<rect width="148" height="84" rx="8" fill="#b9c7ac"/>${live ? "" : lcd(val)}`);
  s += topGroup(x + 0.45, y + 0.4, x + 7.55, y + 4.6, z + 1.41, 284, `<circle cx="46" cy="138" r="13" fill="#111"/><circle cx="46" cy="138" r="8" fill="${RED}"/><circle cx="110" cy="138" r="13" fill="#111"/><circle cx="110" cy="138" r="8" fill="#55555a"/>`);
  s += solid(cyl(x + 6, y + 2.2, 1.15, z + 1.4, 0.45, 28), PAL.subject, 1);
  s += line(poly([[x + 6, y + 2.2, z + 1.86], [x + 6.65, y + 1.5, z + 1.86]]), "#26262a", 1.6);
  return s;
}
const yellowNote = (x, y, z, text, size = 36) =>
  solid(slab(x, y, 4.4, 2.6, z, 0.05, 0.1, 1), PAL.yellow, 0.8) +
  topGroup(x, y, x + 4.4, y + 2.6, z + 0.06, 176, `<text x="12" y="66" font-family="${SANS}" font-weight="800" font-size="${size}" fill="#5e4a0e">${text}</text>`);
// a cinema row facing the screen; `extra(i, sx)` draws things on seat i before its backrest
function seatRow(x0, y, n, extra = () => "") {
  let s = "";
  const arm = (x) => solid(slab(x, y + 0.3, 0.7, 5.2, 0, 3.6, 0.25, 2), PAL.dark, 1);
  for (let i = 0; i < n; i++) {
    const sx = x0 + i * 6.2;
    s += arm(sx);
    s += solid(slab(sx + 1, y + 0.8, 4.9, 4, 0, 1.6, 0.2, 2), PAL.dark, 1);
    s += solid(slab(sx + 0.8, y + 0.4, 5.3, 4.2, 1.6, 1.1, 0.5, 4, 0.2), PAL.seat, 1);
    s += extra(i, sx);
    s += solid(slab(sx + 0.8, y + 4.3, 5.3, 1.4, 1.4, 6, 0.6, 4, 0.2), PAL.seat, 1);
  }
  return s + arm(x0 + n * 6.2);
}
function popcorn(x, y, z) {
  let s = solid(slab(x, y, 1.8, 1.4, z, 2, 0.1, 1), PAL.paper, 1);
  s += wallGroup(x, x + 1.8, z, z + 2, 36, [0, 12, 24].map((sx) => `<rect x="${sx}" width="6" height="40" fill="${RED}"/>`).join(""), y + 1.41);
  const pts = [[0.3, 0.3], [1.0, 0.2], [1.5, 0.4], [0.5, 0.8], [1.2, 0.8], [0.4, 1.2], [1.0, 1.2], [1.5, 1.1]];
  for (const [dx, dy] of pts) {
    const [px, py] = iso(x + dx, y + dy, z + 2.25 + 0.25 * Math.sin(dx * 7 + dy * 3));
    s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.5" fill="#fff3c4" stroke="#c9a54a" stroke-width="0.6"/>`;
  }
  return s;
}
function soda(x, y, z) {
  let s = solid(cyl(x, y, 0.7, z, 2.2, 20), PAL.hot, 1);
  s += solid(cyl(x, y, 0.76, z + 2.2, 0.2, 20), PAL.paper, 0.8);
  return s + line(poly([[x + 0.15, y, z + 2.4], [x + 0.45, y - 0.25, z + 3.7]]), "#26262a", 2.6) + line(poly([[x + 0.15, y, z + 2.4], [x + 0.45, y - 0.25, z + 3.7]]), "#f2f2ef", 1.4);
}
// a lectern in front of the HRT seats that opens the Instagram post
function instaKiosk() {
  const x0 = 477, x1 = 497, yb = 22.4, yf = 25, zt = 4.8, zl = 3.2, th = 0.45;
  let s = solid(slab(484.6, 22.4, 4.8, 3.4, 0, 0.3, 0.4, 4), PAL.dark, 1);
  s += solid(slab(486.4, 23.1, 1.2, 1.2, 0.3, 3.4, 0.2, 2), PAL.dark, 1);
  const q = (pts, fill, cls = "") => `<path${cls} d="${poly(pts, true)}" fill="${fill}" stroke="#111113" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`;
  s += q([[x0, yf, zl], [x1, yf, zl], [x1, yf, zl - th], [x0, yf, zl - th]], "#27272a");
  s += q([[x1, yb, zt], [x1, yf, zl], [x1, yf, zl - th], [x1, yb, zt - th]], "#1f1f22");
  s += q([[x0, yb, zt], [x1, yb, zt], [x1, yf, zl], [x0, yf, zl]], "#ffffff", ` class="kface"`);
  const u = 400, v = (u * Math.hypot(yf - yb, zt - zl)) / (x1 - x0);
  s += onPlane([x0, yb, zt], [x1, yb, zt], [x0, yf, zl], u, v, `
    <rect x="12" y="${(v - 42) / 2}" width="42" height="42" rx="12" fill="url(#igGrad)"/>
    <rect x="21" y="${v / 2 - 12}" width="24" height="24" rx="7" fill="none" stroke="#fff" stroke-width="3"/>
    <circle cx="33" cy="${v / 2}" r="5.6" fill="none" stroke="#fff" stroke-width="3"/><circle cx="39.6" cy="${v / 2 - 6.4}" r="1.8" fill="#fff"/>
    <text x="68" y="${v / 2 + 1}" font-family="${SANS}" font-weight="800" font-size="23" fill="#111">Watch on Instagram</text>
    <text x="68" y="${v / 2 + 19}" font-family="${MONO}" font-weight="500" font-size="10.5" fill="#6b6b6b" letter-spacing="1">THE NEW PAYPAL MAFIA</text>
    <text x="384" y="${v / 2 + 9}" text-anchor="end" font-family="${SANS}" font-weight="800" font-size="26" fill="#1f7a3d">↗</text>`);
  return `<a id="insta" href="${HRT_INSTA || "#"}" target="_blank" rel="noopener" aria-label="Watch The New PayPal Mafia on Instagram">${s}</a>`;
}

function props() {
  let s = "";
  { // Ohm's law: a 24 V battery, a loose connector getting hot, a multimeter across it, the motor controller
    const Z = 6.1;
    s += desk(120, 44, { mat: true, under: solid(slab(123.5, 9.5, 9, 6, 1.95, 2.5, 0.3, 4), PAL.brand, 1) });
    s += solid(slab(123, 8.8, 10, 6.4, Z, 5.6, 0.7, 4, 0.2), PAL.subject);
    s += solid(slab(122.94, 8.74, 10.12, 6.52, Z + 4.1, 0.9, 0.72, 4), PAL.brand, 1, true);
    s += wallGroup(123.6, 132.4, Z + 0.6, Z + 3.8, 176, `<text x="10" y="52" font-family="${SANS}" font-weight="800" font-size="46" fill="#26262a">24 V</text>`, 15.22);
    s += solid(cyl(130.6, 10.4, 0.6, Z + 5.6, 0.5, 16), PAL.hot, 1) + solid(cyl(130.6, 13.4, 0.6, Z + 5.6, 0.5, 16), PAL.dark, 1);
    s += cable([[133, 12.4, Z + 1.4], [134.6, 12.6, Z + 0.25], [136, 15.2, Z + 0.25], [137.6, 15.3, Z + 1]], RED);
    s += cable([[133, 13.4, Z + 1.4], [134.2, 13.8, Z + 0.25], [135.4, 16.4, Z + 0.25], [137.6, 16.3, Z + 1]], BLACK);
    s += solid(slab(137.5, 14.4, 3.3, 2.8, Z, 2.2, 0.35, 4), PAL.yellow, 1.1);
    s += solid(slab(141.15, 14.4, 3.3, 2.8, Z, 2.2, 0.35, 4), PAL.yellow, 1.1); // pulled out a little: the loose one
    s += cable([[144.45, 15.3, Z + 1], [146, 15.3, Z + 0.25], [147.4, 12.4, Z + 0.25], [150.3, 11.6, Z + 0.7]], RED);
    s += cable([[144.45, 16.3, Z + 1], [146.6, 16.3, Z + 0.25], [148.2, 13.1, Z + 0.25], [150.3, 12.5, Z + 0.7]], BLACK);
    s += solid(slab(150, 8.4, 9.5, 4.8, Z, 0.45, 0.3, 4), PAL.brand, 1);
    s += solid(slab(152.4, 9.1, 2.6, 2.4, Z + 0.45, 0.45, 0.15, 2), PAL.dark, 0.8);
    s += solid(slab(156, 9, 2, 1.2, Z + 0.45, 0.4, 0.15, 2), PAL.dark, 0.8);
    s += solid(slab(150.3, 10.9, 1.4, 2, Z + 0.45, 0.9, 0.1, 1), PAL.subject, 0.8);
    s += solid(cyl(156.4, 11.7, 0.6, Z + 0.45, 1.6, 16), PAL.dark, 0.9) + solid(cyl(158, 11.7, 0.6, Z + 0.45, 1.6, 16), PAL.dark, 0.9);
    s += multimeter(149.5, 13.8, Z, "2.00", true);
    s += cable([[151.1, 17.8, Z + 1.45], [149.6, 18.4, Z + 0.6], [147, 18.5, Z + 0.2], [144.4, 18.3, Z + 0.2]], RED);
    s += line(poly([[144.4, 18.3, Z + 0.3], [142.9, 16.4, Z + 2.25]]), RED, 3.4) + line(poly([[142.9, 16.4, Z + 2.25], [142.7, 16.1, Z + 2.45]]), "#9a9a9e", 1.4);
    s += cable([[152.7, 17.8, Z + 1.45], [151.2, 18.7, Z + 0.6], [146, 18.8, Z + 0.2], [140.9, 18.5, Z + 0.2]], BLACK);
    s += line(poly([[140.9, 18.5, Z + 0.3], [139.5, 16.4, Z + 2.25]]), "#26262a", 3.4) + line(poly([[139.5, 16.4, Z + 2.25], [139.3, 16.1, Z + 2.45]]), "#9a9a9e", 1.4);
    s += yellowNote(124, 16.1, Z, "V = I×R", 34);
  }
  { // Lidar: the sensor on a riser aimed at a target card, a laptop with its scan, and the cleaning kit
    const Z = 6;
    s += desk(186, 44, { under: solid(slab(189, 9.5, 8, 6, 1.95, 2.6, 0.2, 2), PAL.kraft, 1) });
    s += solid(slab(195.6, 8.2, 8.8, 2.2, Z, 0.5, 0.4, 4), PAL.dark, 1);
    s += solid(slab(199.6, 8.4, 0.8, 0.8, Z + 0.5, 3.2, 0.1, 1), PAL.paper, 1);
    s += solid(slab(196, 9, 8, 0.5, Z + 1.4, 7.2, 0.2, 2), PAL.paper);
    s += wallGroup(196.1, 203.9, Z + 1.5, Z + 8.5, 160, `<g transform="translate(80 72)">${[[66, "#ffffff", "#26262a"], [50, "#26262a", "none"], [36, "#ffffff", "none"], [22, "#1f7a3d", "none"], [9, "#ffffff", "none"]].map(([r, f, st]) => `<circle r="${r}" fill="${f}" stroke="${st}" stroke-width="2"/>`).join("")}<path d="M-72 0h144M0 -72v144" stroke="#26262a" stroke-width="1" opacity=".35"/></g>`, 9.52);
    s += solid(slab(197.6, 13.1, 4.8, 4.8, Z, 2, 0.4, 4, 0.15), PAL.paper);
    const lz = Z + 2;
    s += solid(cyl(200, 15.5, 1.7, lz, 0.8, 32), PAL.dark);
    s += solid(cyl(200, 15.5, 2.1, lz + 0.8, 0.6, 40), PAL.subject, 1.2);
    s += solid(cyl(200, 15.5, 2.15, lz + 1.4, 1.1, 40), PAL.dark, 1);
    s += solid(cyl(200, 15.5, 2.1, lz + 2.5, 0.6, 40, 0.2), PAL.subject, 1.2);
    { // a smudge on the window
      const [px, py] = iso(201.3, 17.1, lz + 1.95);
      s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="5" ry="2.6" fill="#d9ddd9" opacity=".55" transform="rotate(-18 ${px.toFixed(1)} ${py.toFixed(1)})"/>`;
    }
    s += solid(slab(209, 10.5, 10, 6.6, Z, 0.5, 0.4, 4), PAL.dark);
    s += solid(slab(209, 10.5, 10, 0.5, Z + 0.5, 6.6, 0.2, 2), PAL.dark);
    const room = [];
    for (let x = 30; x <= 170; x += 7) room.push([x, 18], [x, 106]);
    for (let y = 25; y < 106; y += 7) room.push([30, y], [170, y]);
    s += wallGroup(209.4, 218.6, Z + 1, Z + 6.7, 200, `<rect width="200" height="124" rx="5" fill="#0f1411"/>
      ${[20, 40].map((r) => `<circle cx="100" cy="62" r="${r}" fill="none" stroke="#1d3326"/>`).join("")}
      ${room.filter(([x, y]) => !(y === 18 && x > 120 && x < 150)).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#2aa34c"/>`).join("")}
      ${[[124, 50], [127, 56], [129, 62], [127, 68], [124, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${RED}"/>`).join("")}
      <path d="M100 56l6 11h-12z" fill="#7fd197"/>
      <text x="10" y="117" font-family="${MONO}" font-size="11" fill="#7fd197">0.60 m</text>`, 11.02);
    s += topGroup(209.6, 11.2, 218.4, 16.6, Z + 0.51, 176, keyboard(176, 108));
    s += solid(slab(221, 9.6, 5, 3.4, Z, 0.3, 0.3, 4), PAL.cloth, 0.8) + solid(slab(221.4, 9.9, 4.2, 2.8, Z + 0.3, 0.3, 0.3, 4), PAL.cloth, 0.8);
    s += solid(cyl(224.6, 15.4, 1.2, Z, 3.6, 28, 0.1), PAL.subject, 1.2);
    s += solid(cyl(224.6, 15.4, 1.22, Z + 1.2, 1.2, 28), PAL.brand, 1, true);
    s += solid(cyl(224.6, 15.4, 0.5, Z + 3.6, 0.8, 16), PAL.brand, 1);
    s += solid(slab(223.9, 14.2, 1.4, 2.2, Z + 4.4, 0.9, 0.2, 2), PAL.brand, 1);
  }
  { // PWM: a scope showing the switching, the controller board, a motor with a propeller
    const Z = 6.1;
    s += desk(252, 44, { mat: true, under: solid(slab(255, 9.5, 9, 5, 1.95, 2.6, 0.3, 4), PAL.hot, 1) });
    s += solid(slab(254, 8.2, 13, 7.2, Z, 7.4, 0.5, 4, 0.2), PAL.dark);
    s += wallGroup(254.4, 266.6, Z + 0.4, Z + 7, 260, `
      <rect x="10" y="10" width="170" height="114" rx="6" fill="#0d1410" stroke="#3a3f3c" stroke-width="2"/>
      ${[...Array(9).keys()].map((i) => `<path d="M${10 + i * 21.25} 10v114" stroke="#1a2a20"/>`).join("")}${[...Array(6).keys()].map((i) => `<path d="M10 ${10 + i * 22.8}h170" stroke="#1a2a20"/>`).join("")}
      ${[[205, 30, 13], [240, 30, 13], [205, 70, 10], [240, 70, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3a3d3b" stroke="#5a5d5b" stroke-width="2"/><path d="M${x} ${y}v${-r + 3}" stroke="#d9d9d6" stroke-width="2"/>`).join("")}
      <rect x="194" y="96" width="14" height="8" rx="2" fill="#2aa34c"/><rect x="214" y="96" width="14" height="8" rx="2" fill="#f2c230"/><rect x="234" y="96" width="14" height="8" rx="2" fill="#55585a"/>
      <circle cx="205" cy="125" r="7" fill="#c5cacd" stroke="#6b7175" stroke-width="2"/><circle cx="240" cy="125" r="7" fill="#c5cacd" stroke="#6b7175" stroke-width="2"/>
      <text x="12" y="138" font-family="${MONO}" font-size="10" fill="#7a7d7b" letter-spacing="1">SCOPE · 2 CH</text>`, 15.42);
    s += cable([[264, 15.45, Z + 1.2], [264.6, 17.4, Z + 0.2], [267.6, 18.2, Z + 0.2], [269.8, 17.4, Z + 0.6]], "#55585a", 1.8);
    s += solid(slab(269, 13.8, 8.6, 4.8, Z, 0.45, 0.3, 4), PAL.brand, 1);
    s += solid(slab(270, 14.3, 3.2, 2.4, Z + 0.45, 2, 0.1, 1), PAL.nickel, 1);
    s += line([270.5, 271.1, 271.7, 272.3, 272.9].map((fx) => poly([[fx, 14.4, Z + 2.46], [fx, 16.6, Z + 2.46]])).join(""), "#8b9196", 1);
    s += solid(slab(274, 14.4, 2.2, 1.6, Z + 0.45, 0.45, 0.15, 2), PAL.dark, 0.8);
    s += solid(slab(276.5, 14.2, 0.9, 2.4, Z + 0.45, 0.9, 0.1, 1), PAL.subject, 0.8);
    s += solid(cyl(272.8, 17.6, 0.35, Z + 0.45, 0.3, 12), PAL.dark, 0.6);
    s += solid(cyl(274.6, 17.5, 0.6, Z + 0.45, 1.7, 16), PAL.dark, 0.9) + solid(cyl(276.2, 17.5, 0.6, Z + 0.45, 1.7, 16), PAL.dark, 0.9);
    s += cable([[277.4, 15, Z + 0.8], [279.6, 15.2, Z + 0.2], [282.6, 14.2, Z + 0.2], [284.8, 13.4, Z + 0.6]], RED);
    s += cable([[277.4, 15.9, Z + 0.8], [279.6, 16.2, Z + 0.2], [282.8, 15.1, Z + 0.2], [285, 14.4, Z + 0.6]], BLACK);
    s += solid(cyl(287, 12.4, 2.6, Z, 4.6, 40, 0.2), PAL.subject, 1.3);
    s += solid(cyl(287, 12.4, 2.62, Z + 3.6, 1, 40), PAL.dark, 1, true);
    s += line(k.knurl(287, 12.4, 2.6, Z + 0.4, Z + 3.4, 18, P), "#c4c4c7");
    s += solid(cyl(287, 12.4, 0.55, Z + 4.6, 0.7, 16), PAL.dark, 1);
    s += solid(slab(290.6, 8.4, 4, 3.4, Z, 2.6, 0.4, 4), PAL.dark, 1);
    s += solid(cyl(291.6, 9.4, 0.4, Z + 2.6, 0.3, 12), PAL.hot, 0.8) + solid(cyl(293.6, 9.4, 0.4, Z + 2.6, 0.3, 12), PAL.subject, 0.8);
    s += cable([[292.4, 11.8, Z + 0.6], [293, 16.8, Z + 0.2], [286, 18.2, Z + 0.2], [279, 18.3, Z + 0.2], [277.6, 17.6, Z + 0.6]], RED, 1.8);
  }
  { // Cells: ten cells being joined in series, the finished 36 V pack, a multimeter across the string
    const Z = 6.1;
    s += desk(318, 44, { mat: true, under: solid(slab(321, 9.5, 9, 6, 1.95, 2.8, 0.2, 2), PAL.kraft, 1) });
    s += solid(slab(319.6, 10.8, 27, 3.4, Z, 0.9, 0.4, 4), PAL.dark);
    s += solid(slab(318.6, 12, 1.4, 1, Z + 0.9, 0.08, 0.2, 2), PAL.nickel, 0.8) + solid(slab(346.2, 12, 1.4, 1, Z + 0.9, 0.08, 0.2, 2), PAL.nickel, 0.8);
    const cx = (i) => 321.2 + i * 2.6;
    for (let i = 0; i < 10; i++) {
      s += solid(cyl(cx(i), 12.5, 1.15, Z + 0.9, 6.3, 28), PAL.brand, 1);
      s += solid(cyl(cx(i), 12.5, i % 2 ? 1.15 : 0.55, Z + 7.2, 0.3, 24), PAL.paper, 0.8);
    }
    for (let i = 0; i < 10; i += 2) {
      s += solid(slab(cx(i) - 0.7, 11.95, 4, 1.1, Z + 7.5, 0.08, 0.2, 2), PAL.nickel, 0.8);
      for (const wx of [cx(i) - 0.3, cx(i) + 0.3, cx(i + 1) - 0.3, cx(i + 1) + 0.3]) {
        const [px, py] = iso(wx, 12.5, Z + 7.6);
        s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="0.9" fill="#6b7175"/>`;
      }
    }
    s += solid(slab(349.4, 8, 10, 5.6, Z, 6, 0.6, 4, 0.2), PAL.subject);
    s += solid(slab(349.34, 7.94, 10.12, 5.72, Z + 4.5, 0.9, 0.62, 4), PAL.brand, 1, true);
    s += wallGroup(350, 358.8, Z + 0.5, Z + 3.9, 176, `<text x="10" y="44" font-family="${SANS}" font-weight="800" font-size="40" fill="#26262a">36 V</text><text x="12" y="62" font-family="${MONO}" font-size="12" fill="#6b6b6b" letter-spacing="1">10 CELLS IN SERIES</text>`, 13.62);
    s += multimeter(351, 14, Z, "36.0");
    s += cable([[352.6, 18, Z + 1.45], [350.6, 18.5, Z + 0.4], [348.6, 16.6, Z + 0.2], [347.6, 13.4, Z + 0.4], [347.2, 12.5, Z + 1]], RED, 2);
    s += cable([[354.2, 18, Z + 1.45], [352.4, 18.9, Z + 0.4], [336, 18.6, Z + 0.2], [320, 18.2, Z + 0.2], [318.8, 14.4, Z + 0.4], [319, 12.5, Z + 1]], BLACK, 2);
  }
  { // Kit: where the code gets written
    const Z = 6;
    s += desk(384, 44, { under: solid(slab(386.5, 9.5, 5.5, 8, 1.95, 3, 0.3, 4), PAL.dark, 1) });
    s += line(curve([[388.4, 11.8, Z + 0.5], [389.6, 9.6, Z + 0.5], [392.8, 9.4, Z + 0.5], [394.1, 11.6, Z + 0.5]]), "#111113", 3.6) + line(curve([[388.4, 11.8, Z + 0.5], [389.6, 9.6, Z + 0.5], [392.8, 9.4, Z + 0.5], [394.1, 11.6, Z + 0.5]]), "#45454a", 2);
    s += solid(cyl(388.6, 12.8, 1.35, Z, 1, 28), PAL.dark, 1) + solid(cyl(394, 12.6, 1.35, Z, 1, 28), PAL.dark, 1);
    s += yellowNote(389.6, 15.6, Z, "final_v3", 30);
    s += solid(slab(398, 11, 12, 7, Z, 0.55, 0.4, 4), PAL.dark);
    s += solid(slab(398, 11, 12, 0.5, Z + 0.55, 7.6, 0.2, 2), PAL.dark);
    s += wallGroup(398.5, 409.5, Z + 1, Z + 7.8, 240, `${editTimeline(240, 148)}
      <text x="12" y="124" font-family="${MONO}" font-size="9" fill="#7fd197">export final_v3.mp4</text><rect x="12" y="130" width="216" height="7" rx="3.5" fill="#1d2a22"/>`, 11.52);
    s += topGroup(398.6, 11.7, 409.4, 17.6, Z + 0.56, 216, keyboard(216, 118));
    s += solid(slab(412, 14.6, 1.7, 2.6, Z, 0.6, 0.8, 6), PAL.paper, 1);
    s += solid(cyl(418.5, 11.4, 1.4, Z, 2.8, 32, 0.15), PAL.subject, 1.2);
    s += solid(cyl(418.5, 11.4, 1.42, Z + 1, 0.7, 32), PAL.brand, 1, true);
    s += solid(cyl(418.5, 11.4, 1.12, Z + 2.76, 0.02, 32), PAL.coffee, 0.6);
    const handle = poly([[419.85, 11.4, Z + 2.3], [420.9, 11.4, Z + 2.15], [421, 11.4, Z + 1.05], [419.85, 11.4, Z + 0.8]]);
    s += line(handle, "#26262a", 4) + line(handle, "#ffffff", 2.2);
    s += solid(cyl(424.6, 9.8, 1.5, Z, 2.4, 32, 0.15), PAL.clay, 1.1);
    s += solid(cyl(424.6, 9.8, 1.25, Z + 2.38, 0.02, 32), PAL.coffee, 0.6);
    const leaves = [[-1.2, 0.2, 3.6, -28, "#1f7a3d"], [0.9, -0.4, 3.9, 30, "#238843"], [-0.2, -0.8, 4.6, -6, "#2aa34c"], [1.3, 0.6, 3.2, 52, "#1f7a3d"], [-0.9, 0.9, 3.0, -50, "#2aa34c"], [0.2, 0.3, 4.2, 12, "#1a6a35"]];
    for (const [dx, dy, dz, a, c] of leaves) {
      const [px, py] = iso(424.6 + dx, 9.8 + dy, Z + 2.4 + dz * 0.6);
      s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="3.4" ry="9" fill="${c}" stroke="#0f3d1f" stroke-width="0.8" transform="rotate(${a} ${px.toFixed(1)} ${py.toFixed(1)})"/>`;
    }
  }
  { // HRT screening: four seats with popcorn, and the Instagram lectern in front
    s += seatRow(474.6, 13.4, 4, (i, sx) => (i === 1 ? popcorn(sx + 2.4, 14.6, 2.7) : ""));
    s += instaKiosk();
  }
  { // Salt Hollow screening: two rows
    s += seatRow(553.4, 11.6, 6);
    s += seatRow(553.4, 20.4, 6, (i, sx) => (i === 3 ? soda(sx + 3.6, 22.8, 2.7) : ""));
  }
  { // More work: an edit bay under the wall of screens
    const Z = 6;
    s += desk(634, 52, { top: PAL.dark, legs: PAL.dark });
    const speaker = (x) => solid(slab(x, 8.4, 4.2, 4.2, Z, 5.6, 0.4, 4, 0.15), PAL.dark) +
      wallGroup(x + 0.3, x + 3.9, Z + 0.3, Z + 5.3, 72, `<circle cx="36" cy="66" r="25" fill="#141416" stroke="#5a5a60" stroke-width="3"/><circle cx="36" cy="66" r="9" fill="#2f2f33"/><circle cx="36" cy="22" r="9" fill="#141416" stroke="#5a5a60" stroke-width="2"/>`, 12.62);
    s += speaker(636);
    s += solid(slab(645, 8.4, 14, 4.2, Z, 0.9, 0.4, 4), PAL.dark);
    s += topGroup(645.3, 8.7, 658.7, 12.3, Z + 0.91, 336, [...Array(8).keys()].map((i) => {
      const x = 22 + i * 40, cap = 38 + ((i * 37) % 30);
      return `<circle cx="${x}" cy="14" r="6" fill="#55555a"/><path d="M${x} 28v52" stroke="#0d0d0e" stroke-width="3"/><rect x="${x - 7}" y="${cap}" width="14" height="8" rx="2" fill="#e9e9e6"/>`;
    }).join(""));
    s += solid(slab(645.5, 14, 13, 3.6, Z, 0.5, 0.3, 4), PAL.paper, 1);
    s += topGroup(645.8, 14.3, 658.2, 17.3, Z + 0.51, 248, keyboard(248, 60, "#d9d9d6"));
    s += solid(slab(661.5, 13.2, 7.4, 5, Z, 0.8, 0.5, 4), PAL.dark);
    s += topGroup(661.8, 13.5, 664.2, 17.9, Z + 0.81, 48, [14, 34, 54, 74].map((y) => `<rect x="10" y="${y}" width="28" height="12" rx="3" fill="#55555a"/>`).join(""));
    s += solid(cyl(665.8, 15.7, 1.9, Z + 0.8, 0.45, 40, 0.1), PAL.subject, 1.1);
    s += speaker(681);
    s += solid(slab(671, 14.6, 6.2, 3.8, Z, 0.3, 0.2, 2), PAL.dark, 1);
    s += topGroup(671.2, 14.8, 677, 18.2, Z + 0.31, 232, `<text x="14" y="52" font-family="${SANS}" font-weight="700" font-size="26" fill="#f2f2ef">SCENE 1</text><text x="14" y="98" font-family="${SANS}" font-weight="700" font-size="26" fill="#f2f2ef">TAKE 3</text><path d="M120 30v86M14 70h200" stroke="#8a8a8f" stroke-width="1.5"/>`);
    s += solid(slab(671, 13.8, 6.2, 0.8, Z, 0.55, 0.1, 1), PAL.paper, 1);
    s += topGroup(671, 13.8, 677.2, 14.6, Z + 0.56, 248, [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 44 + 10} 32l22 -32h22l-22 32z" fill="#1d1d20"/>`).join(""));
  }
  return s;
}
const keyboard = (u, v, key = "#3a3a3e") => {
  let s = "";
  const kw = (u - 16) / 12;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) s += `<rect x="${(8 + c * kw + 1).toFixed(1)}" y="${(6 + r * kw + 1).toFixed(1)}" width="${(kw - 2.5).toFixed(1)}" height="${(kw - 2.5).toFixed(1)}" rx="2" fill="${key}"/>`;
  if (v > 4 * kw + 30) s += `<rect x="${u / 2 - 34}" y="${6 + 4 * kw + 8}" width="68" height="${Math.min(30, v - 4 * kw - 20)}" rx="4" fill="${key}"/>`;
  return s;
};
// an edit timeline on the laptop: picture clips, a voice track, a playhead
function editTimeline(u, v) {
  let s = `<rect width="${u}" height="${v}" rx="6" fill="#0f1411"/><rect width="${u}" height="18" fill="#171d19"/>`;
  s += `<text x="10" y="13" font-family="${MONO}" font-size="9" fill="#7fd197">00:00:42:12</text>`;
  const clips = [[12, 52, "#1f7a3d"], [66, 40, "#2f5bd3"], [108, 70, "#1f7a3d"], [180, 48, "#c99d1d"]];
  for (const [x, w, c] of clips) s += `<rect x="${x}" y="28" width="${w - 3}" height="20" rx="3" fill="${c}"/>`;
  for (const [x, w] of [[12, 90], [104, 60], [168, 60]]) s += `<rect x="${x}" y="52" width="${w - 3}" height="12" rx="3" fill="#3a3f3c"/>`;
  let wave = "";
  for (let i = 0; i < 54; i++) {
    const h = 3 + 11 * Math.abs(Math.sin(i * 0.9) * Math.sin(i * 0.37 + 1));
    wave += `M${14 + i * 4} ${84 - h / 2}v${h.toFixed(1)}`;
  }
  s += `<rect x="12" y="70" width="216" height="28" rx="3" fill="#16201a"/><path d="${wave}" stroke="#2aa34c" stroke-width="2"/>`;
  return s + `<path d="M132 22v80" stroke="#ff5a3c" stroke-width="2"/>`;
}

// the charging dock at the end of the hall; it stands nearer the viewer than the docked robot, so it's drawn after it
function buildDock() {
  const x = 768;
  let s = solid(slab(x, 33, 4.5, 14, 0, 7.5, 0.6, 4, 0.3), PAL.paper);
  s += solid(slab(x + 0.6, 34, 3.2, 12, 7.5, 0.25, 0.4, 4), PAL.brand, 0.8);
  s += solid(cyl(x + 2.2, 44.6, 0.5, 7.75, 0.35, 16), PAL.brand, 0.8);
  return s;
}

// ---- the live layer: the moving parts on the desks (drawn above the static world, under the robot) ----
const SPILL = { x: 374, y: 40.4 };
function buildLive() {
  const lcdAt = LCD_AT(149.5, 13.8, 6.1);
  const ohms = `<g id="live1">
    <circle id="hotGlow" r="9" fill="url(#hotGrad)"/>
    <path id="heat0" fill="none" stroke="#d0564d" stroke-width="1.5" stroke-linecap="round"/><path id="heat1" fill="none" stroke="#d0564d" stroke-width="1.5" stroke-linecap="round"/><path id="heat2" fill="none" stroke="#d0564d" stroke-width="1.5" stroke-linecap="round"/>
    ${topGroup(lcdAt[0], lcdAt[1], lcdAt[2], lcdAt[3], lcdAt[4], 148, `<text id="ohmsLcd" x="112" y="64" text-anchor="end" font-family="${MONO}" font-weight="700" font-size="50" fill="#1c241c">2.00</text><text x="118" y="64" font-family="${MONO}" font-weight="700" font-size="24" fill="#1c241c">V</text>`)}
  </g>`;
  const lidar = `<g id="live2"><line id="dlBeam" stroke="#2aa34c" stroke-width="1.6" stroke-dasharray="3 3"/><circle id="dlHit" r="2" fill="#2aa34c"/><circle id="dlMark" r="1.1" fill="#2aa34c"/></g>`;
  const pwm = `<g id="live3">
    ${wallGroup(254.4, 266.6, 6.5, 13.1, 260, `<path id="wave" fill="none" stroke="#2aa34c" stroke-width="3" stroke-linejoin="round"/><text id="dutyTx" x="18" y="28" font-family="${MONO}" font-size="12" fill="#7fd197">duty 50%</text>`, 15.44)}
    <circle id="pwmLed" r="1.5" fill="#7dffa6"/>
    <ellipse id="propDisc" fill="#2b2b2f"/><path id="prop" fill="#2b2b2f" stroke="#111113" stroke-width="0.8" stroke-linejoin="round"/>
  </g>`;
  const kit = `<g id="live5">
    <path id="steam0" fill="none" stroke="#b9bdb9" stroke-width="1.6" stroke-linecap="round"/><path id="steam1" fill="none" stroke="#b9bdb9" stroke-width="1.6" stroke-linecap="round"/>
    ${wallGroup(398.5, 409.5, 7, 13.8, 240, `<rect id="renderBar" x="12" y="130" width="0" height="7" rx="3.5" fill="#2aa34c"/><text id="renderTx" x="228" y="124" text-anchor="end" font-family="${MONO}" font-size="9" fill="#7fd197">0%</text>`, 11.54)}
  </g>`;
  const more = `<g id="live8">
    ${topGroup(645.3, 8.7, 658.7, 12.3, 6.92, 336, `<path id="vu" fill="#2aa34c"/>`)}
    <circle id="jog" r="1.6" fill="#8a8a8f"/>
  </g>`;
  return `<defs><radialGradient id="hotGrad"><stop offset="0" stop-color="#ff5a3c" stop-opacity=".75"/><stop offset="1" stop-color="#ff5a3c" stop-opacity="0"/></radialGradient>
    <clipPath id="spillClip"><path id="spillCut"/></clipPath></defs>
    <path id="trail0" fill="#16261c"/><path id="trail1" fill="#16261c"/><path id="trail2" fill="#16261c"/>
    <g id="spill" clip-path="url(#spillClip)">${spillShape()}</g>
    ${ohms}${lidar}${pwm}${kit}${more}`;
}
function spillShape() {
  const pts = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2, r = 1 + 0.16 * Math.sin(a * 3 + 0.6) + 0.09 * Math.sin(a * 5 + 2);
    pts.push([SPILL.x + 4.4 * r * Math.cos(a), SPILL.y + 2.8 * r * Math.sin(a), 0.04]);
  }
  const drop = (x, y, r) => {
    const q = [];
    for (let i = 0; i < 16; i++) q.push([x + r * Math.cos((i / 16) * Math.PI * 2), y + r * 0.8 * Math.sin((i / 16) * Math.PI * 2), 0.04]);
    return poly(q, true);
  };
  const [hx, hy] = iso(SPILL.x - 1.2, SPILL.y - 0.6, 0.05);
  return `<path d="${poly(pts, true)}${drop(SPILL.x + 6, SPILL.y + 1.4, 0.7)}${drop(SPILL.x - 5.6, SPILL.y - 1.6, 0.5)}" fill="#6b4a32" stroke="#4a2f1f" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <ellipse cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" rx="9" ry="3" fill="#a07a5c" opacity=".55"/>`;
}

// ---- the robot (built once at x = 0, moved with a translate) ----
const LIDAR_AHEAD = 3.4, PUCK_R = 2.2;
function buildRobot() {
  const body = { x: -7, y: RY - 5, w: 14, d: 10, r: 2.2 };
  let s = "";
  s += solid(k.slabOf({ x: -7.3, y: RY - 5.3, w: 14.6, d: 10.6, r: 2.4 }, 0.3, 1.1, P, 8), PAL.dark);
  s += solid(k.slabOf(body, 1, 8.4, P, 8, 0.5), PAL.subject, 1.6);
  s += solid(k.slabOf({ x: -7.06, y: RY - 5.06, w: 14.12, d: 10.12, r: 2.26 }, 6.2, 1.1, P, 8), PAL.brand, 1.3, true);
  s += line(k.sideSeam(body, 4.2, P), "#c4c4c7");
  s += solid(k.slabOf({ x: 6.4, y: RY - 4.3, w: 1.4, d: 8.6, r: 0.5 }, 1.4, 2.6, P, 4), PAL.dark);
  s += line(k.planOutline(k.insetPlan(body, 1), 9.4, P), "#c4c4c7");
  s += solid(k.slabOf({ x: -5.4, y: RY - 2.9, w: 3.4, d: 5.8, r: 0.6 }, 9.4, 0.15, P, 4), PAL.dark, 0.8);
  for (const [x, y] of k.dotGrid(-1.6, RY - 3.6, 3, 4, 1.3, 9.4, P)) s += `<circle cx="${x}" cy="${y}" r="1.6" fill="#9a9a9e"/>`;
  s += solid(cyl(-5.7, RY + 3.6, 0.6, 9.4, 0.5, 20), PAL.brand, 0.8);
  s += solid(cyl(LIDAR_AHEAD, RY, 1.5, 9.4, 1, 32), PAL.dark);
  s += solid(cyl(LIDAR_AHEAD, RY, PUCK_R, 10.4, 0.6, 40), PAL.subject, 1.4);
  s += solid(cyl(LIDAR_AHEAD, RY, PUCK_R + 0.05, 11, 1.2, 40), PAL.dark, 1.2);
  s += solid(cyl(LIDAR_AHEAD, RY, PUCK_R, 12.2, 0.7, 40, 0.2), PAL.subject, 1.4);
  return s;
}

// ---- the robot's HUD: lasers, boxes, dimension lines and the little labels ----
function buildHud() {
  const pill = (id) => `<g id="${id}" opacity="0"><line class="lead" x1="0" y1="0" x2="0" y2="-12" stroke="#2aa34c" stroke-width="1.5"/>
    <rect class="bg" height="26" rx="8" fill="#0f1411" fill-opacity=".94" stroke="#2aa34c" stroke-width="1.2"/><circle class="dot" r="3.5" fill="#2aa34c"/>
    <text class="tx" font-family="${MONO}" font-weight="500" font-size="12" fill="#e9f3ec" xml:space="preserve"></text></g>`;
  return `<g id="hud" opacity="0">
      <path id="hPlane" fill="#2aa34c" opacity="0"/>
      <path id="hBox" fill="none" stroke="#2aa34c" stroke-width="1.8" stroke-linecap="round"/>
      <line id="hLaserW" stroke="#7dffa6" stroke-width="4" stroke-linecap="round" opacity=".25"/><line id="hLaser" stroke="#2aa34c" stroke-width="1.5" stroke-linecap="round"/>
      <path id="hDim" fill="none" stroke="#2aa34c" stroke-width="1.4" stroke-linecap="round"/>
      <circle id="hHit" fill="none" stroke="#2aa34c" stroke-width="1.5"/>
    </g>
    <path id="sparkle" fill="#2aa34c" opacity="0"/>
    ${pill("tagA")}${pill("chipB")}`;
}

async function dotText(lines, R, size, r = 1.7) {
  try {
    await document.fonts.load("800 120px Manrope");
  } catch {}
  const W = 1100, Hc = Math.round((W * (R.z1 - R.z0)) / (R.x1 - R.x0));
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = Hc;
  const g = cv.getContext("2d");
  g.font = `800 ${size}px Manrope, sans-serif`;
  lines.forEach(([t, y]) => g.fillText(t, 0, Hc * y));
  const data = g.getImageData(0, 0, W, Hc).data;
  const step = 8.5;
  const out = Array.from({ length: R.cols }, () => []);
  for (let v = step / 2; v < Hc; v += step) {
    for (let u = step / 2; u < W; u += step) {
      if (data[(Math.floor(v) * W + Math.floor(u)) * 4 + 3] < 128) continue;
      const [px, py] = iso(R.x0 + (u / W) * (R.x1 - R.x0), T + 0.15, R.z1 - (v / Hc) * (R.z1 - R.z0));
      out[Math.min(R.cols - 1, Math.floor((u / W) * R.cols))].push(`M${(px - r).toFixed(2)} ${py.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`);
    }
  }
  return out.map((c) => c.join(""));
}

// ---- lidar mapping during the tour: plan-view ray against the hall's walls ----
function castWall(lx, ly, a) {
  const dx = Math.cos(a), dy = Math.sin(a);
  let best = Infinity;
  if (dy < -1e-6) best = Math.min(best, (FACE - ly) / dy);
  if (dx < -1e-6) best = Math.min(best, (T - lx) / dx);
  if (dx > 1e-6) best = Math.min(best, (L - T - lx) / dx);
  if (!Number.isFinite(best) || best > 90) return null;
  return [lx + dx * best, ly + dy * best];
}

// ---- camera: fit each station's key points into the free part of the viewport ----
function stationPoints(st) {
  const pts = [];
  const add = (x, y, z) => pts.push(iso(x, y, z));
  const rx = st.rx ?? st.x - 6;
  if (st.id === "intro") {
    add(NAME.x0 - 4, T, NAME.z1 + 2); add(NAME.x1 + 4, T, NAME.z1 + 2); add(NAME.x0 - 4, T, 0); add(rx + 8, RY + 6, 0);
    return pts;
  }
  let x0, x1, z1;
  if (st.box) [x0, x1, z1] = st.box;
  else {
    const xs = (st.screens ?? []).flatMap((s) => [s.x0, s.x1]);
    const zs = (st.screens ?? []).map((s) => s.z1);
    x0 = xs.length ? Math.min(...xs) - 2 : st.x - 27;
    x1 = xs.length ? Math.max(...xs) + 2 : st.x + 27;
    z1 = (zs.length ? Math.max(...zs) : 38.5) + 1.5;
  }
  add(x0, T, z1); add(x1, T, z1); add(x0, T, 0); add(x1, 20, 0); add(rx - 2, RY + 6, 0); add(rx + 8, RY + 6, 0);
  return pts;
}
function freeRect(id) {
  const vw = innerWidth, vh = innerHeight;
  const narrow = vw < 860;
  if (id === "intro") return narrow ? [12, 70, vw - 12, vh * 0.5] : [vw * 0.3, 70, vw - 40, vh - 70];
  if (narrow) return [10, 64, vw - 10, vh * 0.5];
  return [Math.min(470, vw * 0.36), 70, vw - 56, vh - 40];
}
function fit(st) {
  const pts = stationPoints(st);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const [fx0, fy0, fx1, fy1] = freeRect(st.id);
  const z = Math.min((fx1 - fx0) / (bx1 - bx0), (fy1 - fy0) / (by1 - by0)) * 0.94;
  return { fx: (bx0 + bx1) / 2, fy: (by0 + by1) / 2, cx: (fx0 + fx1) / 2, cy: (fy0 + fy1) / 2, z };
}
let FITS = [];
const clamp01 = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u);
const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const easeOut = (u) => 1 - (1 - clamp01(u)) ** 3;
function camAt(s) {
  const i = Math.max(0, Math.min(S.length - 1, Math.floor(s)));
  const j = Math.min(S.length - 1, i + 1);
  const u = s - i;
  const a = FITS[i], b = FITS[j];
  const lerp = (p, q) => p + (q - p) * u;
  return { fx: lerp(a.fx, b.fx), fy: lerp(a.fy, b.fy), cx: lerp(a.cx, b.cx), cy: lerp(a.cy, b.cy), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z))) };
}

// the PWM bench cycles through three duty cycles; the motor and the scope both follow it
let pwmDuty = 0.5;
const dutyAt = (t) => {
  const seq = [0.25, 0.5, 0.75], per = 2.6;
  const n = Math.floor(t / per), u = t / per - n;
  const a = seq[n % 3], b = seq[(n + 1) % 3];
  return a + (b - a) * smooth((u - 0.85) / 0.15);
};

// ---- page wiring ----
const $ = (q) => document.querySelector(q);
const params = new URLSearchParams(location.search);
// ?watch=ohms-law (the links in the one-page PDF): open the page at that film's stop and play it there
const WATCH = params.get("watch") ? `assets/full/${params.get("watch")}.mp4` : null;
const stopOf = (src) => S.findIndex((st) => st.screens?.some((sc) => sc.full === src));
const STEP = () => innerHeight * 1.1;
const robotXAt = (s) => {
  const i = Math.max(0, Math.min(S.length - 1, Math.floor(s)));
  const j = Math.min(S.length - 1, i + 1);
  const at = (n) => S[n].rx ?? S[n].x - 6;
  return at(i) + (at(j) - at(i)) * (s - i);
};
const PLAY_ICON = `<svg viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z" fill="currentColor"/></svg>`;
// only touch the DOM when a value actually changes
const setAttr = (el, name, v) => {
  if (el.getAttribute(name) !== v) el.setAttribute(name, v);
};
const setStyle = (el, name, v) => {
  if (el.style[name] !== v) el.style[name] = v;
};
const setText = (el, v) => {
  if (el.textContent !== v) el.textContent = v;
};
const toast = (msg) => {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toast.h);
  toast.h = setTimeout(() => el.classList.remove("on"), 1800);
};
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
    return ok;
  }
}

async function main() {
  // world bounds, so every layer shares one coordinate space inside #cam
  const corners = [[-2, -2, H + 2], [L + 2, -2, H + 2], [-2, D + 2, -3], [L + 2, D + 2, -3], [-2, D + 2, H], [L + 2, -2, -3]].map(([x, y, z]) => iso(x, y, z));
  const B = {
    x0: Math.min(...corners.map((c) => c[0])) - 40, y0: Math.min(...corners.map((c) => c[1])) - 40,
    x1: Math.max(...corners.map((c) => c[0])) + 40, y1: Math.max(...corners.map((c) => c[1])) + 40,
  };

  $("#worldG").innerHTML = buildWorld();
  $("#midG").innerHTML = `${buildLive()}<path id="dots" fill="#2aa34c"/><path id="dots2" fill="#2aa34c"/><g id="robot">${buildRobot()}</g><circle id="mark" r="1.4" fill="#2aa34c"/><line id="beam" stroke="#2aa34c" stroke-width="1.6" opacity="0"/><g id="talk"></g>${buildDock()}${buildHud()}`;
  const nameCols = await dotText([["DAKSH", 0.44], ["PANSURIYA", 0.95]], NAME, 128, 2.45);
  const talkCols = await dotText([["LET'S TALK", 0.8]], TALK, 190);
  $("#fxG").innerHTML = `<g id="nameDots" filter="url(#glow)">${nameCols.map((d) => `<path d="${d}" fill="#2aa34c" opacity="0"/>`).join("")}</g><path id="curtain" fill="#2aa34c" opacity="0"/><path id="scanline" stroke="#7dffa6" stroke-width="2.4" filter="url(#glow)" opacity="0"/>` +
    // the title under the name, revealed by the same scan
    wallGroup(NAME.x0, NAME.x1, 9.5, 15, 440, `<defs><clipPath id="ttlClip" clipPathUnits="userSpaceOnUse"><rect id="ttlRect" x="-10" y="-60" width="0" height="200"/></clipPath></defs>
      <text id="ttl" clip-path="url(#ttlClip)" x="2" y="22" font-family="${SANS}" font-weight="700" font-size="19" letter-spacing="3.2" fill="#2aa34c" filter="url(#glow)">FULL-STACK VIDEO EDITOR</text>`, T + 0.2);
  $("#talk").innerHTML = talkCols.map((d) => `<path d="${d}" fill="#1f7a3d" opacity="0"/>`).join("");
  const nameEls = [...document.querySelectorAll("#nameDots path")];
  const talkEls = [...document.querySelectorAll("#talk path")];
  const ids = ["cam", "dark", "hero", "hint", "robot", "mark", "beam", "dots", "dots2", "curtain", "scanline", "links", "ttl", "ttlRect",
    "hotGlow", "heat0", "heat1", "heat2", "ohmsLcd", "dlBeam", "dlHit", "dlMark", "wave", "dutyTx", "pwmLed", "prop", "propDisc", "steam0", "steam1", "renderBar", "renderTx", "vu", "jog",
    "trail0", "trail1", "trail2", "spillCut", "hud", "hPlane", "hBox", "hLaser", "hLaserW", "hDim", "hHit", "sparkle", "tagA", "chipB"];
  const els = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  els.nameG = $("#nameDots");
  // each desk's moving parts, keyed by the desk's x; they run only while the camera is near
  const liveGroups = Object.fromEntries([[1, 142], [2, 208], [3, 274], [5, 406], [8, 660]].map(([n, x]) => [n, { el: document.getElementById(`live${n}`), x, on: true }]));

  // screens
  const screens = [];
  for (const [si, st] of S.entries()) {
    for (const sc of st.screens ?? []) {
      const el = document.createElement("div");
      el.className = "scr";
      const vw = sc.a > 1 ? 960 : 540, vh = Math.round(vw / sc.a);
      el.style.width = vw + "px";
      el.style.height = vh + "px";
      el.innerHTML = `<video muted loop playsinline preload="none" poster="${sc.poster}"></video>`;
      el.addEventListener("click", () => openPlayer(sc.full));
      $("#screens").appendChild(el);
      screens.push({ st: si, sc, el, video: el.firstChild, m: faceMatrix(sc.x0, sc.x1, sc.z0, sc.z1, vw, vh), loaded: false, shown: false });
    }
  }

  // cards
  const cards = S.map((st) => {
    if (!st.card) return null;
    const c = st.card;
    const el = document.createElement("article");
    el.className = "card" + (st.dark ? " dark" : "") + (st.id === "contact" ? " cta" : "");
    let row = "";
    if (c.play !== undefined) row += `<button class="btn" data-play="${st.screens[c.play].full}">Watch ${PLAY_ICON}</button>`;
    if (c.insta) row += `<a class="btn ghost" href="${HRT_INSTA || "#"}" target="_blank" rel="noopener" data-insta>Instagram ↗</a>`;
    if (c.mail) row += `<a class="btn" href="mailto:${c.mail}?subject=SRCo%20Academy">${c.mail}</a><a class="btn ghost" href="${c.link}" target="_blank" rel="noopener">GitHub ↗</a>`;
    else if (c.link) row += `<a class="btn" href="${c.link}" target="_blank" rel="noopener">View on GitHub ↗</a>`;
    const minis = c.minis ? `<div class="mini">${c.minis.map(([t, m, n]) => `<button data-play="${st.screens[n].full}">${t}<span>${m}</span></button>`).join("")}</div>` : "";
    el.innerHTML = `<h2>${c.title}</h2><p>${c.p}</p>${minis}${row ? `<div class="row">${row}</div>` : ""}`;
    $("#cards").appendChild(el);
    return { el, o: -1 };
  });
  document.addEventListener("click", (e) => {
    // a film opened from a link waits for one click anywhere on the player, then plays from the start with sound
    if (!$("#playerGo").hidden && e.target.closest("#player") && !e.target.closest("[data-close], #playerIg")) {
      e.preventDefault();
      playWithSound();
      return;
    }
    const b = e.target.closest("[data-play]");
    if (b) openPlayer(b.dataset.play);
    const g = e.target.closest("[data-go]");
    if (g) {
      e.preventDefault();
      closeSheets();
      goTo(Number(g.dataset.go));
    }
    if (e.target.closest("[data-close]") || e.target.classList.contains("sheet")) closeSheets();
    const ig = e.target.closest("#insta, [data-insta]");
    if (ig && !HRT_INSTA) {
      e.preventDefault();
      toast("Instagram link coming soon");
    }
    const plq = e.target.closest(".plq");
    if (plq) copyPlate(plq);
    // a mouse click shouldn't leave a focus ring behind on a link that opened a new tab
    const a = e.target.closest("a[target=_blank]");
    if (a && e.detail > 0) a.blur();
  });
  // player keys, caught before the page or the button underneath can act on them
  addEventListener("keydown", (e) => {
    if (!$("#player").classList.contains("on") || e.metaKey || e.ctrlKey || e.altKey) return;
    const v = $("#player video"), key = e.key.toLowerCase();
    const seek = (by) => (v.currentTime = Math.min(Math.max(0, v.currentTime + by), Number.isFinite(v.duration) ? v.duration : Infinity));
    if (key === " " || key === "k") v.paused ? v.play().catch(() => {}) : v.pause();
    else if (key === "m") v.muted = !v.muted;
    else if (key === "f") document.fullscreenElement ? document.exitFullscreen() : v.requestFullscreen?.();
    else if (key === "arrowleft" || key === "j") seek(key === "j" ? -10 : -5);
    else if (key === "arrowright" || key === "l") seek(key === "l" ? 10 : 5);
    else if (key === "escape") closeSheets();
    else return;
    e.preventDefault();
    e.stopPropagation();
  }, true);
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheets();
    if (document.querySelector(".sheet.on") && [" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key) && !e.target.closest?.(".list")) e.preventDefault();
    if ((e.key === "Enter" || e.key === " ") && e.target.closest?.(".plq")) {
      e.preventDefault();
      copyPlate(e.target.closest(".plq"));
    }
  });
  const copyPlate = async (plq) => {
    const ok = await copyText(plq.dataset.copy);
    if (!ok) return toast("Couldn't copy, sorry");
    plq.classList.add("done");
    toast(plq.id === "plMail" ? "Email copied" : "GitHub link copied");
    clearTimeout(plq._t);
    plq._t = setTimeout(() => plq.classList.remove("done"), 1800);
  };

  // one gesture moves one station: a wheel notch, a trackpad swipe (however long its momentum runs),
  // a touch swipe or a page key all step to the next screen. Only a dragged scrollbar scrolls freely,
  // and it comes to rest on the nearest station.
  const sheetOpen = () => !!document.querySelector(".sheet.on");
  let heading = Math.round(scrollY / STEP()), headingT = -1e9, settleT = 0;
  const here = () => (performance.now() - headingT < 900 ? heading : Math.round(scrollY / STEP()));
  function goTo(n) {
    heading = Math.max(0, Math.min(S.length - 1, n));
    headingT = performance.now();
    scrollTo({ top: heading * STEP(), behavior: "smooth" });
  }
  const settle = () => {
    if (sheetOpen() || performance.now() - headingT < 900) return;
    const s = scrollY / STEP();
    if (Math.abs(s - Math.round(s)) > 0.003) goTo(Math.round(s));
  };
  let lastWheel = 0, lockUntil = 0, peak = 0, trough = 0;
  addEventListener("wheel", (e) => {
    if (sheetOpen()) {
      if (!e.target.closest?.(".list")) e.preventDefault();
      return;
    }
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    const now = performance.now(), mag = Math.abs(e.deltaY) * (e.deltaMode ? 30 : 1);
    // a new swipe: after a pause, or a fresh push once the last swipe's momentum has died well down
    let fresh = now - lastWheel > 220 || (now > lockUntil && trough < peak * 0.4 && mag > Math.max(24, trough * 2.5));
    lastWheel = now;
    if (fresh || mag > peak) peak = trough = mag;
    else trough = Math.min(trough, mag);
    if (!fresh || now < lockUntil || mag < 1) return;
    lockUntil = now + 650;
    goTo(here() + Math.sign(e.deltaY));
  }, { passive: false });
  let touchY = null, touchFrom = 0;
  addEventListener("touchstart", (e) => {
    touchY = e.touches.length === 1 && !sheetOpen() ? e.touches[0].clientY : null;
    touchFrom = here();
  }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (sheetOpen() ? !e.target.closest?.(".list") : touchY !== null && e.touches.length === 1) e.preventDefault();
  }, { passive: false });
  addEventListener("touchend", (e) => {
    if (touchY === null) return;
    const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY);
    touchY = null;
    if (Math.abs(dy) > 36) goTo(touchFrom + Math.sign(dy));
  }, { passive: true });
  addEventListener("keydown", (e) => {
    if (sheetOpen() || e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.("button, a, input, textarea, .plq")) return;
    const k = e.key;
    const step = k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey) ? 1 : k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey) ? -1 : 0;
    if (step || k === "Home" || k === "End") {
      e.preventDefault();
      if (!e.repeat || step) goTo(k === "Home" ? 0 : k === "End" ? S.length - 1 : here() + step);
    }
  });

  // header buttons name their stop; turn that into its place on the tour
  document.querySelectorAll("[data-st]").forEach((b) => (b.dataset.go = S.findIndex((st) => st.id === b.dataset.st)));

  // scrubber + index
  $("#scrub").innerHTML = S.map((st, i) => `<button data-go="${i}" data-l="${st.label}" aria-label="${st.label}"></button>`).join("");
  const scrubEls = [...document.querySelectorAll("#scrub button")];
  const groups = [];
  for (const st of S) if (st.group && !groups.includes(st.group)) groups.push(st.group);
  $("#index .list").innerHTML = groups
    .map((g) => {
      const items = S.filter((st) => st.group === g).flatMap((st) =>
        st.card.minis
          ? st.card.minis.map(([t, m, n]) => ({ t, m, play: st.screens[n].full }))
          : [{ t: st.card.title, m: "", play: st.card.play !== undefined ? st.screens[st.card.play].full : null, link: st.card.link }],
      );
      return `<div class="grp"><h3>${g}</h3>${items
        .filter((it) => it.play || it.link)
        .map((it) => `<div class="it"><div><b>${it.t}</b>${it.m ? `<span>${it.m}</span>` : ""}</div><div>${it.play ? `<button class="btn" data-play="${it.play}">Watch ${PLAY_ICON}</button>` : it.link ? `<a class="btn" href="${it.link}" target="_blank" rel="noopener">Open ↗</a>` : ""}</div></div>`)
        .join("")}</div>`;
    })
    .join("");
  $("#openIndex").addEventListener("click", () => $("#index").classList.add("on"));

  // layout: the world is rasterised once at the largest zoom any station uses, so the GPU only ever scales it down
  let SB = 1;
  const layout = () => {
    FITS = S.map(fit);
    SB = Math.min(2, Math.max(...FITS.map((f) => f.z)));
    const w = (B.x1 - B.x0) * SB, h = (B.y1 - B.y0) * SB;
    for (const svg of ["#world", "#mid", "#fx"].map($)) {
      svg.setAttribute("viewBox", `${B.x0} ${B.y0} ${B.x1 - B.x0} ${B.y1 - B.y0}`);
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      svg.style.left = B.x0 * SB + "px";
      svg.style.top = B.y0 * SB + "px";
    }
    const pad = 6000;
    Object.assign(els.dark.style, { left: (B.x0 - pad) * SB + "px", top: (B.y0 - pad) * SB + "px", width: w + 2 * pad * SB + "px", height: h + 2 * pad * SB + "px" });
    for (const s of screens) {
      const [a, b, c, d, e, f] = s.m;
      s.el.style.transform = `matrix(${a * SB},${b * SB},${c * SB},${d * SB},${e * SB},${f * SB})`;
    }
    $("#track").style.height = `${(S.length - 1) * STEP() + innerHeight}px`;
  };
  layout();
  addEventListener("resize", layout);
  if (WATCH && stopOf(WATCH) > 0) scrollTo({ top: stopOf(WATCH) * STEP(), behavior: "instant" });

  const forcedT = params.has("t") ? Number(params.get("t")) : null;
  // ?s=3.2 pins the camera to a station position without scrolling, ?act=1.5 pins the robot's routine there (for review screenshots)
  const forcedS = params.has("s") ? Number(params.get("s")) : null;
  const forcedAct = params.has("act") ? Number(params.get("act")) : null;
  const introT0 = performance.now();
  let introDone = forcedS !== null || scrollY > 30;
  addEventListener("scroll", () => {
    if (scrollY > 30) introDone = true;
    clearTimeout(settleT);
    settleT = setTimeout(settle, 180);
  }, { passive: true });

  // two critically damped springs follow the scroll: the robot's is a little quicker, so it leads and the camera follows
  const s0 = forcedS ?? scrollY / STEP();
  const camS = { s: s0, v: 0, w: 6 }, botS = { s: s0, v: 0, w: 7.5 };
  // stations are spread so the glide eases near each screen and is quickest between them, with no stop when passing several
  const glide = (s) => s - (0.5 / (2 * Math.PI)) * Math.sin(2 * Math.PI * s);
  let last = performance.now();
  const playerSheet = $("#player"), playerVideo = $("#player video");
  let phi = 0, lastPhi = 0;
  const hits = [];
  let introSettled = false;
  // the robot's routines, the wet trail it leaves, and the coffee it mops up
  let actStop = -1, actT0 = 0, actAlpha = 0, actShown = null;
  const trail = [];
  let trailX = null, spillAt = -Infinity, spillDone = -Infinity;
  let motor = 0.5, prop = 0;

  // a label in screen pixels, pinned to a world point: "up" sits above the point on a short lead, "center" sits on it
  const pill = (el, text, [px, py], s, mode, alpha) => {
    const tx = el.querySelector(".tx");
    if (tx.textContent !== text) {
      tx.textContent = text;
      const w = 30 + text.length * 7.2;
      const bg = el.querySelector(".bg");
      bg.setAttribute("width", w.toFixed(1));
      el.dataset.w = w;
    }
    const w = Number(el.dataset.w);
    const x0 = mode === "up" ? -14 : -w / 2, y0 = mode === "up" ? -38 : -13;
    setAttr(el.querySelector(".bg"), "x", x0.toFixed(1));
    setAttr(el.querySelector(".bg"), "y", String(y0));
    setAttr(el.querySelector(".dot"), "cx", (x0 + 14).toFixed(1));
    setAttr(el.querySelector(".dot"), "cy", String(y0 + 13));
    setAttr(tx, "x", (x0 + 24).toFixed(1));
    setAttr(tx, "y", String(y0 + 17));
    setAttr(el.querySelector(".lead"), "opacity", mode === "up" ? "1" : "0");
    setAttr(el, "transform", `translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(${s.toFixed(4)})`);
    setAttr(el, "opacity", alpha.toFixed(3));
  };
  const box8 = (b, g) => {
    const [x0, y0, z0, x1, y1, z1] = b;
    const c = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
    const X = [c[0] + (x0 - c[0]) * g, c[0] + (x1 - c[0]) * g], Y = [c[1] + (y0 - c[1]) * g, c[1] + (y1 - c[1]) * g], Z = [c[2] + (z0 - c[2]) * g, c[2] + (z1 - c[2]) * g];
    const lx = (X[1] - X[0]) * 0.26, ly = (Y[1] - Y[0]) * 0.26, lz = (Z[1] - Z[0]) * 0.26;
    let d = "";
    for (const i of [0, 1]) for (const j of [0, 1]) for (const q of [0, 1]) {
      const p = [X[i], Y[j], Z[q]];
      d += poly([[p[0] + (i ? -lx : lx), p[1], p[2]], p, [p[0], p[1] + (j ? -ly : ly), p[2]]]) + poly([p, [p[0], p[1], p[2] + (q ? -lz : lz)]]);
    }
    return { d, X, Y, Z };
  };

  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const target = forcedS ?? scrollY / STEP();
    for (const sp of [camS, botS]) {
      sp.v += (sp.w * sp.w * (target - sp.s) - 2 * sp.w * sp.v) * dt;
      sp.s += sp.v * dt;
    }
    const sCam = Math.min(S.length - 1, Math.max(0, glide(camS.s)));
    const sBot = Math.min(S.length - 1, Math.max(0, glide(botS.s)));
    const cam = camAt(sCam);
    const zr = cam.z / SB;
    els.cam.style.transform = `translate3d(${cam.cx.toFixed(2)}px,${cam.cy.toFixed(2)}px,0) scale(${zr.toFixed(5)}) translate3d(${(-cam.fx * SB).toFixed(2)}px,${(-cam.fy * SB).toFixed(2)}px,0)`;

    // intro: the lidar paints the name in the dark, then the lights come up
    const ti = forcedT ?? (introDone ? 99 : (now - introT0) / 1000);
    const lights = smooth((ti - 3.7) / 1.1);
    if (!introSettled) {
      const sweepX = NAME.x0 - 4 + (NAME.x1 - NAME.x0 + 8) * smooth((ti - 0.6) / 2.8);
      setStyle(els.dark, "opacity", (0.93 * (1 - lights)).toFixed(3));
      document.body.classList.toggle("night", lights < 0.5);
      setAttr(els.nameG, "filter", lights < 0.9 ? "url(#glow)" : "");
      nameEls.forEach((el, c) => {
        const cx = NAME.x0 + ((c + 0.5) / NAME.cols) * (NAME.x1 - NAME.x0);
        setAttr(el, "opacity", smooth((sweepX - cx) / 3).toFixed(3));
        setAttr(el, "fill", lights > 0.5 ? "#1f7a3d" : "#2aa34c");
      });
      setAttr(els.ttlRect, "width", Math.max(0, ((sweepX - NAME.x0) / (NAME.x1 - NAME.x0)) * 440 + 10).toFixed(1));
      setAttr(els.ttl, "fill", lights > 0.5 ? "#5f7f6a" : "#2aa34c");
      setAttr(els.ttl, "filter", lights < 0.9 ? "url(#glow)" : "");
      const a = smooth((ti - 0.5) / 0.3) * (1 - smooth((ti - 3.3) / 0.3));
      if (a > 0.001) {
        const O = iso(robotXAt(0) + LIDAR_AHEAD, RY, BEAM_Z), A = iso(sweepX, T + 0.2, NAME.z0 - 2), Bt = iso(sweepX, T + 0.2, NAME.z1 + 2);
        setAttr(els.curtain, "d", `M${O[0]} ${O[1]}L${A[0]} ${A[1]}L${Bt[0]} ${Bt[1]}Z`);
        setAttr(els.curtain, "opacity", (0.16 * a).toFixed(3));
        setAttr(els.scanline, "d", `M${A[0]} ${A[1]}L${Bt[0]} ${Bt[1]}`);
        setAttr(els.scanline, "opacity", (0.9 * a).toFixed(3));
      } else {
        setAttr(els.curtain, "opacity", "0");
        setAttr(els.scanline, "opacity", "0");
      }
      if (lights >= 1 && forcedT === null) introSettled = true;
    }
    setStyle(els.hero, "opacity", (smooth((ti - 2.1) / 0.8) * (1 - smooth((sCam - 0.08) / 0.3))).toFixed(3));
    setStyle(els.hint, "opacity", (smooth((ti - 4.2) / 0.6) * (1 - smooth(scrollY / 120))).toFixed(3));

    // the robot's routine at a stop: starts once it has settled, then again every so often
    const stop = Math.round(sBot);
    const still = forcedAct !== null || (Math.abs(sBot - stop) < 0.004 && Math.abs(target - camS.s) < 0.02 && Math.abs(camS.v) < 0.03 && (stop > 0 || ti > 5.4));
    if (still && actStop !== stop) {
      actStop = stop;
      actT0 = now;
    }
    if (!still) actStop = -1;
    const acts = S[stop].acts ?? [];
    let act = null, la = 0;
    if (still && acts.length) {
      const at = forcedAct ?? (now - actT0) / 1000 - 0.7;
      const PER = 11;
      const n = Math.max(0, Math.floor(at / PER));
      la = at - n * PER;
      act = acts[n % acts.length];
      if (at < 0 || la > 4.4) act = null;
    }
    if (act) actShown = { act, la, stop };
    actAlpha += ((act ? 1 : 0) - actAlpha) * (1 - Math.exp(-dt * (act ? 30 : 10)));
    const A = actAlpha > 0.01 ? actShown : null;
    const fadeOut = A ? 1 - smooth((A.la - 3.6) / 0.8) : 0;
    const wig = A?.act.wiggle ? Math.sin(A.la * Math.PI * 2 * 2.4) * 0.55 * (1 - smooth((A.la - 0.2) / 1.2)) * smooth(A.la / 0.15) : 0;

    // robot and its lidar
    const rx = robotXAt(sBot) + wig;
    const [tx, ty] = iso(rx, 0, 0);
    setAttr(els.robot, "transform", `translate(${tx.toFixed(2)} ${ty.toFixed(2)})`);
    const lx = rx + LIDAR_AHEAD;
    // on the charging dock the lidar spins down and the scan fades out
    const docked = 1 - smooth(Math.abs(rx - S[S.length - 1].rx) / 5);
    phi += dt * ((Math.PI * 2) / 1.3) * (1 - docked);
    const [mx, my] = iso(lx + (PUCK_R + 0.05) * Math.cos(phi), RY + (PUCK_R + 0.05) * Math.sin(phi), 11.6);
    setAttr(els.mark, "cx", mx.toFixed(1));
    setAttr(els.mark, "cy", my.toFixed(1));
    setAttr(els.mark, "opacity", Math.sin(phi) > -0.2 || Math.cos(phi) > 0 ? "1" : "0");
    const quiet = (1 - 0.75 * actAlpha) * (1 - docked); // the sweep steps back while the robot is busy, and stops on the dock
    if (ti > 3.6) {
      for (let a = lastPhi; a < phi; a += 0.05) {
        const h = castWall(lx, RY, a);
        if (h) hits.push({ x: h[0], y: h[1], t: now });
      }
      while (hits.length && now - hits[0].t > 1500) hits.shift();
      const fresh = [], old = [];
      for (const h of hits) {
        const [px, py] = iso(h.x, h.y, BEAM_Z);
        (now - h.t < 600 ? fresh : old).push(`M${(px - 1.6).toFixed(1)} ${py.toFixed(1)}a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0`);
      }
      setAttr(els.dots, "d", fresh.join(""));
      setAttr(els.dots2, "d", old.join(""));
      setAttr(els.dots, "opacity", (0.9 * lights * quiet).toFixed(2));
      setAttr(els.dots2, "opacity", (0.4 * lights * quiet).toFixed(2));
      const hNow = castWall(lx, RY, phi);
      if (hNow) {
        const O = iso(lx, RY, BEAM_Z), Hh = iso(hNow[0], hNow[1], BEAM_Z);
        setAttr(els.beam, "x1", O[0].toFixed(1));
        setAttr(els.beam, "y1", O[1].toFixed(1));
        setAttr(els.beam, "x2", Hh[0].toFixed(1));
        setAttr(els.beam, "y2", Hh[1].toFixed(1));
        setAttr(els.beam, "opacity", (0.55 * lights * quiet).toFixed(2));
      } else setAttr(els.beam, "opacity", "0");
    }
    lastPhi = phi;

    // the wet trail behind the mop: fresh strips darkest
    if (trailX === null) trailX = rx;
    if (Math.abs(rx - trailX) > 0.25) {
      trail.push({ a: Math.min(trailX, rx) - 6.6, b: Math.max(trailX, rx) - 6.6, t: now });
      trailX = rx;
    }
    while (trail.length && now - trail[0].t > 2600) trail.shift();
    const strips = [[], [], []];
    for (const sgm of trail) strips[Math.min(2, Math.floor((now - sgm.t) / 870))].push(poly([[sgm.a, RY - 4.4, 0.03], [sgm.b + 1, RY - 4.4, 0.03], [sgm.b + 1, RY + 4.4, 0.03], [sgm.a, RY + 4.4, 0.03]], true));
    strips.forEach((d, n) => {
      setAttr(els[`trail${n}`], "d", d.join(""));
      setAttr(els[`trail${n}`], "opacity", [0.09, 0.055, 0.025][n].toFixed(3));
    });

    // the coffee spill: whatever the robot drives over is gone for good (a page that opens past it starts clean, quietly)
    const cut = Math.max(spillAt, rx + 7.2);
    if (cut !== spillAt) {
      if (spillDone < 0 && cut > SPILL.x + 7 && spillAt !== -Infinity && spillAt <= SPILL.x + 7) spillDone = now;
      spillAt = cut;
      setAttr(els.spillCut, "d", poly([[cut, 30, 0], [SPILL.x + 12, 30, 0], [SPILL.x + 12, 50, 0], [cut, 50, 0]], true));
    }

    // the HUD: lasers, boxes, dimension lines, labels
    const ps = 1 / cam.z; // labels stay the same size on screen at any zoom
    let chipText = null, chipAlpha = 0;
    const sinceSpill = (now - spillDone) / 1000;
    if (sinceSpill >= 0 && sinceSpill < 2.6) {
      chipText = "Spill cleaned ✓";
      chipAlpha = smooth(sinceSpill / 0.2) * (1 - smooth((sinceSpill - 2.1) / 0.5));
      const sp = [[-3, -1.2, 1.4], [2.4, 0.6, 1], [0.2, 1.8, 0.8], [4, -1.6, 0.7]];
      let d = "";
      for (const [dx, dy, r0] of sp) {
        const [px, py] = iso(SPILL.x + dx, SPILL.y + dy, 0.6 + sinceSpill * 1.4);
        const r = r0 * 5 * (1 - smooth(sinceSpill / 1.4));
        if (r > 0.1) d += `M${px} ${py - r}Q${px} ${py} ${px + r} ${py}Q${px} ${py} ${px} ${py + r}Q${px} ${py} ${px - r} ${py}Q${px} ${py} ${px} ${py - r}Z`;
      }
      setAttr(els.sparkle, "d", d);
      setAttr(els.sparkle, "opacity", "0.9");
    } else setAttr(els.sparkle, "opacity", "0");
    setAttr(els.hud, "opacity", (A ? actAlpha * fadeOut : 0).toFixed(3));
    let tagShown = false;
    if (A) {
      const { act: a, la: l } = A;
      const O = [lx, RY, BEAM_Z];
      const laser = (to, alpha) => {
        const p = iso(...O), q = iso(...to);
        for (const el of [els.hLaser, els.hLaserW]) {
          setAttr(el, "x1", p[0].toFixed(1)); setAttr(el, "y1", p[1].toFixed(1));
          setAttr(el, "x2", q[0].toFixed(1)); setAttr(el, "y2", q[1].toFixed(1));
        }
        setAttr(els.hLaser, "opacity", alpha.toFixed(3));
        setAttr(els.hLaserW, "opacity", (alpha * 0.3).toFixed(3));
      };
      const hit = (at, since) => {
        const [px, py] = iso(...at);
        setAttr(els.hHit, "cx", px.toFixed(1)); setAttr(els.hHit, "cy", py.toFixed(1));
        setAttr(els.hHit, "r", (2 + 9 * easeOut(since / 0.6)).toFixed(1));
        setAttr(els.hHit, "opacity", since < 0 ? "0" : (1 - smooth(since / 0.6)).toFixed(3));
      };
      if (a.type === "scan") {
        const g = easeOut(l / 0.5);
        const bx = box8(a.box, Math.max(0.01, g));
        setAttr(els.hBox, "d", bx.d);
        const sweep = clamp01((l - 0.35) / 0.9), zs = bx.Z[0] + (bx.Z[1] - bx.Z[0]) * sweep;
        setAttr(els.hPlane, "d", poly([[bx.X[0], bx.Y[0], zs], [bx.X[1], bx.Y[0], zs], [bx.X[1], bx.Y[1], zs], [bx.X[0], bx.Y[1], zs]], true));
        setAttr(els.hPlane, "opacity", (0.22 * Math.sin(Math.PI * sweep)).toFixed(3));
        const c = [(a.box[0] + a.box[3]) / 2, (a.box[1] + a.box[4]) / 2, (a.box[2] + a.box[5]) / 2];
        laser(c, smooth(l / 0.15) * (1 - smooth((l - 1.2) / 0.4)) * (0.75 + 0.25 * Math.sin(t * 40)));
        hit(c, -1);
        setAttr(els.hDim, "d", "");
        pill(els.tagA, typeof a.tag === "function" ? a.tag() : a.tag, iso(bx.X[0], bx.Y[1], bx.Z[1]), ps, "up", smooth((l - 0.9) / 0.25) * actAlpha * fadeOut);
        tagShown = true;
      } else if (a.type === "wall" || a.type === "width") {
        setAttr(els.hBox, "d", "");
        setAttr(els.hPlane, "opacity", "0");
        let from, to, tickAxis;
        if (a.type === "wall") {
          // the beam itself is the measurement: it shoots out, then gets end ticks and a reading
          from = [lx, T + 0.05, 12]; to = O; tickAxis = 0;
          const p = easeOut(l / 0.45);
          laser([O[0] + (from[0] - O[0]) * p, O[1] + (from[1] - O[1]) * p, O[2] + (from[2] - O[2]) * p], smooth(l / 0.1) * (0.85 + 0.15 * Math.sin(t * 30)));
          hit(from, l - 0.45);
        } else {
          const sc = S[A.stop].screens[0];
          from = [sc.x0, FACE + 0.05, sc.z0 - 1.6]; to = [sc.x1, FACE + 0.05, sc.z0 - 1.6]; tickAxis = 2;
          const p = smooth((l - 0.25) / 1.1);
          const cur = [from[0] + (to[0] - from[0]) * p, from[1], from[2]];
          laser(cur, smooth(l / 0.15) * (1 - smooth((l - 1.4) / 0.4)));
          hit(cur, -1);
          to = cur;
        }
        // dimension: a tick at each end (and, for the screen, the run itself)
        const tick = (p) => {
          const q0 = [...p], q1 = [...p];
          q0[tickAxis] -= 1.1; q1[tickAxis] += 1.1;
          return poly([q0, q1]);
        };
        if (a.type === "wall") setAttr(els.hDim, "d", l > 0.45 ? tick(from) + tick(to) : "");
        else setAttr(els.hDim, "d", poly([from, to]) + tick(from) + (l > 1.35 ? tick(to) : ""));
        const mid = a.type === "wall" ? [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2] : [(from[0] + S[A.stop].screens[0].x1) / 2, from[1], from[2]];
        const show = a.type === "wall" ? smooth((l - 1.0) / 0.25) : smooth((l - 1.3) / 0.25);
        pill(els.tagA, a.tag, iso(...mid), ps, "center", show * actAlpha * fadeOut);
        tagShown = true;
      } else {
        setAttr(els.hBox, "d", "");
        setAttr(els.hPlane, "opacity", "0");
        setAttr(els.hDim, "d", "");
        setAttr(els.hLaser, "opacity", "0");
        setAttr(els.hLaserW, "opacity", "0");
        setAttr(els.hHit, "opacity", "0");
        chipText = a.type === "charge" ? (l < 2.6 ? `Charging ${84 + Math.floor(16 * clamp01((l - 0.3) / 2.2))}%` : "Fully charged ✓") : a.text;
        chipAlpha = smooth(l / 0.25) * fadeOut * actAlpha;
      }
    }
    if (!tagShown) setAttr(els.tagA, "opacity", "0");
    if (chipText) pill(els.chipB, chipText, iso(rx, RY - 2, 17.5), ps, "center", chipAlpha);
    else setAttr(els.chipB, "opacity", "0");

    // the closing mural and the painted links, swept on as the robot reaches the dock
    const end = smooth((sCam - (S.length - 1.5)) / 0.45);
    const sweep2 = TALK.x0 - 4 + (TALK.x1 - TALK.x0 + 8) * end;
    talkEls.forEach((el, c) => setAttr(el, "opacity", smooth((sweep2 - (TALK.x0 + ((c + 0.5) / TALK.cols) * (TALK.x1 - TALK.x0))) / 3).toFixed(3)));
    const linkO = smooth((end - 0.7) / 0.3);
    setAttr(els.links, "opacity", linkO.toFixed(3));
    setAttr(els.links, "pointer-events", linkO > 0.5 ? "auto" : "none");

    // the desks' moving parts, only near the camera
    const camX = (() => {
      const i = Math.min(S.length - 1, Math.floor(sCam)), j = Math.min(S.length - 1, i + 1);
      return S[i].x + (S[j].x - S[i].x) * (sCam - i);
    })();
    for (const lg of Object.values(liveGroups)) {
      const on = Math.abs(camX - lg.x) < 110;
      if (on !== lg.on) {
        lg.on = on;
        lg.el.style.display = on ? "" : "none";
      }
    }
    if (liveGroups[1].on) {
      const [gx, gy] = iso(141, 15.8, 7.3);
      setAttr(els.hotGlow, "cx", gx.toFixed(1)); setAttr(els.hotGlow, "cy", gy.toFixed(1));
      setAttr(els.hotGlow, "opacity", (0.6 + 0.3 * Math.sin(t * 2.6)).toFixed(3));
      for (let q = 0; q < 3; q++) {
        const ph = (t * 0.45 + q / 3) % 1, pts = [];
        for (let u = 0; u <= 1.001; u += 0.1) pts.push([140.1 + q * 0.9 + 0.32 * Math.sin(u * 7 - t * 4 + q * 2), 15.8, 8.6 + ph * 1.6 + u * 2.6]);
        setAttr(els[`heat${q}`], "d", poly(pts));
        setAttr(els[`heat${q}`], "opacity", (0.75 * Math.sin(Math.PI * ph)).toFixed(3));
      }
      const flick = [2.0, 2.01, 1.99, 2.0, 2.02, 2.0][Math.floor(t * 2.2) % 6];
      setText(els.ohmsLcd, flick.toFixed(2));
    }
    if (liveGroups[2].on) {
      const zw = 10.75, ang = t * ((Math.PI * 2) / 0.7);
      const [ax, ay] = iso(200 + 2.2 * Math.cos(ang), 15.5 + 2.2 * Math.sin(ang), zw);
      setAttr(els.dlMark, "cx", ax.toFixed(1)); setAttr(els.dlMark, "cy", ay.toFixed(1));
      setAttr(els.dlMark, "opacity", Math.sin(ang) > -0.2 || Math.cos(ang) > 0 ? "1" : "0");
      const p0 = iso(200, 13.3, zw), p1 = iso(200, 9.55, zw);
      setAttr(els.dlBeam, "x1", p0[0].toFixed(1)); setAttr(els.dlBeam, "y1", p0[1].toFixed(1));
      setAttr(els.dlBeam, "x2", p1[0].toFixed(1)); setAttr(els.dlBeam, "y2", p1[1].toFixed(1));
      setAttr(els.dlBeam, "stroke-dashoffset", (-t * 24).toFixed(1));
      setAttr(els.dlHit, "cx", p1[0].toFixed(1)); setAttr(els.dlHit, "cy", p1[1].toFixed(1));
      setAttr(els.dlHit, "r", (1.6 + 1.2 * Math.abs(Math.sin(t * 6))).toFixed(2));
    }
    pwmDuty = dutyAt(t);
    if (liveGroups[3].on) {
      let d = "M14 96";
      for (let p = 0; p < 4; p++) {
        const xh = 14 + p * 41 + 4, xl = xh + pwmDuty * 41;
        d += `L${xh} 96L${xh} 40L${xl.toFixed(1)} 40L${xl.toFixed(1)} 96`;
      }
      setAttr(els.wave, "d", d + "L176 96");
      setText(els.dutyTx, `duty ${Math.round(pwmDuty * 100)}%`);
      motor += (pwmDuty - motor) * (1 - Math.exp(-dt * 2.5));
      prop += dt * motor * 30;
      const cx = 287, cy = 12.4, pz = 11.45, R = 3.3;
      let pd = "";
      for (const off of [0, Math.PI]) {
        const a0 = prop + off, c = Math.cos(a0), s = Math.sin(a0);
        const prof = [[0.4, 0.22], [1.3, 0.62], [2.5, 0.52], [R, 0.16]];
        const side = prof.map(([r, w]) => [cx + c * r - s * w, cy + s * r + c * w, pz]);
        const back = prof.slice().reverse().map(([r, w]) => [cx + c * r + s * w * 0.55, cy + s * r - c * w * 0.55, pz]);
        pd += poly([...side, ...back], true);
      }
      setAttr(els.prop, "d", pd);
      const [dcx, dcy] = iso(cx, cy, pz);
      setAttr(els.propDisc, "cx", dcx.toFixed(1)); setAttr(els.propDisc, "cy", dcy.toFixed(1));
      setAttr(els.propDisc, "rx", (R * 10.12).toFixed(1)); setAttr(els.propDisc, "ry", (R * 10.12 * 0.5).toFixed(1));
      setAttr(els.propDisc, "opacity", (0.14 * motor).toFixed(3));
      const [lx2, ly2] = iso(272.8, 17.6, 6.88);
      setAttr(els.pwmLed, "cx", lx2.toFixed(1)); setAttr(els.pwmLed, "cy", ly2.toFixed(1));
      setAttr(els.pwmLed, "opacity", (t * 2.2) % 1 < pwmDuty ? "1" : "0.12");
    }
    if (liveGroups[5].on) {
      for (let q = 0; q < 2; q++) {
        const ph = (t * 0.35 + q / 2) % 1, pts = [];
        for (let u = 0; u <= 1.001; u += 0.1) pts.push([418.1 + q * 0.8 + 0.35 * Math.sin(u * 6 - t * 2.5 + q * 3), 11.4, 9.1 + ph * 1.4 + u * 3]);
        setAttr(els[`steam${q}`], "d", poly(pts));
        setAttr(els[`steam${q}`], "opacity", (0.8 * Math.sin(Math.PI * ph)).toFixed(3));
      }
      const rp = clamp01((t % 7) / 6);
      setAttr(els.renderBar, "width", (216 * rp).toFixed(1));
      setText(els.renderTx, rp < 1 ? `${Math.floor(rp * 100)}%` : "done ✓");
    }
    if (liveGroups[8].on) {
      let d = "";
      for (let ch = 0; ch < 8; ch++) {
        const lvl = 0.25 + 0.6 * Math.abs(Math.sin(t * (2.1 + ch * 0.37) + ch * 1.3)) * (0.7 + 0.3 * Math.sin(t * 5.3 + ch));
        const h = 50 * lvl, x = 22 + ch * 40 + 11;
        d += `M${x} 80h5v${(-h).toFixed(1)}h-5z`;
      }
      setAttr(els.vu, "d", d);
      const ja = t * 0.9;
      const [jx, jy] = iso(665.8 + 1.25 * Math.cos(ja), 15.7 + 1.25 * Math.sin(ja), 7.26);
      setAttr(els.jog, "cx", jx.toFixed(1)); setAttr(els.jog, "cy", jy.toFixed(1));
    }

    // nothing with sound plays unless the player is open
    if (!playerSheet.classList.contains("on") && !playerVideo.paused) playerVideo.pause();

    // screens: load a little ahead, show the near ones, play only those in view
    for (const s of screens) {
      const d = Math.abs(sCam - s.st);
      if (d < 2.4 && !s.loaded) {
        s.video.src = s.sc.loop;
        s.loaded = true;
      }
      const show = d < 1.6;
      if (show !== s.shown) {
        s.shown = show;
        s.el.style.display = show ? "block" : "none";
      }
      if (!show) continue;
      if (d < 0.8 && lights > 0.3) {
        if (s.video.paused) s.video.play().catch(() => {});
      } else if (!s.video.paused) s.video.pause();
    }

    // cards and scrubber
    const narrow = innerWidth < 860;
    cards.forEach((c, n) => {
      if (!c) return;
      const o = Math.round((1 - smooth((Math.abs(sCam - n) - 0.06) / 0.24)) * 1000) / 1000;
      if (o === c.o) return;
      c.o = o;
      c.el.style.opacity = o;
      c.el.style.visibility = o < 0.01 ? "hidden" : "visible";
      c.el.classList.toggle("on", o > 0.5);
      c.el.style.transform = narrow ? `translateY(${((1 - o) * 18).toFixed(1)}px)` : `translateY(calc(-50% + ${((1 - o) * 18).toFixed(1)}px))`;
    });
    const cur = Math.round(sCam);
    scrubEls.forEach((b, n) => b.classList.toggle("on", n === cur));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

let backToIndex = false;
const openPlayer = (src, fromLink = false) => {
  const v = $("#player video");
  // opened from the index: hide the index while the film plays, and bring it back after
  backToIndex = $("#index").classList.contains("on");
  $("#index").classList.remove("on");
  // the Watch button keeps focus otherwise, and Space would press it again instead of pausing
  document.activeElement?.blur?.();
  v.src = src;
  v.poster = src.replace(/\.mp4$/, ".jpg");
  v.muted = false;
  $("#playerGo").hidden = true;
  // films that also live on Instagram get a button to open the original post
  const ig = $("#playerIg");
  ig.hidden = !INSTA_FOR[src];
  ig.href = HRT_INSTA || "#";
  $("#player").classList.add("on");
  v.focus({ preventScroll: true });
  // a film opened from a link always waits for a click: browsers block sound before one, and a tab opened in the background must stay silent
  if (fromLink) $("#playerGo").hidden = false;
  else v.play().catch(() => {});
};
const playWithSound = () => {
  const v = $("#player video");
  $("#playerGo").hidden = true;
  v.muted = false;
  v.currentTime = 0;
  v.play().catch(() => {});
};
const closeSheets = () => {
  const fromPlayer = $("#player").classList.contains("on");
  document.querySelectorAll(".sheet.on").forEach((s) => s.classList.remove("on"));
  // unload the film entirely: a hidden player that keeps focus would otherwise wake up on Space or a media key
  const v = $("#player video");
  v.pause();
  v.blur();
  if (fromPlayer) {
    v.removeAttribute("src");
    v.removeAttribute("poster");
    v.load();
  }
  if (fromPlayer && backToIndex) $("#index").classList.add("on");
  backToIndex = false;
  $("#playerGo").hidden = true;
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
  if (fromPlayer && WATCH) history.replaceState(null, "", location.pathname);
};
// sound only ever comes from the open player in a visible tab: a media key, reconnecting headphones or a background tab can't start it
$("#player video").addEventListener("play", (e) => {
  if (!$("#player").classList.contains("on") || document.hidden) e.target.pause();
  else $("#playerGo").hidden = true;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) $("#player video").pause();
});

main();
if (WATCH && stopOf(WATCH) >= 0) openPlayer(WATCH, true);
