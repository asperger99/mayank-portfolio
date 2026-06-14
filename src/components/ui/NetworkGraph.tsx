import { useEffect, useRef } from "react";

type NodeShape = "gateway" | "service" | "db" | "cache" | "queue" | "lambda" | "lb";

interface DSNode {
  x: number; y: number;
  vx: number; vy: number;
  shape: NodeShape;
  label: string;
  pulse: number;
}

interface Packet {
  edgeIdx: number;
  t: number;
  speed: number;
  forward: boolean;
}

interface Pal {
  p1: [number,number,number]; // primary stroke (sky-400 dark / sky-600 light)
  p2: [number,number,number]; // secondary        (sky-300 dark / sky-700 light)
  p3: [number,number,number]; // dim              (sky-200 dark / sky-800 light)
  fill: [number,number,number];
  edge: [number,number,number];
  label: [number,number,number];
  packet: [number,number,number];
  halo: [number,number,number];
  haloMult: number;
  fillMult: number;
  edgeAlphaMax: number;
}

const DARK: Pal = {
  p1:         [56,  189, 248],
  p2:         [125, 211, 252],
  p3:         [186, 230, 253],
  fill:       [14,  165, 233],
  edge:       [14,  165, 233],
  label:      [125, 211, 252],
  packet:     [186, 230, 253],
  halo:       [14,  165, 233],
  haloMult:   1.0,
  fillMult:   1.0,
  edgeAlphaMax: 0.45,
};

const LIGHT: Pal = {
  p1:         [2,   132, 199],   // sky-600
  p2:         [3,   105, 161],   // sky-700
  p3:         [7,    89, 133],   // sky-800
  fill:       [14,  165, 233],   // sky-500 (used at low opacity)
  edge:       [2,   132, 199],   // sky-600
  label:      [3,   105, 161],   // sky-700
  packet:     [2,   132, 199],   // sky-600
  halo:       [14,  165, 233],
  haloMult:   0.35,
  fillMult:   1.8,
  edgeAlphaMax: 0.6,
};

const rc = ([r,g,b]: [number,number,number], a: number) =>
  `rgba(${r},${g},${b},${a})`;

// ── real distributed-systems topology ──────────────────────────────────────
const DEFINITIONS: { shape: NodeShape; label: string }[] = [
  { shape: "gateway", label: "API Gateway"   },
  { shape: "lb",      label: "Load Balancer" },
  { shape: "service", label: "Rate Limiter"  },
  { shape: "queue",   label: "Kafka"         },
  { shape: "queue",   label: "RabbitMQ"      },
  { shape: "cache",   label: "Redis"         },
  { shape: "db",      label: "PostgreSQL"    },
  { shape: "db",      label: "DynamoDB"      },
  { shape: "db",      label: "Keyspaces"     },
  { shape: "lambda",  label: "Lambda"        },
  { shape: "service", label: "Event Bus"     },
];

const EDGE_LABELS: [string, string][] = [
  ["API Gateway",   "Load Balancer" ],
  ["API Gateway",   "Rate Limiter"  ],
  ["API Gateway",   "Redis"         ],
  ["Load Balancer", "Rate Limiter"  ],
  ["Rate Limiter",  "Redis"         ],
  ["Rate Limiter",  "Keyspaces"     ],
  ["Event Bus",     "Kafka"         ],
  ["Event Bus",     "RabbitMQ"      ],
  ["Kafka",         "Lambda"        ],
  ["RabbitMQ",      "Lambda"        ],
  ["Lambda",        "DynamoDB"      ],
  ["Lambda",        "PostgreSQL"    ],
  ["Lambda",        "Redis"         ],
  ["Lambda",        "Keyspaces"     ],
  ["Lambda",        "Event Bus"     ],
];

// ── shape renderers ──────────────────────────────────────────────────────────
function drawGateway(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, p: Pal) {
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.75, y);
  ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.75, y);
  ctx.closePath();
  ctx.strokeStyle = rc(p.p1, a); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle   = rc(p.fill, a * 0.15 * p.fillMult); ctx.fill();
}

function drawLB(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, p: Pal) {
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s * 0.7); ctx.lineTo(x - s, y + s * 0.7);
  ctx.closePath();
  ctx.strokeStyle = rc(p.p2, a); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle   = rc(p.p2, a * 0.12 * p.fillMult); ctx.fill();
  [-s * 0.55, 0, s * 0.55].forEach(dx => {
    ctx.beginPath(); ctx.arc(x + dx, y + s * 0.72, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = rc(p.p2, a); ctx.fill();
  });
}

