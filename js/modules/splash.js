/* ══════════════════════════════════════
   SPLASH
══════════════════════════════════════ */
.splash {
  position:fixed; inset:0; z-index:999;
  background:#08081a; overflow:hidden;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:20px;
}
.splash__bg {
  position:absolute; inset:-40%;
  background:
    radial-gradient(circle at 25% 45%, rgba(124,58,237,.25) 0%, transparent 55%),
    radial-gradient(circle at 75% 25%, rgba(236,72,153,.16) 0%, transparent 45%),
    radial-gradient(circle at 55% 80%, rgba(167,139,250,.14) 0%, transparent 45%);
  animation: bgDrift 9s ease-in-out infinite alternate;
}
.splash__particles { position:absolute; inset:0; pointer-events:none; }
.splash__particle {
  position:absolute; border-radius:50%;
  background:rgba(167,139,250,.4);
  animation: floatUp linear infinite;
}
.splash__orb-wrap { position:relative; display:flex; align-items:center; justify-content:center; }
.splash__ring {
  position:absolute; border-radius:50%;
  border:1.5px solid rgba(167,139,250,.3);
  animation:ringOut 2.4s ease-out infinite;
}
.splash__ring:nth-child(1){ width:80px; height:80px; animation-delay:0s; }
.splash__ring:nth-child(2){ width:80px; height:80px; animation-delay:.7s; }
.splash__ring:nth-child(3){ width:80px; height:80px; animation-delay:1.4s; }
.splash__orb {
  width:76px; height:76px; border-radius:50%;
  background:radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed, #4c1d95);
  box-shadow:0 0 40px rgba(124,58,237,.7), 0 0 80px rgba(124,58,237,.25);
  animation:orbBreath 3s ease-in-out infinite;
  display:flex; align-items:center; justify-content:center;
  font-size:30px; color:white; position:relative; z-index:1;
}
.splash__word {
  font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif;
  font-size:44px; font-weight:800; letter-spacing:-1.5px;
  background:linear-gradient(135deg,#c4b5fd,#7c3aed,#ec4899);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  animation:wordPop .7s cubic-bezier(.34,1.56,.64,1) .3s both;
}
.splash__tag {
  font-size:12px; letter-spacing:4px; text-transform:uppercase;
  color:rgba(167,139,250,.65);
  animation:wordPop .7s cubic-bezier(.34,1.56,.64,1) .55s both;
}
.splash__bar-wrap {
  width:120px; height:2px; background:rgba(167,139,250,.15);
  border-radius:99px; overflow:hidden;
  animation:fadeIn .4s ease .9s both;
}
.splash__bar {
  height:100%; width:0; border-radius:99px;
  background:linear-gradient(90deg,#7c3aed,#ec4899);
  animation:barFill 1.5s cubic-bezier(.4,0,.2,1) 1s forwards;
}

@keyframes bgDrift { 0%{transform:rotate(0) scale(1)} 100%{transform:rotate(14deg) scale(1.1)} }
@keyframes ringOut { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(3.2);opacity:0} }
@keyframes orbBreath { 0%,100%{box-shadow:0 0 40px rgba(124,58,237,.6),0 0 80px rgba(124,58,237,.2)} 50%{box-shadow:0 0 60px rgba(124,58,237,.9),0 0 120px rgba(124,58,237,.35)} }
@keyframes wordPop { from{opacity:0;transform:translateY(16px) scale(.93)} to{opacity:1;transform:none} }
@keyframes barFill { 0%{width:0} 55%{width:72%} 100%{width:100%} }
@keyframes floatUp { 0%{transform:translateY(0) scale(1);opacity:.6} 100%{transform:translateY(-100vh) scale(.3);opacity:0} }
