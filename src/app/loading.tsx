import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="relative animate-pulse duration-1000">
        <Image
          src="/Urbik_Logo_Negro.svg"
          alt="Urbik Logo"
          width={180}
          height={60}
          priority
          className="h-auto w-auto"
        />
      </div>
      <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-black animate-progress origin-left"></div>
      </div>
    </div>
  );
}