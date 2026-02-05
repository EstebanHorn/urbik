import Image from "next/image";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="animate-pulse">
        <Image
          src="/Urbik_Logo_Negro.svg"
          alt="Cargando..."
          width={100}
          height={40}
          className="opacity-50"
        />
      </div>
    </div>
  );
}