/** @jsx _jsx */
import { css, jsx as _jsx } from "@emotion/core";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import clsx from "clsx";
import { loader } from "graphql.macro";
import React from "react";
import NodeType from "../../../models/node";
import ReactJson from "react-json-view";
import { getLogo } from "../../../models/browsers";

// Not using this query for getting a single node
// Because in Nodes.tsx we get all the attrs of all the existing Nodes
// Incase we might need this leaving it here
// eslint-disable-next-line
const NODE_QUERY = loader("../../../graphql/node.gql");

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			maxWidth: 345,
		},
		expand: {
			transform: "rotate(0deg)",
			marginLeft: "auto",
			transition: theme.transitions.create("transform", {
				duration: theme.transitions.duration.shortest,
			}),
		},
		expandOpen: {
			transform: "rotate(180deg)",
		},
	})
);

const NodeInfo = React.memo(
	(props: {
		node: NodeType | undefined;
		closecallback?: () => void;
		match?: {
			isExact: boolean;
			params: { id: string };
			path: string;
			url: string;
		};
	}) => {
		const node = props.node;

		const classes = useStyles();
		// By default it will be expanded
		const [expanded, setExpanded] = React.useState(true);

		const handleExpandClick = () => setExpanded((exp) => !exp);

		if (node === undefined) return <React.Fragment></React.Fragment>;

		let logos = (
			<div
				css={css`
					display: flex;
					flex-direction: column;
				`}
			>
				{node.capabilities?.map((c) => (
					<div key={c.browserName}>
						{[...Array(c.slots)].map((_, i) => (
							<img
								css={css`
									margin: 0 !important;
								`}
								key={i}
								alt={c.browserName}
								src={getLogo(c.browserName)}
								width="20"
								height="20"
								title={`${c.browserName} ${i+1}/${c.slots}`}
								style={{ float: "left" }}
							/>
						))}
					</div>
				))}
			</div>
		);

		return (
			<Card
				className={classes.root}
				css={css`
					padding-top: 30px;
					padding-right: 1vw;
					padding-left: 1vw;
					// Only translate up when used as a node info card
					${props.closecallback ? "transform: translate(2vw, -21vh);" : ""}
				`}
			>
				<CardHeader
					action={
						props.closecallback && (
							<IconButton aria-label="close" onClick={props.closecallback}>
								<CloseIcon />
							</IconButton>
						)
					}
					/* TODO get selenium version from server */
					title={"version : selenium-4.0.0-alpha-6"}
					// subheader="TODO: last active time"
				/>
				<CardContent>{logos}</CardContent>
				<CardActions disableSpacing>
					<IconButton
						className={clsx(classes.expand, {
							[classes.expandOpen]: expanded,
						})}
						onClick={handleExpandClick}
						aria-expanded={expanded}
						aria-label="show more"
					>
						<ExpandMoreIcon />
					</IconButton>
				</CardActions>
				<Collapse in={expanded} timeout="auto" unmountOnExit>
					<CardContent>
						<ReactJson src={node} theme="monokai" />
					</CardContent>
				</Collapse>
			</Card>
		);
	}
);

export default NodeInfo;
