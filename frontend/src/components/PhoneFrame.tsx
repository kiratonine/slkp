import { ReactNode } from "react";
import BottomNav from "./BottomNav";

type Props = {
  children: ReactNode;
  hideNav?: boolean;
};

export default function PhoneFrame({ children, hideNav = false }: Props) {
  return (
    <div className="min-h-screen sm:flex sm:items-center sm:justify-center sm:p-4 sm:bg-gray-100">
      <div
        className="relative bg-white overflow-hidden w-full sm:w-[390px] sm:h-[844px] sm:rounded-[2.5rem] sm:shadow-2xl"
        style={{ minHeight: "100dvh" }}
      >
        <div
          className="overflow-y-auto h-full"
          style={{
            paddingBottom: hideNav ? 0 : 88,
          }}
        >
          {children}
        </div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
