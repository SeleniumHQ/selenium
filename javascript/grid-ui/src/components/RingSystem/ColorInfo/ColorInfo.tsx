/** @jsx _jsx */

import { css, jsx as _jsx } from "@emotion/core";
import Tippy from "@tippyjs/react";
import React from "react";
import { ReactComponent as CircleIcon } from "../../../assets/icons/circle.svg";

// TODO https://reactjs.org/docs/react-api.html#reactmemo
// Look at isequal
const ColorInfo = React.memo(
	(props: { color: string; text: string; id: string; progress: number }) => {
		const { color, text, id, progress } = props;

		return (
			<React.Fragment>
				{progress <= 0 ? (
					// nothing if progress is full
					// This will be the one returned always for the grid
					<React.Fragment></React.Fragment>
				) : (
					<div
						css={css`
							height: 20px;
							display: flex;
							align-items: center;
						`}
					>
						<Tippy content={`${progress}%`} placement="left">
							<CircleIcon
								id={id}
								css={css`
									fill: ${color};
								`}
							/>
						</Tippy>
						<div
							css={css`
								padding-left: 6px;
							`}
						>
							{text}
						</div>
					</div>
				)}
			</React.Fragment>
		);
	}
);

export default ColorInfo;
