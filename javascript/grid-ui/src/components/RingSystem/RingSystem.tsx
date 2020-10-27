/** @jsx _jsx */

import { css, jsx as _jsx } from "@emotion/core";
import Tippy from "@tippyjs/react";
import React, { Ref, useCallback, useEffect, useState } from "react";
import { followCursor } from "tippy.js";
import "tippy.js/dist/tippy.css"; // required for styling tippy
import { ReactComponent as ClearIcon } from "../../assets/icons/clear.svg";
import RingDetails from "../../models/rings";
import { LABELS } from "../Status";
import ColorInfo from "./ColorInfo/ColorInfo";
import Ring from "./Ring/Ring";
import { GridConfig } from "../../config";

export interface RingRef {
	/** Saves the filter state based on the index. Pass -1 to clear the filter, default: -1 */
	saveFilterState: Function;
}

export interface RingSystemProps {
	/** State of the Rings */
	details: RingDetails;
	/**  `showLabels` default: true. Will show labels beside the ring*/
	showLabels?: boolean;
	/**  `textFormat` The center text format, default = `:freePercent:% free`*/
	textFormat?: string;
	/** `radius` Radius in pixels*/
	radius?: number;
	/** `stroke` Stroke width in pixels*/
	stroke?: number;
	children?: JSX.Element;

	/**  A callback which will be called when one of the rings is clicked */
	ringFilterCallback?: Function;
}

/**
 *	A set of rings
 *
 *  Use intellisense for how to use the props
 */
