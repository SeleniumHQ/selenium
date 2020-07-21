/** @jsx _jsx */

import React, { useState } from "react";
import { ReactComponent as SortIcon } from "../assets/icons/sorticon.svg";
import { css, jsx as _jsx } from "@emotion/core";

const highlitedColor = "#3bec70";
const normalColor = "#707070";

enum SelectState {
	up,
	down,
	inactive,
}

export default function SortButton({
	initialState = SelectState.inactive,
}: {
	initialState?: SelectState;
}) {
	let [state, setState] = useState(initialState);

	const onClickicon = (x: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
		state === SelectState.up
			? setState(SelectState.down)
			: setState(SelectState.up);
	};

/* 	const unSelect = () => {
		setState(SelectState.inactive);
	};
 */
  return (
		<SortIcon
			onClick={onClickicon}
			css={css`
				.arrow-1 {
					fill: none;
					stroke: ${state === SelectState.up ? highlitedColor : normalColor};
				}
				.arrow-2 {
					fill: none;
					stroke: ${state === SelectState.down ? highlitedColor : normalColor};
				}
			`}
		/>
	);
}

export { SelectState };
