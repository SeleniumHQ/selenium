import * as React from 'react';
import {render, screen} from '@testing-library/react';
import Error from "../../components/Error/Error";

it('renders error message', function () {
  const message = "Sample heading error message";
  const errorMessage = "An error happening while rendering the app"
  render(<Error message={message} errorMessage={errorMessage}/>);
  expect(screen.getByText(message)).toBeInTheDocument();
  expect(screen.getByText(errorMessage)).toBeInTheDocument();
});
