"use client";

import { useEffect, useState } from "react";

export default function IntroAnimation() {
const [visible, setVisible] = useState(true);
const [exiting, setExiting] = useState(false);

useEffect(() => {
const exitTimer = window.setTimeout(() => {
setExiting(true);
}, 3200);


const removeTimer = window.setTimeout(() => {
  setVisible(false);
}, 3900);

return () => {
  window.clearTimeout(exitTimer);
  window.clearTimeout(removeTimer);
};


}, []);

if (!visible) return null;

return (
<div
className={`engraph-intro ${exiting ? "intro-exit" : ""}`}
role="status"
aria-label="ENGRAPH"
> <div className="intro-grid" />

```
  <div className="intro-content">
    <div className="logo-stage">
      <div className="logo-ring ring-one" />
      <div className="logo-ring ring-two" />

      <div className="logo-cross cross-horizontal" />
      <div className="logo-cross cross-vertical" />

      <div className="es-logo">
        <span className="logo-e">E</span>
        <span className="logo-dot">.</span>
        <span className="logo-s">S</span>
      </div>

      <div className="logo-scanner" />
    </div>

    <div className="brand-name">
      <span>E</span>
      <span>N</span>
      <span>G</span>
      <span>R</span>
      <span>A</span>
      <span>P</span>
      <span>H</span>
    </div>

    <p className="brand-tagline">ENGINEERING CONNECTED</p>

    <div className="intro-progress">
      <div className="intro-progress-bar" />
    </div>

    <p className="intro-status">
      INITIALIZING ENGINEERING NETWORK
    </p>
  </div>

  <div className="intro-corner corner-top-left">
    E.S / SYSTEM 01
  </div>

  <div className="intro-corner corner-top-right">
    ENGRAPH
  </div>

  <div className="intro-corner corner-bottom-left">
    ENGINEERING · TECHNOLOGY · INNOVATION
  </div>

  <div className="intro-corner corner-bottom-right">
    <span className="status-dot" />
    SYSTEM READY
  </div>
</div>


);
}
