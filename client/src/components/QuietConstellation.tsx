import React, { Suspense, lazy, useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";

const Constellation3D = lazy(() => import("@/components/Constellation3D"));

const constellationNodes = [
  [50, 50, 13, "Story"],
  [21, 27, 7, "Court order"],
  [79, 23, 6, "Minister"],
  [17, 67, 7, "Protest"],
  [82, 65, 7, "City"],
  [48, 16, 6, "Policy"],
  [56, 82, 6, "Earlier ruling"],
  [34, 74, 4, "Budget"],
  [66, 31, 4, "Agency"],
  [30, 42, 4, "Report"],
  [72, 72, 4, "Households"],
] as const;

const constellationLines = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 5], [1, 7], [2, 5], [2, 8], [3, 7], [3, 9],
  [4, 6], [4, 10], [5, 8], [6, 7], [6, 10]
];

export default function QuietConstellation() {
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.innerWidth >= 900);

  useEffect(() => {
    const handleResize = () => setWide(window.innerWidth >= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const use3D = wide && !reduce && !failed;

  return (
    <div className={`gateway-constellation-host ${use3D ? "is-3d" : "is-svg"}`} aria-hidden="true">
      {use3D ? (
        <Suspense fallback={<div className="c3d-loading c3d-quiet-loading" />}>
          <Constellation3D quiet={true} onFallback={() => setFailed(true)} />
        </Suspense>
      ) : (
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label="A calm constellation of news background links"
          className={`gateway-svg-constellation ${reduce ? "is-static" : "is-drifting"}`}
        >
          {constellationLines.map(([from, to], index) => {
            const a = constellationNodes[from];
            const b = constellationNodes[to];
            return (
              <line
                key={`line-${index}`}
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
                className="gateway-constellation-line"
              />
            );
          })}
          {constellationNodes.map(([x, y, radius], index) => (
            <circle
              key={`node-${index}`}
              cx={x}
              cy={y}
              r={radius / 2.6}
              className={`gateway-constellation-node ${index === 0 ? "is-core" : ""}`}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
