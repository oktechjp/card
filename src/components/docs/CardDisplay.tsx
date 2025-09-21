import type { CardType } from "@/docs/card";
import type { DocDisplayProps } from "@/components/docs/DocsDisplay";
import { CardDisplayFront } from "@/components/docs/CardDisplayFront";
import { CardDisplayBack } from "@/components/docs/CardDisplayBack";
import { useRef, type RefObject } from "react";
import { useDirHandle, writeFile } from "@/hooks/useDirHandle";
import { downloadSvgImage, svgToImage } from "@/utils/print";

export function CardDisplay({ json, link, docKey }: DocDisplayProps<CardType>) {
  const front = useRef<SVGSVGElement>(null);
  const back = useRef<SVGSVGElement>(null);
  const { disabled, openDir, error } = useDirHandle(async (dir) => {
    if (!front.current || !back.current) {
      throw new Error("not ready");
    }
    const [frontImg, backImg] = await Promise.all([
      svgToImage(front.current, { scaleFactor: 8 }),
      svgToImage(back.current, { scaleFactor: 8 }),
    ] as const);
    const name = `bc_${docKey}`;
    const files = [
      { name: `${name}_front.png`, data: frontImg },
      { name: `${name}_back.png`, data: backImg },
    ];
    for (const file of files) {
      await writeFile(dir, file.name, file.data);
    }
    alert(`Wrote images:\n${files.map(({ name }) => name).join("\n")}`);
  });
  const openImage = (ref: RefObject<SVGSVGElement | null>) => () => {
    if (!ref.current) {
      console.warn("not ready");
      return;
    }
    downloadSvgImage(ref.current, `bc_${docKey}.png`, {
      scaleFactor: 4,
    });
  };
  const openFront = openImage(front);
  const openBack = openImage(back);
  return (
    <>
      <div>
        <button
          title={disabled}
          onClick={openDir}
          disabled={disabled !== undefined}
        >
          Download
        </button>
        <button onClick={openFront}>Open Front</button>
        <button onClick={openBack}>Open Back</button>
      </div>
      {error ? <div className="error">{String(error)}</div> : null}
      <div>
        <CardDisplayFront
          ref={front}
          docKey={docKey}
          json={json}
          link={link}
          isCut
        />
        <CardDisplayBack
          ref={back}
          docKey={docKey}
          json={json}
          link={link}
          isCut
        />
      </div>
    </>
  );
}
