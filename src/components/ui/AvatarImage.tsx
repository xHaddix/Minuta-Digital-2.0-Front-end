import { useEffect, useState } from "react";

interface AvatarImageProps {
  src?: string | null;
  name: string;
  size?: number;
}

export function AvatarImage({ src, name, size = 40 }: AvatarImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        aria-label={`Foto de ${name}`}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flex: "0 0 auto" }}
      />
    );
  }

  const initials = name.trim().slice(0, 1).toLocaleUpperCase() || "?";
  return (
    <span
      aria-label={`Avatar de ${name}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        flex: "0 0 auto",
        background: "linear-gradient(135deg, #627df4, #8b5cf6)",
        color: "#fff",
        fontWeight: 700,
        fontSize: Math.max(14, size * 0.4),
      }}
    >
      {initials}
    </span>
  );
}