function drawService(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, p: Pal) {
  const w = s * 1.4, h = s * 1.0;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
  ctx.strokeStyle = rc(p.p1, a); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle   = rc(p.fill, a * 0.12 * p.fillMult); ctx.fill();
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x - w * 0.35, y + i * h * 0.22);
    ctx.lineTo(x + w * (i === 0 ? 0.20 : 0.35), y + i * h * 0.22);
    ctx.strokeStyle = rc(p.p2, a * 0.5); ctx.lineWidth = 1; ctx.stroke();
  }
}

function drawDB(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, p: Pal) {
  const rx = s * 0.75, ry = s * 0.22, h = s * 1.1;
  ctx.fillStyle = rc(p.fill, a * 0.12 * p.fillMult);
  ctx.beginPath(); ctx.ellipse(x, y + h / 2, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.rect(x - rx, y - h / 2, rx * 2, h); ctx.fill();
  ctx.strokeStyle = rc(p.p1, a); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(x, y - h / 2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y + h / 2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - rx, y - h / 2); ctx.lineTo(x - rx, y + h / 2);
  ctx.moveTo(x + rx, y - h / 2); ctx.lineTo(x + rx, y + h / 2);
  ctx.stroke();
}

function drawCache(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, p: Pal) {
  ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2);
  ctx.strokeStyle = rc(p.p3, a); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle   = rc(p.fill, a * 0.10 * p.fillMult); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.15, y - s * 0.55); ctx.lineTo(x - s * 0.18, y + s * 0.05);
  ctx.lineTo(x + s * 0.05, y + s * 0.05); ctx.lineTo(x - s * 0.15, y + s * 0.55);
  ctx.lineTo(x + s * 0.18, y - s * 0.05); ctx.lineTo(x - s * 0.05, y - s * 0.05);
  ctx.closePath(); ctx.fillStyle = rc(p.p3, a); ctx.fill();
}

function drawQueue(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, p: Pal) {
  const w = s * 1.5, h = s * 1.0, lh = h / 4.5;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 3);
  ctx.strokeStyle = rc(p.p1, a); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle   = rc(p.fill, a * 0.10 * p.fillMult); ctx.fill();
  for (let i = -1; i <= 1; i++) {
    const ly = y + i * lh * 1.05;
    ctx.beginPath(); ctx.roundRect(x - w * 0.38, ly - lh * 0.38, w * 0.76, lh * 0.76, 2);
    ctx.fillStyle = rc(p.p1, a * 0.25); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.32, ly); ctx.lineTo(x + w * 0.22, ly - lh * 0.28); ctx.lineTo(x + w * 0.22, ly + lh * 0.28);
    ctx.closePath(); ctx.fillStyle = rc(p.p2, a * 0.60); ctx.fill();
  }
}

