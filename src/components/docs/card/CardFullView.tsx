import type { DocFullViewProps } from "@/components/safeDoc-react/DocView";
import { DEFAULT_COLOR, type CardV1 } from "@/docs/card";
import { CardDisplayBack } from "./CardDisplayBack";
import { useOnAllReady } from "@/hooks/useOnAllReady";
import { CardDisplayFront } from "./CardDisplayFront";
import { useRef, useState } from "react";
import { svgToImage } from "@/utils/print";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image } from "@react-three/drei";
import { CARD_SIZE } from "../BusinessCardSvg";
import * as THREE from "three";
import { ColorInfo } from "./ColorInfo";
import { Logo } from "@/components/Logo";
import "./CardFullView.css";
import { ICON_WHITE_BG } from "@/docs/card/icon-white-bg";
import { ICON_RATIOS } from "@/docs/card/icon-ratios";
import clsx from "clsx";
import { isArabic } from "@/components/utils/isArabic";

export type CardFullViewProps = DocFullViewProps<typeof CardV1>;
const scale = [CARD_SIZE.normal.width / 200, CARD_SIZE.normal.height / 200] as [
  number,
  number,
];

function DreiView({ front, back }: { front: string; back: string }) {
  const fRef = useRef<THREE.Mesh>(null);
  const bRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!fRef.current || !bRef.current) return;
    const angleD = Math.round((Date.now() / 12000) * 1000) % 1000;
    const angle = (angleD / 1000) * 2 * Math.PI;
    bRef.current.setRotationFromEuler(new THREE.Euler(0, angle, 0));
    fRef.current.setRotationFromEuler(new THREE.Euler(0, angle + Math.PI, 0));
  });
  return (
    <>
      <Image ref={fRef} url={front} scale={scale} />
      <Image ref={bRef} url={back} scale={scale} />
    </>
  );
}

function RotatingCardView(props: CardFullViewProps) {
  const front = useRef<SVGSVGElement>(null);
  const back = useRef<SVGSVGElement>(null);
  const [frontUrl, setFrontUrl] = useState<string>();
  const [backUrl, setBackUrl] = useState<string>();
  const [useFrontReady, useBackReady] = useOnAllReady(() => {
    props.onReady?.();
    Promise.all([
      svgToImage(front.current!).then((img) =>
        setFrontUrl(URL.createObjectURL(img)),
      ),
      svgToImage(back.current!).then((img) =>
        setBackUrl(URL.createObjectURL(img)),
      ),
    ]).catch((error) => {
      console.log(error);
    });
  }, 2);
  return (
    <>
      <div
        className="fullcard--drei-loader"
        style={{ width: CARD_SIZE.normal.width }}
      >
        {frontUrl ? null : (
          <CardDisplayFront ref={front} {...props} onReady={useFrontReady} />
        )}
        {backUrl ? null : (
          <CardDisplayBack ref={back} {...props} onReady={useBackReady} />
        )}
      </div>
      {frontUrl && backUrl ? (
        <Canvas style={{ height: "50vh", width: "100cqw", gridColumn: "full" }}>
          <DreiView front={frontUrl} back={backUrl} />
        </Canvas>
      ) : null}
    </>
  );
}

const CardDesignView = ({ data }: CardFullViewProps) => {
  const colorInfo = ColorInfo[data.color] ?? ColorInfo[DEFAULT_COLOR];
  const colorStyle = { backgroundColor: colorInfo.bg, color: colorInfo.fg };
  return (
    <>
      <header style={colorStyle} className="full">
        <Logo src={colorInfo.logo} />
      </header>
      <section style={colorStyle} className="full fullcard">
        <menu></menu>
        <h1>
          <ruby>
            {data.callname}
            <rt>{data.callname_kana}</rt>
          </ruby>
        </h1>
      </section>
      <section className="text">
        <div
          className={clsx("name", {
            arabic: isArabic(data.surname) || isArabic(data.firstname),
          })}
        >
          <strong>
            <ruby>
              {data.surname}
              <rt>{data.surname_kana}</rt>
            </ruby>
          </strong>{" "}
          <ruby>
            {data.firstname}
            <rt>{data.firstname_kana}</rt>
          </ruby>
        </div>
        <div className="subtitle">{data.subtitle}</div>
        {data.email ? (
          <div className="email">
            <a href={`mailto:${data.email}`}>{data.email}</a>
          </div>
        ) : null}
        {data.url ? (
          <div className="url">
            <a href={data.url}>{data.url}</a>
          </div>
        ) : null}
      </section>
    </>
  );
};

export const CardFullView = (props: CardFullViewProps) => {
  const icons = [
    props.data.bottom1,
    props.data.bottom2,
    props.data.bottom3,
    props.data.bottom4,
    props.data.bottom5,
  ].filter(Boolean) as string[];
  return (
    <div className="fullcard">
      <CardDesignView {...props} />
      <RotatingCardView {...props} />
      {icons.length > 0 || props.data.description ? (
        <footer className="fullcard">
          <div>
            {icons.map((value) => {
              const border =
                ICON_WHITE_BG[value as keyof typeof ICON_WHITE_BG] ?? false;
              const height = 20;
              const width =
                ICON_RATIOS[value as keyof typeof ICON_RATIOS] * height;
              return (
                <img
                  key={value}
                  className={clsx({ border, icon: true })}
                  src={`/svg/${value}.svg`}
                  width={width}
                  height={height}
                />
              );
            })}
            {props.data.description}
          </div>
        </footer>
      ) : null}
    </div>
  );
};
