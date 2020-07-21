/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { ReactComponent as CircleIcon } from "../assets/icons/circle.svg";
import Tippy from "@tippyjs/react";
import React from "react";

/**
 * StatusType enum which is used along with the LABELS
 *
 * TODO think of a way to use just this instead of having this and LABELS
 */
export enum StatusType {
	/** All the running nodes */
	UP,
	/** All the UNAVAILABLE possibly down nodes */
	UNAVAILABLE,
	/** All the down nodes */
	DRAINING,
	/** All the idle but alive nodes */
	IDLE,
}

/** A set of states that the node can be in */
export const LABELS = ["UP", "UNAVAILABLE", "DRAINING", "IDLE"];

/** Maps string to StatusType Enum */
export const StringTypeToEnum = {
	[LABELS[0]]: StatusType.UP,
	[LABELS[1]]: StatusType.UNAVAILABLE,
	[LABELS[2]]: StatusType.DRAINING,
	[LABELS[3]]: StatusType.IDLE,
};

// TODO make unknown idle

/** The label colors
 *
 * TODO create a separate css file and a config.js file which allows
 * modifying these values where we can select whether to use
 * `config.css` or `config.json(?)` for setting these colors
 */
export const LABEL_COLORS: { [key in StatusType]: string } = {
	[StatusType.UP]: "#3BEC70",
	[StatusType.IDLE]: "#E4D400",
	[StatusType.DRAINING]: "#E40000",
	[StatusType.UNAVAILABLE]: "#8b8b8b",
};

export const Status = React.memo(
	(props: { status: string; selected?: number }) => {
		let { status, selected = -1 } = props;

		return (
			<div
				css={css`
					display: flex;
					justify-content: start;
					align-items: center;
				`}
			>
				<div>
					<Tippy content={status}>
						<CircleIcon
							css={css`
								fill: ${LABEL_COLORS[StringTypeToEnum[status]]};
								float: left;
							`}
							width={15}
							height={15}
						/>
					</Tippy>
				</div>
				{selected !== -1 && (
					<div>
						<i>({LABELS[selected]})</i>
					</div>
				)}
			</div>
		);
	}
);
