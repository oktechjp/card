import type { ReactElement } from "react";

export type DocButtonListProps = {
  children: ReactElement | Array<ReactElement | null | undefined>;
};
export const DocButtonList = ({ children }: DocButtonListProps) => {
  return (
    <>
      <nav className="sd--button-box">
        <ul className="sd--button-list">
          {(Array.isArray(children) ? children : [children]).map((entry) =>
            entry ? <li key={entry?.key}>{entry}</li> : null,
          )}
        </ul>
      </nav>
    </>
  );
};
