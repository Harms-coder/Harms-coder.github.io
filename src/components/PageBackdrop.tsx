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
    <div className="backdrop-bleed relative -mx-4 overflow-hidden">
      <img
        src={image}
        alt=""
        className="image-fade-bottom absolute inset-0 h-full w-full object-cover opacity-40"
        style={{ objectPosition: imagePosition }}
      />
      {/* Både mørkning og varm tone toner helt ud inden underkanten, så der ikke opstår en synlig kant. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,13,14,0.26) 0%, rgba(5,13,14,0.54) 50%, rgba(5,13,14,0.28) 80%, rgba(5,13,14,0) 100%), linear-gradient(180deg, rgba(52,110,96,0.05) 0%, rgba(52,110,96,0.1) 52%, rgba(52,110,96,0.04) 82%, rgba(52,110,96,0) 100%)",
        }}
      />
    </div>
  );
}
