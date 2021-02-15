import * as React from 'react';
import {render, screen} from '@testing-library/react';
import NoData from "../../components/NoData/NoData";

it('renders sample message', function () {
  const message = "Sample heading error message showing no data was found";
  render(<NoData message={message}/>);
  expect(screen.getByText(message)).toBeInTheDocument();
});
