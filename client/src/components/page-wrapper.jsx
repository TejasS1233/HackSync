import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const PageWrapper = ({ children }) => {
  const location = useLocation();
  const wrapperRef = useRef(null);
  const isDashboard = location.pathname.startsWith("/dashboard");
  useLayoutEffect(() => {
    if (!isDashboard) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, isDashboard]);

  useGSAP(
    () => {
      if (isDashboard || !wrapperRef.current) {
        return;
      }

      gsap.fromTo(
        wrapperRef.current,
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          clearProps: "all",
        }
      );
    },
    { scope: wrapperRef, dependencies: [location.pathname, isDashboard] }
  );

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full" ref={wrapperRef}>
      {children}
    </div>
  );
};

export default PageWrapper;
