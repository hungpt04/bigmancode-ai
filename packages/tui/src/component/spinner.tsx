import { Show } from "solid-js"
import { useTheme } from "../context/theme"
import { useKV } from "../context/kv"
import type { JSX } from "@opentui/solid"
import type { RGBA } from "@opentui/core"
import "opentui-spinner/solid"

export const SPINNER_STYLES = {
  dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  arcs: ["◜", "◝", "◞", "◟"],
  bars: [" ", "▃", "▄", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▄", "▃"],
  pulse: ["░", "▒", "▓", "█", "▓", "▒"],
  bounce: ["⠁", "⠂", "⠄", "⠂"],
}

export const SPINNER_FRAMES = SPINNER_STYLES.dots

export function Spinner(props: { children?: JSX.Element; color?: RGBA; style?: keyof typeof SPINNER_STYLES }) {
  const { theme } = useTheme()
  const kv = useKV()
  const color = () => props.color ?? theme.textMuted

  const styleName = () => props.style ?? (kv.get("spinner_style") as keyof typeof SPINNER_STYLES) ?? "dots"
  const frames = () => SPINNER_STYLES[styleName()] ?? SPINNER_STYLES.dots
  const interval = () => {
    const s = styleName()
    return s === "arcs" ? 120 : s === "bars" ? 60 : 80
  }

  return (
    <Show when={kv.get("animations_enabled", true)} fallback={<text fg={color()}>⋯ {props.children}</text>}>
      <box flexDirection="row" gap={1}>
        <spinner frames={frames()} interval={interval()} color={color()} />
        <Show when={props.children}>
          <text fg={color()}>{props.children}</text>
        </Show>
      </box>
    </Show>
  )
}
