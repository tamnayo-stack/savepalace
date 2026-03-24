"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, X } from "@phosphor-icons/react";

type Props = {
  code: string;
  minPurchase?: string;
  onClose: () => void;
};

export default function CopyModal({ code, minPurchase, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(13,11,26,0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          borderRadius: "20px",
          padding: "28px 24px 22px",
          maxWidth: "340px",
          width: "calc(100vw - 40px)",
          boxShadow: "0 20px 60px rgba(124,58,237,0.25), 0 4px 20px rgba(0,0,0,0.3)",
          border: "1px solid var(--line)",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            padding: "4px",
            lineHeight: 1,
          }}
          aria-label="닫기"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{ marginBottom: "10px" }}>
          <CheckCircle size={48} color="var(--brand-color)" weight="fill" />
        </div>

        {/* Code */}
        <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 800, color: "var(--text)" }}>
          <strong style={{
            color: "var(--brand-color)",
            fontFamily: "monospace",
            letterSpacing: "0.06em",
            fontSize: "18px",
          }}>{code}</strong>
          {" "}복사 완료!
        </p>

        {minPurchase && (
          <p style={{ margin: "0 0 14px", fontSize: "12px", color: "var(--muted)" }}>
            장바구니에{" "}
            <strong style={{ color: "var(--text)" }}>{minPurchase}</strong> 이상 담고 진행하세요
          </p>
        )}

        {/* 사용 방법 */}
        <div style={{
          margin: "0 0 16px",
          background: "var(--bg-sub)",
          borderRadius: "12px",
          padding: "14px 16px",
          textAlign: "left",
          fontSize: "13px",
          color: "var(--text)",
          lineHeight: 1.85,
          border: "1px solid var(--line)",
        }}>
          <p style={{ margin: "0 0 6px", fontWeight: 700 }}>📋 사용 방법</p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            ① 장바구니에{minPurchase ? ` ${minPurchase} 이상 ` : " "}상품을 담고<br />
            ② 결제창 → <strong style={{ color: "var(--text)" }}>&ldquo;할인코드&rdquo;</strong> 클릭<br />
            ③ 코드를 붙여넣고 <strong style={{ color: "var(--text)" }}>적용하기</strong>!
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: "linear-gradient(135deg, var(--brand-color), var(--brand-color-dark))",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "12px 40px",
            fontSize: "15px",
            fontWeight: 800,
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 4px 14px var(--brand-color-glow)",
          }}
        >
          알리로 이동하여 사용하기 →
        </button>
      </div>
    </div>,
    document.body
  );
}
