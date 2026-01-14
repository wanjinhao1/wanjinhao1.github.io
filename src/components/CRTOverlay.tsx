export const CRTOverlay = () => {
  return (
    <>
      {/* 扫描线效果 */}
      <div className="crt-scanlines" aria-hidden="true" />
      {/* 屏幕发光效果 */}
      <div className="crt-glow" aria-hidden="true" />
    </>
  );
};
