import React from "react";

const TopBar = React.memo(() => {
	return (
		<div
			id="top-bar-sticky-wrapper"
			className="sticky-wrapper"
			style={{ height: "48px" }}
		>
			<div id="top-bar" style={{ width: "100%" }}>
				<div
					id="breadcrumbs"
					itemScope={false}
					itemType="http://data-vocabulary.org/Breadcrumb"
				>
					<span id="sidebar-toggle-span">
						<a
							href="#"
							id="sidebar-toggle"
							data-sidebar-toggle=""
							className="highlight"
						>
							<i className="fas fa-bars"></i>
						</a>
					</span>
				</div>
			</div>
		</div>
	);
});

export default TopBar;
