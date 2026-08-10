export function SmokeEffect() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary smoke layer — bottom of hero, full width */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/smoke.png"
        alt=""
        className="absolute bottom-0 left-0 w-full"
        style={{
          opacity: 0.55,
          transform: "scaleY(-1) translateY(10%)",
          objectFit: "cover",
          filter: "brightness(0.62) grayscale(1)",
        }}
      />
      {/* Second layer — upper right, rotated for depth */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/smoke.png"
        alt=""
        className="absolute"
        style={{
          opacity: 0.28,
          right: "-5%",
          top: "8%",
          width: "70%",
          transform: "rotate(15deg) scaleX(-1)",
          filter: "brightness(0.62) grayscale(1)",
        }}
      />
    </div>
  );
}
