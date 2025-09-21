import type { CardType } from "@/docs/card";
import type { DocDisplayControl, DocDisplayProps } from "@/components/docs/DocsDisplay";
import { CardDisplayFront } from "@/components/docs/CardDisplayFront";
import { CardDisplayBack } from "@/components/docs/CardDisplayBack";
import { useEffect, useRef, type Ref, type RefObject } from "react";
import { useDirHandle, writeFile } from "@/hooks/useDirHandle";
import { downloadSvgImage, svgToImage } from "@/utils/print";

function applyRef<T>(ref: Ref<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

export type CardDisplayProps = DocDisplayProps<CardType>
export function CardDisplay({ json, link, docKey, ref: cardRef }: CardDisplayProps & {
  ref?: Ref<DocDisplayControl | null>
}) {
  const front = useRef<SVGSVGElement>(null);
  const back = useRef<SVGSVGElement>(null);
  // const { disabled, openDir, error } = useDirHandle(async (dir) => {
  //   if (!front.current || !back.current) {
  //     throw new Error("not ready");
  //   }
  //   const [frontImg, backImg] = await Promise.all([
  //     ,
  //     svgToImage(back.current, { scaleFactor: 8 }),
  //   ] as const);
  //   const name = `bc_${docKey}`;
  //   const files = [
  //     { name: `${name}_front.png`, data: frontImg },
  //     { name: `${name}_back.png`, data: backImg },
  //   ];
  //   for (const file of files) {
  //     await writeFile(dir, file.name, file.data);
  //   }
  //   alert(`Wrote images:\n${files.map(({ name }) => name).join("\n")}`);
  // });
  useEffect(() => {
    const r = cardRef;
    if (!r) return
    applyRef(cardRef, {
       async download(page) {
        if (page === "front") {
          return openFront()
        }
        if (page === 'back') {
          return openBack()
        }
        throw new Error('unknown page')
       }
    })
    return () => applyRef(r, null)
  }, [cardRef])
  const openImage = (ref: RefObject<SVGSVGElement | null>, page: string) => (): string => {
    if (!ref.current) {
      throw new Error('not ready')
    }
    const name = `bc_${docKey}_${page}.png`
    downloadSvgImage(ref.current, name, {
      scaleFactor: 4,
    });
    return name
  };
  const openFront = openImage(front, 'front');
  const openBack = openImage(back, 'back');
  return (
    <>
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
