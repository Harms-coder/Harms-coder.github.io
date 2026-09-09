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
  return (
    <div className="relative -mx-4 -mt-6 h-28 w-full overflow-hidden">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        style={{ objectPosition: imagePosition }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(11,14,14,0.25) 0%, var(--color-bg) 92%)",
        }}
      />
    </div>
  );
}
