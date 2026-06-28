import {
  useLayoutEffect,
  useRef,
} from "react";

import type { ScriptBlock } from "../types/script";

type Props = {
  block: ScriptBlock;

  onResize: (
    id: number,
    height: number
  ) => void;

  children: React.ReactNode;
};

export default function MeasuredBlock({
  block,
  onResize,
  children,
}: Props) {

  const ref =
    useRef<HTMLDivElement>(null);

        useLayoutEffect(() => {

          if (!ref.current) return;

          const element = ref.current;

          const notify = () => {

            onResize(
              block.id,
              element.offsetHeight
            );

          };

          notify();

          const observer =
            new ResizeObserver(notify);

          observer.observe(element);

          return () => observer.disconnect();

        }, [block.id, block.content]);

  return (
    <div ref={ref}>
      {children}
    </div>
  );

}