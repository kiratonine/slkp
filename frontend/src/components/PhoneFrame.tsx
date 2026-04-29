import { ReactNode } from "react";
import BottomNav from "./BottomNav";

type Props = {
  children: ReactNode;
  hideNav?: boolean;
};

export default function PhoneFrame({ children, hideNav = false }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="relative bg-white overflow-hidden"
        style={{
          width: 390,
          minHeight: 844,
          maxHeight: 844,
        }}
      >
        <div
          className="overflow-y-auto"
          style={{ maxHeight: hideNav ? 790 : 720 }}
        >
          {children}
        </div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
