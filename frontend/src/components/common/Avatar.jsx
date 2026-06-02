import React from "react";
import { motion } from "framer-motion";

const Avatar = ({ src, name, size = "md", isOnline = false, className = "", animate = true }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-24 h-24 text-3xl",
  };

  const ringSizes = {
    xs: "p-[1px]",
    sm: "p-[1.5px]",
    md: "p-0.5",
    lg: "p-0.5",
    xl: "p-[3px]",
    "2xl": "p-1",
  };

  const badgeSizes = {
    xs: "w-1.5 h-1.5 bottom-0 right-0 border-[1px]",
    sm: "w-2 h-2 bottom-0 right-0 border-[1.5px]",
    md: "w-2.5 h-2.5 bottom-0.5 right-0.5 border-2",
    lg: "w-3 h-3 bottom-0.5 right-0.5 border-2",
    xl: "w-4 h-4 bottom-1 right-1 border-2.5",
    "2xl": "w-5 h-5 bottom-1.5 right-1.5 border-3",
  };

  const getInitials = (fullName) => {
    if (!fullName) return "C";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  const avatarWrapper = animate
    ? {
        rest: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2, ease: "easeOut" } },
      }
    : {};

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const baseUrl = "http://localhost:5145";
    return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  const resolvedSrc = getImageUrl(src);

  // sizeClasses[size] is now correctly applied to the outer motion.div
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${sizeClasses[size] || sizeClasses["md"]} ${className}`}
      initial="rest"
      whileHover={animate ? "hover" : ""}
      variants={avatarWrapper}
    >
      {/* Inner ring wrapper: must be w-full h-full to fill the outer sized container */}
      <div
        className={`w-full h-full rounded-full bg-gradient-to-tr from-primary to-primary-light ${ringSizes[size] || ringSizes["md"]} shadow-sm overflow-hidden flex items-center justify-center`}
      >
        {resolvedSrc && !hasError ? (
          <img
            src={resolvedSrc}
            alt={name || "Avatar"}
            className="w-full h-full object-cover object-center rounded-full"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-primary-dark">
            {initials}
          </div>
        )}
      </div>

      {isOnline && (
        <span
          className={`absolute rounded-full bg-green-500 border-white block ${badgeSizes[size] || badgeSizes["md"]}`}
          title="Online"
        />
      )}
    </motion.div>
  );
};

export default Avatar;
