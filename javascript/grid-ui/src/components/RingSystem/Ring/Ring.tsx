/** @jsx _jsx */

import { css, jsx as _jsx } from "@emotion/core";
import React from "react";
import Tippy from "@tippyjs/react";
import { FocusTriggerActions } from "../../../screens/Console/Console.keybinds";

interface RingProps {
	radius: number;
	stroke: number;
	highlight?: boolean;
	id: string;
	color: string;
	progress: number;
	offset: number;
	parentCB: Function;
	label?: string;
}

// Ring is an svg cicular ring implementation
const Ring = React.memo((props: RingProps) => {
	const {
		radius,
		stroke,
		progress,
		offset: offsetPercent,
		color,
		id,
		highlight = false,
		label,
		/* parentCB */
	} = props;

	let normalizedRadius = radius - stroke;
	let circumference = normalizedRadius * 2 * Math.PI;
	const strokeDashoffset = circumference - (progress / 100) * circumference;
	const offsetAngle = (360 * offsetPercent) / 100;

	/* https://stackoverflow.com/a/58175279/8608146 */
	const highlightCSS = css`
		filter: drop-shadow(2px 2px 0px #111) drop-shadow(-1px 1px 0px #111)
			drop-shadow(1px -1px 0px #111) drop-shadow(-1px -1px 0px #111);
	`;

	const svg = (
		<svg
			tabIndex={label ? 0 : undefined}
			data-trigger-action={FocusTriggerActions.filterSelected}
			data-trigger-filter-label={label}
			id={id}
			height={radius * 2}
			width={radius * 2}
			css={css`
				position: absolute;
				${highlight ? highlightCSS : ""}
				z-index: 1;
				// removes the border outline when focused
				${highlight
					? `:focus {
						outline: -webkit-focus-ring-color auto 0px;
					}`
					: ""}
				.progress-ring__circle {
					transition: 0.35s stroke-dashoffset, 0.35s transform;
					// -90deg axis compensation
					transform: rotate(calc(-90deg + ${offsetAngle}deg));
					transform-origin: 50% 50%;
				}
			`}
		>
			<circle
				className="progress-ring__circle"
				stroke={color}
				fill="transparent"
				strokeWidth={highlight ? stroke + 4 : stroke}
				strokeDasharray={circumference + " " + circumference}
				style={{ strokeDashoffset }}
				r={normalizedRadius}
				cx={radius}
				cy={radius}
			/>{" "}
		</svg>
	);

	return (
		<React.Fragment>
			{label ? (
				<Tippy content={label} trigger="focus">
					{svg}
				</Tippy>
			) : (
				svg
			)}
		</React.Fragment>
	);
});

export default Ring;
