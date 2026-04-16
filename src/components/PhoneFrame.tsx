import { ReactNode } from "react";

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-[3rem] shadow-2xl overflow-hidden"
        style={{
          width: 390,
          minHeight: 844,
          maxHeight: 844,
          overflowY: "auto",
        }}
      >
        <div className="h-full overflow-y-auto" style={{ maxHeight: 790 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
