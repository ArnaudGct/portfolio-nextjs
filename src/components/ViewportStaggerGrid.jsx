"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";

const RevealContext = createContext(null);

export function ViewportStaggerGrid({ children, ...props }) {
  const pending = useRef(new Map());
  const frame = useRef(null);
  const enqueue = useCallback((element, reveal) => {
    pending.current.set(element, reveal);
    if (frame.current !== null) return;
    // Regrouper les cartes qui entrent ensemble, sans compter celles hors écran.
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const batch = [...pending.current.entries()].filter(([el]) => el.isConnected);
      pending.current.clear();
      batch.sort(([a], [b]) =>
        a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
      batch.forEach(([, start], index) => start(index * 0.1));
    });
  }, []);
  const remove = useCallback((element) => pending.current.delete(element), []);
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    pending.current.clear();
  }, []);

  return (
    <RevealContext.Provider value={{ enqueue, remove }}>
      <div {...props}>{children}</div>
    </RevealContext.Provider>
  );
}

export function ViewportStaggerItem({ children, ...props }) {
  const { enqueue, remove } = useContext(RevealContext);
  const controls = useAnimationControls();
  const reducedMotion = useReducedMotion();
  const element = useRef(null);
  useEffect(() => {
    const node = element.current;
    return () => remove(node);
  }, [remove]);

  return (
    <motion.div
      {...props}
      ref={element}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={controls}
      viewport={{ once: true, amount: "some" }}
      onViewportEnter={() => enqueue(element.current, (delay) => {
        controls.start({
          opacity: 1, scale: 1, y: 0,
          transition: { duration: reducedMotion ? 0 : 0.3, ease: "easeOut", delay: reducedMotion ? 0 : delay },
        });
      })}
    >
      {children}
    </motion.div>
  );
}
