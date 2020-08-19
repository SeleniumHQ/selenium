// https://github.com/vercel/next.js/issues/11230#issuecomment-643595034

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as SearchIcon } from "../../assets/icons/search2.svg";
import { ReactComponent as TimesIcon } from "../../assets/icons/times.svg";
import seleniumIcon from "../../assets/selenium.svg";
import "../../css/icons.css";
import styles from "./NavBar.module.css";
import searchHighlight from "../../core/Search";
import "./NavBar.css";
import KeyBoardHelp from "../KeyBoard/KeyBoardHelp";

/**
 * 	NavBar component, includes search bar and search functions
 *  Look at `core/Search.ts` for the highlight function
 */
export default function NavBar() {
	let [prevSearch, setPrevSearch] = useState<any>();
	let [prevTerm, setPrevTerm] = useState<string>("");

	const searchTerminDOM = (term: string) => {
		if (prevSearch) {
			prevSearch.revert();
		}
		if (term && term !== "") {
			prevSearch = searchHighlight(term);
			setPrevSearch(prevSearch);
		}
		setPrevTerm(term);
	};

	const rerunSearch = () => searchTerminDOM(prevTerm);
	window.rerunSearch = rerunSearch;

	const clearSearch = () => {
		const searchBar = document.getElementById("search-by") as HTMLInputElement;
		searchBar.value = "";
		// revert prev search as well
		searchTerminDOM("");
	};

	return (
		<React.Fragment>
			<nav id="sidebar">
				<div id="header-wrapper">
					<div id="header" style={{ height: "70px" }}>
						<Link id="logo" to="/home">
							<img
								src={seleniumIcon}
								alt="logo"
								className={styles.iconDetails}
							/>
							<div
								style={{
									marginLeft: "60px",
									marginTop: "5px",
								}}
							>
								<h3 className={styles.h4}>Selenium Grid</h3>
							</div>
						</Link>
					</div>

					<div className="searchbox">
						<label htmlFor="search-by">
							<SearchIcon className="icon-green" />
						</label>
						<input
							data-search-input=""
							id="search-by"
							type="search"
							placeholder="Search..."
							autoComplete="off"
							onChange={(ev) => searchTerminDOM(ev.target.value)}
						/>
						<span data-search-clear="">
							<TimesIcon className="icon-green" onClick={clearSearch} />
						</span>
					</div>
				</div>
				<div className="highlightable ps-container ps-theme-default ps-active-y">
					<ul className="topics">
						<li data-nav-id="/console" title="Console" className="dd-item">
							<Link to="/console">Console</Link>
						</li>
						<li data-nav-id="/hub/" title="Hub" className="dd-item parent">
							<Link to="/hub">
								Hub
								<i className="fas fa-check read-icon"></i>
							</Link>
						</li>
						<li data-nav-id="/docs/" title="Docs" className="dd-item parent">
							<a href="https://www.selenium.dev/documentation/en/grid/">
								Docs
								<i className="fas fa-check read-icon"></i>
							</a>

							<ul>
								<li
									data-nav-id="/grid/purposes_and_main_functionalities/"
									title="Purposes and main functionalities"
									className="dd-item "
								>
									<a href="https://www.selenium.dev/documentation/en/grid/purposes_and_main_functionalities/">
										Purposes and functionalities
										<i className="fas fa-check read-icon"></i>
									</a>
								</li>

								<li
									data-nav-id="/grid/when_to_use_grid/"
									title="When to use Grid"
									className="dd-item "
								>
									<a href="https://www.selenium.dev/documentation/en/grid/when_to_use_grid/">
										When to use Grid
										<i className="fas fa-check read-icon"></i>
									</a>
								</li>

								<li
									data-nav-id="/grid/grid_4/"
									title="Grid 4"
									className="dd-item"
								>
									<a href="https://www.selenium.dev/documentation/en/grid/grid_4/">
										Grid 4<i className="fas fa-check read-icon"></i>
									</a>

									<ul>
										<li
											data-nav-id="/grid/grid_4/components_of_a_grid/"
											title="Components"
											className="dd-item "
										>
											<a href="https://www.selenium.dev/documentation/en/grid/grid_4/components_of_a_grid/">
												Components
												<i className="fas fa-check read-icon"></i>
											</a>
										</li>
									</ul>
								</li>
							</ul>
						</li>
					</ul>
				</div>
				<KeyBoardHelp />
			</nav>
		</React.Fragment>
	);
}
