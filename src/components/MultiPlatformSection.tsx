import React, { useEffect, useRef } from "react";
import AutoReplyLogo from "./AutoReplyLogo";
import "./MultiPlatformSection.css";

export default function MultiPlatformSection() {
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const wrappers = stage.querySelectorAll<HTMLElement>(".phoneWrapper");

    const handleMouseMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const normalizedX = (x / rect.width - 0.5) * 2;

      // Smooth horizontal spread up to 45px outward
      const spread = Math.min(Math.abs(normalizedX), 1) * 42;

      wrappers.forEach((wrapper, index) => {
        if (index === 0) {
          wrapper.style.setProperty("--hover-spread", `${-spread}px`);
        } else if (index === 2) {
          wrapper.style.setProperty("--hover-spread", `${spread}px`);
        } else {
          wrapper.style.setProperty("--hover-spread", "0px");
        }
      });

      stage.classList.add("hovered");
    };

    const handleMouseLeave = () => {
      wrappers.forEach((wrapper) => {
        wrapper.style.setProperty("--hover-spread", "0px");
      });

      stage.classList.remove("hovered");
    };

    stage.addEventListener("mousemove", handleMouseMove);
    stage.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      stage.removeEventListener("mousemove", handleMouseMove);
      stage.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section className="autoReplyExSection" id="multi-platform-section">
      <div className="autoReplyExContainer">
        {/* =====================================================================
            LEFT CONTENT COLUMN
           ===================================================================== */}
        <div className="autoReplyExContent" id="multi-platform-content">
          <div className="autoReplyExBadge" id="multi-platform-badge">
            MULTI-PLATFORM SUPPORT
          </div>

          <h2 id="multi-platform-headline">
            Orders Come From
            <span>Everywhere</span>
          </h2>

          <p id="multi-platform-description">
            Customers message you on Instagram, Facebook and WhatsApp — inquiries,
            orders, price questions and support. AutoReply Ex brings all platforms
            into one inbox and handles them instantly.
          </p>
        </div>

        {/* =====================================================================
            RIGHT MOCKUP AREA (3 HIGH-FIDELITY SMARTPHONES)
           ===================================================================== */}
        <div
          ref={stageRef}
          className="autoReplyExPhoneStage"
          id="multi-platform-stage"
        >
          {/* Ambient Ground Shadow */}
          <div className="stageFloorShadow" />

          {/* ===================================================================
              PHONE 1: INSTAGRAM (LEFT - ANGLED OUTWARD, SUBTLE OVERLAP)
             =================================================================== */}
          <div className="phoneWrapper phoneWrapperInstagram" id="mockup-group-instagram">
            {/* Platform Label: Positioned directly above phone */}
            <div className="platformLabel" id="label-instagram">
              <svg viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="ig-grad-real" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect width="24" height="24" rx="6" fill="url(#ig-grad-real)" />
                <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="white" strokeWidth="1.8" fill="none" />
                <circle cx="12" cy="12" r="3.7" stroke="white" strokeWidth="1.8" fill="none" />
                <circle cx="16.5" cy="7.5" r="1.1" fill="white" />
              </svg>
              <span>Instagram</span>
            </div>

            {/* Realistic iPhone Hardware Frame */}
            <div className="phone" id="phone-instagram">
              <div className="phoneScreen instagramScreen">
                {/* Specular Glass Glare Overlay */}
                <div className="phoneGlassReflection" />

                {/* Top Status Bar with Dynamic Island */}
                <div className="statusBar">
                  <span className="statusTime">9:41</span>
                  <div className="dynamicIsland" />
                  <div className="statusIcons">
                    <div className="signalBars">
                      <div className="signalBar" />
                      <div className="signalBar" />
                      <div className="signalBar" />
                      <div className="signalBar" />
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, margin: "0 2px" }}>5G</span>
                    <div className="batteryPill">
                      <div className="batteryFill" />
                    </div>
                  </div>
                </div>

                {/* Instagram Direct Header */}
                <div className="igHeader">
                  <div className="igHeaderLeft">
                    {/* Back Arrow */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {/* Profile Avatar with Story Gradient Ring */}
                    <div className="igStoryAvatar">
                      <div className="igAvatarInner">
                        <AutoReplyLogo
                          className="w-full h-full object-contain p-0.5 select-none"
                        />
                      </div>
                    </div>
                    <div className="igHeaderInfo">
                      <div className="igHeaderName">
                        <span>autoreplyex</span>
                        <span className="igVerified">✓</span>
                      </div>
                      <span className="igHeaderSub">Active now</span>
                    </div>
                  </div>
                  <div className="igHeaderActions">
                    {/* Audio Call */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {/* Video Call */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                </div>

                {/* Instagram Chat Stream */}
                <div className="igChatArea">
                  {/* Incoming Customer Inquiry */}
                  <div className="igMessageIn">
                    Hi! Is the classic sneaker available in black?
                  </div>

                  {/* Real Product Card (Unsplash Photography) */}
                  <div className="igProductCard">
                    <img
                      src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=360&q=80"
                      alt="Classic Sneakers"
                      className="igProductImg"
                    />
                    <div className="igProductDetails">
                      <div>
                        <div className="igProductTitle">Classic Sneakers</div>
                        <span style={{ fontSize: "8.5px", color: "#888" }}>Size 40 - 45</span>
                      </div>
                      <span className="igProductPrice">$49.00</span>
                    </div>
                  </div>

                  {/* Incoming Follow-up */}
                  <div className="igMessageIn">
                    Can I place an order now?
                  </div>

                  {/* AutoReply Ex Outgoing Store Reply (Lilac bubble) */}
                  <div className="igMessageOut">
                    Yes, it's available! You can place the order directly from our website or right here.
                  </div>
                </div>

                {/* Instagram Direct Message Input */}
                <div className="igBottomInput">
                  <div className="igCameraBtn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div className="igInputPill">
                    <span>Message...</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    </svg>
                  </div>
                  {/* Heart */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>

                {/* Home Indicator */}
                <div className="homeIndicatorBar">
                  <div className="homeIndicator" />
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              PHONE 2: WHATSAPP (CENTER HERO FOREGROUND - PROMINENT & ELEVATED)
             =================================================================== */}
          <div className="phoneWrapper phoneWrapperWhatsapp" id="mockup-group-whatsapp">
            {/* Platform Label: Positioned directly above WhatsApp phone */}
            <div className="platformLabel" id="label-whatsapp">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#25D366" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.15 6.35A8.34 8.34 0 0012.23 3.9c-4.63 0-8.4 3.77-8.4 8.4 0 1.48.39 2.93 1.13 4.21L3.5 20.5l4.1-1.07a8.38 8.38 0 003.99 1.01h.01c4.63 0 8.4-3.77 8.4-8.4 0-2.25-.87-4.36-2.46-5.95l-.39.26zm-5.92 12.63h-.01a7 7 0 01-3.56-.97l-.26-.15-2.65.69.71-2.58-.17-.27a6.98 6.98 0 01-1.07-3.7c0-3.86 3.15-7.01 7.01-7.01 1.87 0 3.63.73 4.95 2.05a6.96 6.96 0 012.05 4.96c0 3.86-3.14 7.01-7 7.01v-.03zm3.84-5.25c-.21-.11-1.24-.61-1.43-.68-.19-.07-.33-.11-.47.11-.14.21-.54.68-.66.82-.12.14-.24.16-.45.05-.21-.11-.89-.33-1.69-1.04-.63-.56-1.05-1.25-1.17-1.46-.12-.21-.01-.33.09-.43.09-.1.21-.24.32-.36.11-.12.14-.21.21-.35.07-.14.04-.26-.02-.37-.06-.11-.47-1.13-.64-1.55-.17-.41-.34-.35-.47-.36h-.4c-.14 0-.37.05-.56.26-.19.21-.73.71-.73 1.74s.75 2.02.85 2.16c.11.14 1.47 2.25 3.56 3.15.5.21.89.34 1.19.44.5.16.96.14 1.32.08.4-.06 1.24-.51 1.41-1 .17-.49.17-.91.12-1-.05-.08-.19-.13-.4-.24z"
                  fill="white"
                />
              </svg>
              <span>WhatsApp</span>
            </div>

            {/* Realistic iPhone Hardware Frame */}
            <div className="phone" id="phone-whatsapp">
              <div className="phoneScreen whatsappScreen">
                {/* Specular Glass Glare Overlay */}
                <div className="phoneGlassReflection" />

                {/* Top Status Bar with Dynamic Island */}
                <div className="statusBar">
                  <span className="statusTime">9:41</span>
                  <div className="dynamicIsland" />
                  <div className="statusIcons">
                    <div className="signalBars">
                      <div className="signalBar" />
                      <div className="signalBar" />
                      <div className="signalBar" />
                      <div className="signalBar" />
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, margin: "0 2px" }}>5G</span>
                    <div className="batteryPill">
                      <div className="batteryFill" />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Header */}
                <div className="waHeader">
                  <div className="waHeaderLeft">
                    {/* Back Arrow */}
                    <span className="waBackBtn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </span>
                    <div className="waAvatarWrapper">
                      <div className="waAvatar">
                        <AutoReplyLogo
                          className="w-full h-full object-contain p-0.5 select-none"
                        />
                      </div>
                      <div className="waOnlineDot" />
                    </div>
                    <div className="waHeaderInfo">
                      <div className="waHeaderName">
                        <span>AutoReply Ex</span>
                        <span className="waVerified">✓</span>
                      </div>
                      <span className="waHeaderStatus">Online</span>
                    </div>
                  </div>
                  <div className="waHeaderIcons">
                    {/* Video Call */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    {/* Audio Call */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                </div>

                {/* WhatsApp Chat Stream */}
                <div className="waChatArea">
                  {/* Incoming Customer Msg */}
                  <div className="waMessageIn">
                    Hi, I want to place an order
                    <span className="waTimeIn">9:14 AM</span>
                  </div>

                  {/* AutoReply Ex Outgoing Store Msg */}
                  <div className="waMessageOut">
                    Sure! Which product are you interested in?
                    <span className="waTimeOut">
                      9:14 AM <span className="waDoubleCheck">✓✓</span>
                    </span>
                  </div>

                  {/* Incoming Size Chart Request */}
                  <div className="waMessageIn">
                    Can you share the size chart?
                    <span className="waTimeIn">9:15 AM</span>
                  </div>

                  {/* AutoReply Ex Outgoing PDF Attachment */}
                  <div className="waMessageOut">
                    <div>Here you go!</div>
                    <div className="waFileCard">
                      <div className="waPdfBadge">PDF</div>
                      <div>
                        <div className="waFileTitle">Size Chart.pdf</div>
                        <span className="waFileSize">245 KB • PDF</span>
                      </div>
                    </div>
                    <span className="waTimeOut">
                      9:16 AM <span className="waDoubleCheck">✓✓</span>
                    </span>
                  </div>
                </div>

                {/* WhatsApp Bottom Input Bar */}
                <div className="waBottomInput">
                  <span className="waPlusBtn">＋</span>
                  <div className="waInputPill">
                    <span>Message</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div className="waMicBtn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    </svg>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="homeIndicatorBar">
                  <div className="homeIndicator" />
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              PHONE 3: FACEBOOK MESSENGER (RIGHT - ANGLED OUTWARD, SUBTLE OVERLAP)
             =================================================================== */}
          <div className="phoneWrapper phoneWrapperFacebook" id="mockup-group-facebook">
            {/* Platform Label: Positioned directly above Facebook phone */}
            <div className="platformLabel" id="label-facebook">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#1877F2" />
                <path
                  d="M15.5 12.05h-2.43V20.5h-3.48v-8.45H7.85V8.92h1.74V6.95c0-2.4 1.44-3.72 3.62-3.72 1.04 0 2.14.19 2.14.19v2.36h-1.2c-1.19 0-1.56.74-1.56 1.5v1.64h2.66l-.42 3.13z"
                  fill="white"
                />
              </svg>
              <span>Facebook</span>
            </div>

            {/* Realistic iPhone Hardware Frame */}
            <div className="phone" id="phone-facebook">
              <div className="phoneScreen facebookScreen">
                {/* Specular Glass Glare Overlay */}
                <div className="phoneGlassReflection" />

                {/* Top Status Bar with Dynamic Island */}
                <div className="statusBar">
                  <span className="statusTime">9:41</span>
                  <div className="dynamicIsland" />
                  <div className="statusIcons">
                    <div className="signalBars">
                      <div className="signalBar" />
                      <div className="signalBar" />
                      <div className="signalBar" />
                      <div className="signalBar" />
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, margin: "0 2px" }}>5G</span>
                    <div className="batteryPill">
                      <div className="batteryFill" />
                    </div>
                  </div>
                </div>

                {/* Facebook Messenger Header */}
                <div className="fbHeader">
                  <div className="fbHeaderLeft">
                    {/* Back Chevron */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0084FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <div className="fbAvatar">
                      <AutoReplyLogo
                        className="w-full h-full object-contain p-0.5 select-none"
                      />
                    </div>
                    <div className="fbHeaderInfo">
                      <div className="fbHeaderName">
                        <span>AutoReply Ex</span>
                        <span className="fbVerified">✓</span>
                      </div>
                      <span className="fbHeaderSub">Active now</span>
                    </div>
                  </div>
                  <div className="fbHeaderActions">
                    {/* Audio Call */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {/* Info */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                </div>

                {/* Messenger Chat Stream */}
                <div className="fbChatArea">
                  {/* Incoming Customer Msg */}
                  <div className="fbMessageIn">
                    Do you have this in stock?
                  </div>

                  {/* AutoReply Ex Outgoing Store Msg (Messenger Blue Bubble) */}
                  <div className="fbMessageOut">
                    Yes, it's available in black and white.
                  </div>

                  {/* Customer Asks for Photos */}
                  <div className="fbMessageIn">
                    Can you share more photos?
                  </div>

                  {/* High-Fidelity 3-Photo Sneaker Gallery */}
                  <div className="fbGalleryGrid">
                    <div className="fbGalleryMain">
                      <img
                        src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=350&q=80"
                        alt="Sneaker Main View"
                      />
                    </div>
                    <div className="fbGalleryStack">
                      <div className="fbGalleryThumb">
                        <img
                          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=180&q=80"
                          alt="Sneaker Angle 1"
                        />
                      </div>
                      <div className="fbGalleryThumb">
                        <img
                          src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=180&q=80"
                          alt="Sneaker Angle 2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* AutoReply Ex Call to Action */}
                  <div className="fbMessageOut">
                    How would you like to place the order?
                  </div>
                </div>

                {/* Facebook Messenger Bottom Input Bar */}
                <div className="fbBottomInput">
                  <div className="fbInputIcons">
                    {/* Camera */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    {/* Gallery */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="fbInputPill">
                    <span>Aa</span>
                  </div>
                  <div className="fbThumbUp">
                    {/* Messenger Thumbs Up */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0084FF">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="homeIndicatorBar">
                  <div className="homeIndicator" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
