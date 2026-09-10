interface PageBackdropProps {
  image: string;
  imagePosition?: string;
}

/**
 * Diskret foto-stemning bag toppen af en side — samme fotostil som Oversigt/Cardios hero,
 * men meget kortere og mere afdæmpet, og uden logo/titel (siden beholder sin egen overskrift,
 * som denne blok skubber naturligt lidt ned).
 */
export function PageBackdrop({ image, imagePosition = "center" }: PageBackdropProps) {
  // Uden w-full: auto-bredde + negativ margin giver præcis fuld skærmbredde (100% + 2rem).
  return (
    <div className="relative -mx-4 -mt-6 h-28 overflow-hidden">
      <img
        src={image}
        alt=""
        className="image-fade-bottom absolute inset-0 h-full w-full object-cover opacity-40"
        style={{ objectPosition: imagePosition }}
      />
      {/* Slutter i transparent, så ambient-baggrunden skinner igennem i overgangen. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,14,14,0.2) 0%, rgba(11,14,14,0.62) 70%, rgba(11,14,14,0) 100%), linear-gradient(180deg, rgba(199,122,67,0.05) 0%, rgba(199,122,67,0.14) 100%)",
        }}
      />
    </div>
  );
}
