import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#060e1a" }}
    >
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 700,
            top: -250,
            left: -250,
            background:
              "radial-gradient(ellipse, rgba(56,189,248,0.055) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 800,
            height: 700,
            bottom: -250,
            right: -250,
            background:
              "radial-gradient(ellipse, rgba(167,139,250,0.045) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            top: "45%",
            left: "45%",
            background:
              "radial-gradient(ellipse, rgba(16,185,129,0.03) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Main panel */}
      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        <Header collapsed={collapsed} />
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