const RingSystem = React.memo(
	React.forwardRef((props: RingSystemProps, ref: Ref<RingRef>) => {
		let {
			details: { count, progresses },
			radius = GridConfig.ringsystem.defaultRingRadius,
			stroke = GridConfig.ringsystem.defaultRingStroke,
			showLabels = false,
			// TODO document this
			// Look at all possible variables that can be used in the center
			textFormat = ":freePercent:% free",
			children,
			ringFilterCallback = undefined,
		} = props;
		let normalizedRadius = radius - stroke;

		// NO state required as it should reset every render
		let offsets = [0];

		let [index, setIndex] = useState(-1);
		let [filterIndex, setFilterIndex] = useState(-1);

		const [istippyVisible, setVisible] = useState(false);
		const showTippy = () => {
			// if not visible show to prevent multiple renders
			if (!istippyVisible) setVisible(true);
		};
		const hideTippy = () => {
			// if visible hide to prevent multiple renders
			if (istippyVisible) setVisible(false);
		};

		let [currentTooltipContent, setcurrentTooltipContent] = useState("loading");
		let totalProgress = 0;

		const parentCB = useCallback(
			(child: string) => {
				if (currentTooltipContent !== child) setcurrentTooltipContent(child);
			},
			[currentTooltipContent]
		);

		// re renders whenever these change
		useEffect(() => {
			if (index === -1) return;
			if (index === Object.keys(progresses).length) {
				parentCB(`${100 - totalProgress}% unknown`);
				return;
			}
			parentCB(`${progresses[index].progress}% ${LABELS[index]}`);
		}, [index, parentCB, progresses, totalProgress]);

		// To calculate the ring offset positions
		Object.values(progresses).forEach((x) => {
			totalProgress += x.progress;
			offsets.push(totalProgress);
		});
		// Add one 100 at the end for the logic in the loop in ringIndexFromCoords
		offsets.push(100);

		/**
		 *
		 * @param x2 X coord of the mouse relative to parent
		 * @param y2 Y coord of the mouse relative to parent
		 *
		 * Returns the index of the ring which exists at the given coords
		 * Returns -1 if outside the ring arc area
		 */
		const ringIndexFromCoords = (x2: number, y2: number) => {
			const [x1, y1] = [radius, radius];
			const distsquared = distSq(x1, y1, x2, y2);

			// covers more area to maximize tippy's visibile time
			// coputing if mouse is on the arc region
			if (
				distsquared < radius ** 2 &&
				distsquared > (normalizedRadius - stroke) ** 2
			) {
				let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
				// circle rotation compensation
				// check css in the Ring component
				angle += 90;
				// angle will be < 0 when in 2nd quadrant
				// it will be 0-90 Q1, 90-180 Q4, 180-270 Q3 then (-90, 0) Q2
				// Making it positive to bring it to 270-360
				if (angle < 0) {
					angle += 360;
				}
				const offAngles = offsets.map((o) => (o * 360) / 100);

				// could be more efficient like binary search
				// but not really needed as number of rings are gauranteed to be <= 5
				// So worst case is 5 iterations o(n)
				let currentIndex = -1;
				for (var i = 1; i <= offAngles.length; i++) {
					// using >= and <= so we will not get -1 when crossing length-1 to 0 ring
					if (offAngles[i - 1] <= angle && offAngles[i] >= angle) {
						currentIndex = i - 1;
						break;
					}
				}
				return currentIndex;
			}
			return -1;
		};

		/**
		 *
		 * @param evt React onclick mouse event
		 *
		 * Handles the filtering of the shown stuff based on the clicked index
		 */
		const handleClick = (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
			// If no callback was given it's just a normal no filter ring
			if (ringFilterCallback === undefined) {
				return;
			}
			const [x2, y2] = [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY];
			const currentFilterIndex = ringIndexFromCoords(x2, y2);

			saveFilterState(currentFilterIndex);
		};

		// To expose child methods to parent
		React.useImperativeHandle(ref, () => ({
			saveFilterState,
		}));

		const saveFilterState = (currentFilterIndex = -1) => {
			if (filterIndex !== currentFilterIndex) {
				setFilterIndex(currentFilterIndex);
			}
			ringFilterCallback!(currentFilterIndex);
		};

		// A method to handle the tippy based on the mouseevent
		const handleTippy = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			const [x2, y2] = [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY];
			const currentIndex = ringIndexFromCoords(x2, y2);

			if (currentIndex !== -1) {
				// update the state if index changes
				if (index !== currentIndex) {
					setIndex(currentIndex);
				}
				showTippy();
			} else {
				// outside the ring or inside the ring i.e. not on the arc
				hideTippy();
			}
		};

		/** Square of dist between two coords */
		const distSq = (x1: number, y1: number, x2: number, y2: number) => {
			return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
		};

		// can be removed as progress will not be > 100
		// because we calculate progress from (n / total nodes) which will all add up
		if (totalProgress > 100) {
			// checks if progress > 100 then makes it 100
			Object.keys(progresses).forEach((x) => {
				const idx = parseInt(x);
				progresses[idx].progress /= totalProgress;
				progresses[idx].progress = Math.round(progresses[idx].progress * 100);
			});
			totalProgress = 100;
		}

		return (
			<div
				css={css`
					display: flex;
					align-items: center;
				`}
			>
				<div
					css={css`
						z-index: 1; // ontop of the clear option at z-index 0
						width: 40%;
						position: relative;
						height: ${radius * 2}px;
						width: ${radius * 2}px;
						min-width: ${radius * 2}px;
					`}
					onClick={handleClick}
					onMouseMove={(ev) => handleTippy(ev)}
					// onMouseOut={hideTippy} // TODO what's the difference b/w leave, out ???
					onMouseLeave={hideTippy}
				>
					<Tippy
						visible={istippyVisible}
						followCursor={true}
						plugins={[followCursor]}
						content={currentTooltipContent}
					>
						<div id="tippy-controller"></div>
					</Tippy>
					{/* https://stackoverflow.com/a/23714832/8608146 */}
					{children}
					<div
						css={css`
							position: absolute;
							left: 50%;
							top: 50%;
							transform: translate(-50%, -50%);
						`}
					>
						{textFormat.replace(
							RegExp(/:freePercent:/g),
							`${totalProgress}`
						)}
					</div>
					{[...Array(count)].map((_, i) => (
						<Ring
							key={i}
							label={LABELS[i]}
							id={`ring-${i}`}
							highlight={filterIndex === i}
							color={progresses[i].color}
							offset={offsets[i]}
							radius={radius}
							progress={progresses[i].progress}
							stroke={stroke}
							parentCB={parentCB}
						/>
					))}
					{/* Residual ring i.e. left out 100 - percent */}
					{/* Or we can show a full circle as the background i.e. at the very beginning */}
					<Ring
						id={"ring-unknown"}
						color={"#707070"}
						offset={totalProgress}
						radius={radius}
						progress={100 - totalProgress}
						stroke={stroke}
						parentCB={parentCB}
					/>
				</div>
				<div
					css={css`
						width: 60%;
					`}
				>
					<div>
						{/* Display only when there's an active filter */}
						{filterIndex !== -1 && (
							<Tippy
								content={"clear filter"}
								followCursor={true}
								// To remove focus trigger
								trigger={"mouseenter click"}
								plugins={[followCursor]}
							>
								<button
									css={css`
										border: none;
										background: none;
										color: inherit;
										padding: 0;
										font: inherit;
										cursor: pointer;
										outline: inherit;
									`}
									onClick={() => saveFilterState(-1)}
								>
									<ClearIcon
										css={css`
											z-index: 0;
											transform: translate(-14px, 0px);
										`}
									/>
								</button>
							</Tippy>
						)}{" "}
						{(() => {
							if (count > 7) count = 7;
						})()}
						{showLabels &&
							[...Array(count)].map((_, i) => {
								const ret = (
									<ColorInfo
										key={i}
										id={`info-icon-${i}`}
										color={progresses[i].color}
										progress={progresses[i].progress}
										text={LABELS[i]}
									/>
								);
								return ret;
							})}
						{showLabels && (
							<ColorInfo
								id={`info-icon-noman`}
								color={"#707070"}
								progress={100 - totalProgress}
								text={"unknown"}
							/>
						)}
					</div>
				</div>
			</div>
		);
	})
);

export default RingSystem;