function drawLambda(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, p: Pal) {
  ctx.strokeStyle = rc(p.p1, a); ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + s * Math.cos(ang), py = y + s * Math.sin(ang);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.stroke();
  ctx.fillStyle = rc(p.fill, a * 0.12 * p.fillMult); ctx.fill();
  ctx.font = `bold ${Math.round(s * 1.0)}px monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = rc(p.p1, a); ctx.fillText("λ", x, y + 1);
}

const DRAWERS: Record<NodeShape, (c: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, p: Pal) => void> = {
  gateway: drawGateway, lb: drawLB, service: drawService,
  db: drawDB, cache: drawCache, queue: drawQueue, lambda: drawLambda,
};

// ── component ────────────────────────────────────────────────────────────────
const MIN_DIST   = 92;
const REPEL_DIST = 118;
const NODE_S     = 13;

export function NetworkGraph({ size = 360 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const mouseRef  = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = size, H = size;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const MARGIN = 58;
    const cols = 4, rows = 3;
    const cellW = (W - MARGIN * 2) / cols;
    const cellH = (H - MARGIN * 2) / rows;

    const slots = Array.from({ length: cols * rows }, (_, k) => ({
      cx: MARGIN + (k % cols + 0.5) * cellW,
      cy: MARGIN + (Math.floor(k / cols) + 0.5) * cellH,
    }));
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    const nodes: DSNode[] = DEFINITIONS.map((def, i) => ({
      ...def,
      x: slots[i].cx + (Math.random() - 0.5) * cellW * 0.35,
      y: slots[i].cy + (Math.random() - 0.5) * cellH * 0.35,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      pulse: Math.random() * Math.PI * 2,
    }));

    const edges: [number, number][] = EDGE_LABELS.map(([la, lb]) => [
      nodes.findIndex(n => n.label === la),
      nodes.findIndex(n => n.label === lb),
    ]).filter(([a, b]) => a >= 0 && b >= 0);

    const packets: Packet[] = [];
    const spawnPacket = () => {
      if (edges.length === 0) return;
      packets.push({
        edgeIdx: Math.floor(Math.random() * edges.length),
        t: 0,
        speed: 0.006 + Math.random() * 0.010,
        forward: Math.random() < 0.5,
      });
    };

    let t = 0;
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      // Pick palette based on current theme
      const isDark = document.documentElement.classList.contains("dark");
      const pal = isDark ? DARK : LIGHT;

      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // Physics
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const d = Math.hypot(dx, dy) || 0.01;
          if (d < REPEL_DIST) {
            const force = ((REPEL_DIST - d) / REPEL_DIST) * 0.55;
            const nx = dx / d, ny = dy / d;
            nodes[i].vx -= nx * force; nodes[i].vy -= ny * force;
            nodes[j].vx += nx * force; nodes[j].vy += ny * force;
            if (d < MIN_DIST) {
              const push = (MIN_DIST - d) / 2;
              nodes[i].x -= nx * push; nodes[i].y -= ny * push;
              nodes[j].x += nx * push; nodes[j].y += ny * push;
            }
          }
        }
      }

      for (const n of nodes) {
        const cdx = n.x - mx, cdy = n.y - my, cd = Math.hypot(cdx, cdy);
        if (cd < 85 && cd > 0.1) { const f = (85 - cd) / 85 * 0.6; n.vx += (cdx / cd) * f; n.vy += (cdy / cd) * f; }
        n.vx *= 0.92; n.vy *= 0.92;
        const spd = Math.hypot(n.vx, n.vy);
        if (spd > 0.55) { n.vx = n.vx / spd * 0.55; n.vy = n.vy / spd * 0.55; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < MARGIN) { n.x = MARGIN; n.vx = Math.abs(n.vx); }
        if (n.x > W - MARGIN) { n.x = W - MARGIN; n.vx = -Math.abs(n.vx); }
        if (n.y < MARGIN) { n.y = MARGIN; n.vy = Math.abs(n.vy); }
        if (n.y > H - MARGIN) { n.y = H - MARGIN; n.vy = -Math.abs(n.vy); }
      }

      // Edges
      for (const [ai, bi] of edges) {
        const A = nodes[ai], B = nodes[bi];
        const d = Math.hypot(A.x - B.x, A.y - B.y);
        const alpha = Math.max(0, Math.min(pal.edgeAlphaMax, 1 - d / (W * 0.85)));
        if (alpha < 0.02) continue;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = rc(pal.edge, alpha);
        ctx.lineWidth = 0.9; ctx.stroke();
      }

      // Packets
      if (packets.length < 10 && Math.random() < 0.06) spawnPacket();
      for (let i = packets.length - 1; i >= 0; i--) {
        const pk = packets[i];
        pk.t += pk.speed;
        if (pk.t >= 1) { packets.splice(i, 1); continue; }
        const [ai, bi] = edges[pk.edgeIdx];
        const A = nodes[ai], B = nodes[bi];
        const prog = pk.forward ? pk.t : 1 - pk.t;
        const px = A.x + (B.x - A.x) * prog;
        const py = A.y + (B.y - A.y) * prog;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 5);
        g.addColorStop(0, rc(pal.packet, 0.95));
        g.addColorStop(1, rc(pal.packet, 0));
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }

      // Nodes
      for (const n of nodes) {
        const glow = 0.5 + 0.5 * Math.sin(t * 1.4 + n.pulse);
        const s = NODE_S * (1 + glow * 0.07);
        const alpha = 0.72 + glow * 0.22;
        // halo
        const gh = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, s * 3.5);
        gh.addColorStop(0, rc(pal.halo, 0.18 * glow * pal.haloMult));
        gh.addColorStop(1, rc(pal.halo, 0));
        ctx.beginPath(); ctx.arc(n.x, n.y, s * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gh; ctx.fill();
        // shape
        DRAWERS[n.shape](ctx, n.x, n.y, s, alpha, pal);
        // label
        ctx.font = `500 9px -apple-system, "Inter", sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = rc(pal.label, alpha * 0.85);
        ctx.fillText(n.label, n.x, n.y + s + 6);
      }

      rafRef.current = requestAnimationFrame(frame);
    };
    frame();

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="rounded-2xl"
    />
  );
}
