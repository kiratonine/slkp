import { ReactNode, useEffect } from "react";
import BottomNav from "./BottomNav";

type Props = {
  children: ReactNode;
  hideNav?: boolean;
};

export default function PhoneFrame({ children, hideNav = false }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="sm:flex sm:items-center sm:justify-center sm:p-4 sm:bg-gray-100"
      style={{ height: "100dvh" }}
    >
      <div className="relative bg-white overflow-hidden w-full h-full sm:w-[390px] sm:max-h-[844px] sm:rounded-[2.5rem] sm:shadow-2xl">
        <div
          className="overflow-y-auto h-full"
          style={{
            paddingBottom: hideNav
              ? 0
              : "calc(96px + env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
